package com.booktrack.dto;

import com.booktrack.model.Livro;
import com.booktrack.model.LivroStatus;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class LivroResponseDTO {
    private Long id;
    private String titulo;
    private String autor;
    private Integer ano;
    private String genero;
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
        this.status = livro.getStatus();
        this.nota = livro.getNota();
        this.comentario = livro.getComentario();
        this.criadoEm = livro.getCriadoEm();
    }
}