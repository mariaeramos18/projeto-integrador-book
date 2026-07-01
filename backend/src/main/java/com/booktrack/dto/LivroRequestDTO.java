package com.booktrack.dto;

import com.booktrack.model.LivroStatus;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class LivroRequestDTO {

    @NotBlank(message = "Título é obrigatório")
    private String titulo;

    @NotBlank(message = "Autor é obrigatório")
    private String autor;

    @NotNull(message = "Ano é obrigatório")
    @Min(1900)
    @Max(2026)
    private Integer ano;

    private String genero;
    
    private String isbn;

    private String capaUrl;

    @NotNull(message = "Status é obrigatório")
    private LivroStatus status;

    @Min(1)
    @Max(5)
    private Integer nota;

    private String comentario;

    // Getters e Setters (você pode gerar com Lombok @Data ou manualmente)
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getAutor() { return autor; }
    public void setAutor(String autor) { this.autor = autor; }
    public Integer getAno() { return ano; }
    public void setAno(Integer ano) { this.ano = ano; }
    public String getGenero() { return genero; }
    public void setGenero(String genero) { this.genero = genero; }
    public String getIsbn() { return isbn; }
    public void setIsbn(String isbn) { this.isbn = isbn; }
    public String getCapaUrl() { return capaUrl; }
    public void setCapaUrl(String capaUrl) { this.capaUrl = capaUrl; }
    public LivroStatus getStatus() { return status; }
    public void setStatus(LivroStatus status) { this.status = status; }
    public Integer getNota() { return nota; }
    public void setNota(Integer nota) { this.nota = nota; }
    public String getComentario() { return comentario; }
    public void setComentario(String comentario) { this.comentario = comentario; }
}