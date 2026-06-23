package com.booktrack.repository;

import com.booktrack.model.Livro;
import com.booktrack.model.LivroStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LivroRepository extends JpaRepository<Livro, Long> {

    List<Livro> findByStatus(LivroStatus status);

    // Novos métodos filtrando por usuário
    List<Livro> findByUsuarioId(Long usuarioId);

    List<Livro> findByUsuarioIdAndStatus(Long usuarioId, LivroStatus status);

    Optional<Livro> findByIdAndUsuarioId(Long id, Long usuarioId);
}