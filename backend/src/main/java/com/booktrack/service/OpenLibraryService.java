package com.booktrack.service;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.booktrack.dto.LivroInfoDTO;
import com.booktrack.exception.ResourceNotFoundException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class OpenLibraryService {

    private static final String SEARCH_URL = "https://openlibrary.org/search.json";
    private static final String ISBN_URL = "https://openlibrary.org/api/books";

    @Autowired
    private RestTemplate restTemplate;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // ---------- Buscar por ISBN (devolve 1 resultado) ----------

    public LivroInfoDTO buscarPorIsbn(String isbnOriginal) {
        String isbn = isbnOriginal.replaceAll("[^0-9Xx]", "");
        if (isbn.isBlank()) {
            throw new IllegalArgumentException("ISBN inválido");
        }

        String url = UriComponentsBuilder.fromUriString(ISBN_URL)
                .queryParam("bibkeys", "ISBN:" + isbn)
                .queryParam("format", "json")
                .queryParam("jscmd", "data")
                .toUriString();

        JsonNode raiz = consultar(url);
        JsonNode livro = raiz.path("ISBN:" + isbn);

        if (livro.isMissingNode() || livro.isEmpty()) {
            throw new ResourceNotFoundException("Nenhum livro encontrado para o ISBN: " + isbnOriginal);
        }

        return montarInfoPorIsbn(livro, isbn);
    }

    // ---------- Buscar por título (devolve vários resultados) ----------

    public List<LivroInfoDTO> buscarPorTitulo(String titulo) {
    if (titulo == null || titulo.isBlank()) {
        throw new IllegalArgumentException("Título inválido");
    }

    String url = UriComponentsBuilder.fromUriString(SEARCH_URL)
            .queryParam("q", "title:\"" + titulo + "\"")
            .queryParam("fields", "title,author_name,isbn,first_publish_year,cover_i")
            .queryParam("limit", 15)
            .toUriString();

    JsonNode raiz = consultar(url);
    JsonNode docs = raiz.path("docs");

    List<LivroInfoDTO> resultados = new ArrayList<>();
    for (JsonNode doc : docs) {
        LivroInfoDTO info = montarInfoPorTitulo(doc);
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

    private JsonNode consultar(String url) {
        String corpo;
        try {
            corpo = restTemplate.getForObject(URI.create(url), String.class);
        } catch (RestClientException e) {
            throw new ResourceNotFoundException("Não foi possível consultar o serviço de livros no momento");
        }
        try {
            return objectMapper.readTree(corpo);
        } catch (Exception e) {
            throw new ResourceNotFoundException("Resposta inválida do serviço de livros");
        }
    }

    private LivroInfoDTO montarInfoPorTitulo(JsonNode doc) {
        LivroInfoDTO info = new LivroInfoDTO();
        info.setTitulo(textoOuNull(doc, "title"));
        info.setIsbn(extrairPrimeiroIsbn(doc));
        info.setAutor(extrairAutoresBusca(doc));
        JsonNode ano = doc.path("first_publish_year");
        info.setAno(ano.isMissingNode() || ano.isNull() ? null : ano.asInt());
        info.setCapaUrl(extrairCapaBusca(doc));
        return info;
    }

    private LivroInfoDTO montarInfoPorIsbn(JsonNode livro, String isbn) {
        LivroInfoDTO info = new LivroInfoDTO();
        info.setIsbn(isbn);
        info.setTitulo(textoOuNull(livro, "title"));
        info.setAutor(extrairAutoresDetalhe(livro));
        info.setAno(extrairAnoDetalhe(livro));
        info.setGenero(extrairGeneroDetalhe(livro));
        info.setCapaUrl(extrairCapaDetalhe(livro));
        return info;
    }

    private String extrairPrimeiroIsbn(JsonNode doc) {
        JsonNode isbns = doc.path("isbn");
        return (isbns.isArray() && !isbns.isEmpty()) ? isbns.get(0).asText() : null;
    }

    private String extrairAutoresBusca(JsonNode doc) {
        JsonNode autores = doc.path("author_name");
        if (!autores.isArray() || autores.isEmpty()) return null;
        List<String> nomes = new ArrayList<>();
        autores.forEach(n -> nomes.add(n.asText()));
        return String.join(", ", nomes);
    }

    private String extrairCapaBusca(JsonNode doc) {
        JsonNode coverId = doc.path("cover_i");
        if (coverId.isMissingNode() || coverId.isNull()) return null;
        return "https://covers.openlibrary.org/b/id/" + coverId.asText() + "-M.jpg";
    }

    private String extrairAutoresDetalhe(JsonNode livro) {
        JsonNode autores = livro.path("authors");
        if (!autores.isArray() || autores.isEmpty()) return null;
        List<String> nomes = new ArrayList<>();
        for (JsonNode a : autores) {
            String nome = textoOuNull(a, "name");
            if (nome != null) nomes.add(nome);
        }
        return nomes.isEmpty() ? null : String.join(", ", nomes);
    }

    private Integer extrairAnoDetalhe(JsonNode livro) {
        String publishDate = textoOuNull(livro, "publish_date");
        if (publishDate == null) return null;
        // publish_date costuma vir como "1961" ou "March 1, 1961"
        java.util.regex.Matcher m = java.util.regex.Pattern.compile("(19|20)\\d{2}").matcher(publishDate);
        return m.find() ? Integer.parseInt(m.group()) : null;
    }

    private String extrairGeneroDetalhe(JsonNode livro) {
        JsonNode subjects = livro.path("subjects");
        if (!subjects.isArray() || subjects.isEmpty()) return null;
        return textoOuNull(subjects.get(0), "name");
    }

    private String extrairCapaDetalhe(JsonNode livro) {
        JsonNode cover = livro.path("cover");
        if (cover.isMissingNode()) return null;
        JsonNode medium = cover.path("medium");
        return medium.isMissingNode() ? textoOuNull(cover, "small") : medium.asText();
    }

    private String textoOuNull(JsonNode node, String campo) {
        JsonNode valor = node.path(campo);
        return valor.isMissingNode() || valor.isNull() ? null : valor.asText();
    }
}