package com.booktrack.service;
 
import com.booktrack.dto.LivroInfoDTO;
import com.booktrack.exception.ResourceNotFoundException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
 
import java.net.URI;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
 
@Service
public class GoogleBooksService {
 
    private static final String GOOGLE_BOOKS_BASE_URL = "https://www.googleapis.com/books/v1/volumes";
 
    @Autowired
    private RestTemplate restTemplate;
 
    private final ObjectMapper objectMapper = new ObjectMapper();
 
    // ---------- Buscar por ISBN (devolve 1 resultado) ----------
 
    public LivroInfoDTO buscarPorIsbn(String isbnOriginal) {
        String isbn = isbnOriginal.replaceAll("[^0-9Xx]", "");
        if (isbn.isBlank()) {
            throw new IllegalArgumentException("ISBN inválido");
        }
 
        String url = UriComponentsBuilder.fromUriString(GOOGLE_BOOKS_BASE_URL)
                .queryParam("q", "isbn:" + isbn)
                .toUriString();
 
        JsonNode items = buscarItems(url, "Nenhum livro encontrado para o ISBN: " + isbnOriginal);
 
        JsonNode volumeInfo = items.get(0).path("volumeInfo");
        return montarInfo(volumeInfo);
    }
 
    // ---------- Buscar por título (devolve vários resultados) ----------
 
    public List<LivroInfoDTO> buscarPorTitulo(String titulo) {
        if (titulo == null || titulo.isBlank()) {
            throw new IllegalArgumentException("Título inválido");
        }
 
        String url = UriComponentsBuilder.fromUriString(GOOGLE_BOOKS_BASE_URL)
                .queryParam("q", "intitle:" + titulo)
                .queryParam("maxResults", 15)
                .toUriString();
 
        JsonNode items = buscarItems(url, "Nenhum livro encontrado para o título: " + titulo);
 
        List<LivroInfoDTO> resultados = new ArrayList<>();
        for (JsonNode item : items) {
            JsonNode volumeInfo = item.path("volumeInfo");
            LivroInfoDTO info = montarInfo(volumeInfo);
            if (info.getIsbn() != null) {
                resultados.add(info);
            }
        }
 
        if (resultados.isEmpty()) {
            throw new ResourceNotFoundException("Nenhum livro com ISBN encontrado para o título: " + titulo);
        }
 
        return resultados;
    }
 
    // ---------- Métodos auxiliares ----------
 
    private JsonNode buscarItems(String url, String mensagemNaoEncontrado) {
        String corpo;
        try {
            corpo = restTemplate.getForObject(URI.create(url), String.class);
        } catch (RestClientException e) {
            throw new ResourceNotFoundException("Não foi possível consultar o serviço de livros no momento");
        }
 
        JsonNode raiz;
        try {
            raiz = objectMapper.readTree(corpo);
        } catch (Exception e) {
            throw new ResourceNotFoundException("Resposta inválida do serviço de livros");
        }
 
        JsonNode items = raiz.path("items");
        if (!items.isArray() || items.isEmpty()) {
            throw new ResourceNotFoundException(mensagemNaoEncontrado);
        }
        return items;
    }
 
    private LivroInfoDTO montarInfo(JsonNode volumeInfo) {
        LivroInfoDTO info = new LivroInfoDTO();
        info.setIsbn(extrairIsbn(volumeInfo));
        info.setTitulo(textoOuNull(volumeInfo, "title"));
        info.setAutor(extrairAutores(volumeInfo));
        info.setAno(extrairAno(volumeInfo));
        info.setGenero(extrairGenero(volumeInfo));
        info.setDescricao(textoOuNull(volumeInfo, "description"));
        info.setCapaUrl(extrairCapa(volumeInfo));
        return info;
    }
 
    private String textoOuNull(JsonNode node, String campo) {
        JsonNode valor = node.path(campo);
        return valor.isMissingNode() || valor.isNull() ? null : valor.asText();
    }
 
    private String extrairIsbn(JsonNode volumeInfo) {
        JsonNode identificadores = volumeInfo.path("industryIdentifiers");
        if (!identificadores.isArray() || identificadores.isEmpty()) {
            return null;
        }
 
        String isbn10 = null;
        for (JsonNode id : identificadores) {
            String tipo = textoOuNull(id, "type");
            String valor = textoOuNull(id, "identifier");
            if (valor == null) continue;
 
            if ("ISBN_13".equals(tipo)) {
                return valor;
            }
            if ("ISBN_10".equals(tipo)) {
                isbn10 = valor;
            }
        }
        return isbn10;
    }
 
    private String extrairAutores(JsonNode volumeInfo) {
        JsonNode autores = volumeInfo.path("authors");
        if (!autores.isArray() || autores.isEmpty()) {
            return null;
        }
        StringBuilder sb = new StringBuilder();
        Iterator<JsonNode> it = autores.elements();
        while (it.hasNext()) {
            sb.append(it.next().asText());
            if (it.hasNext()) sb.append(", ");
        }
        return sb.toString();
    }
 
    private Integer extrairAno(JsonNode volumeInfo) {
        String publishedDate = textoOuNull(volumeInfo, "publishedDate");
        if (publishedDate == null) return null;
        try {
            String anoStr = publishedDate.split("-")[0];
            return Integer.parseInt(anoStr);
        } catch (NumberFormatException e) {
            return null;
        }
    }
 
    private String extrairGenero(JsonNode volumeInfo) {
        JsonNode categorias = volumeInfo.path("categories");
        if (!categorias.isArray() || categorias.isEmpty()) {
            return null;
        }
        return categorias.get(0).asText();
    }
 
    private String extrairCapa(JsonNode volumeInfo) {
        JsonNode imageLinks = volumeInfo.path("imageLinks");
        if (imageLinks.isMissingNode()) return null;
        JsonNode thumbnail = imageLinks.path("thumbnail");
        if (thumbnail.isMissingNode()) {
            thumbnail = imageLinks.path("smallThumbnail");
        }
        return thumbnail.isMissingNode() ? null : thumbnail.asText();
    }
}
