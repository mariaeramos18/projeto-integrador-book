package com.booktrack.dto;

import java.time.LocalDateTime;

import com.booktrack.model.Livro;
import com.booktrack.model.LivroStatus;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class LivroResponseDTO {
    private Long id;
    private String titulo;
    private String autor;
    private Integer ano;
    private String genero;
    private String isbn;
    private String capaUrl;
    private LivroStatus status;
    private Integer nota;
    private String comentario;
    private LocalDateTime criadoEm;

    // Construtor que recebe a entidade e popula o DTO
    public LivroResponseDTO(Livro livro) {
        this.id = livro.getId();
        this.titulo = livro.getTitulo();
        this.autor = livro.getAutor();
        this.ano = livro.getAno();
        this.genero = livro.getGenero();
        this.isbn = livro.getIsbn();
        this.capaUrl = livro.getCapaUrl();
        this.status = livro.getStatus();
        this.nota = livro.getNota();
        this.comentario = livro.getComentario();
        this.criadoEm = livro.getCriadoEm();
    }
}