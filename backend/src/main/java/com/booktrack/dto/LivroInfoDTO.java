package com.booktrack.dto;

/**
 * Dados de um livro obtidos a partir de uma busca (por ISBN ou por
 * título) na API externa (Google Books). Usado apenas para
 * pré-preencher o formulário no app — não é persistido diretamente.
 */
public class LivroInfoDTO {
    private String isbn;
    private String titulo;
    private String autor;
    private Integer ano;
    private String genero;
    private String capaUrl;
    private String descricao;

    public LivroInfoDTO() {}

    public String getIsbn() { return isbn; }
    public void setIsbn(String isbn) { this.isbn = isbn; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getAutor() { return autor; }
    public void setAutor(String autor) { this.autor = autor; }

    public Integer getAno() { return ano; }
    public void setAno(Integer ano) { this.ano = ano; }

    public String getGenero() { return genero; }
    public void setGenero(String genero) { this.genero = genero; }

    public String getCapaUrl() { return capaUrl; }
    public void setCapaUrl(String capaUrl) { this.capaUrl = capaUrl; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
}