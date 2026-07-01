package com.booktrack.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.booktrack.dto.LivroRequestDTO;
import com.booktrack.exception.ResourceNotFoundException;
import com.booktrack.model.Livro;
import com.booktrack.model.LivroStatus;
import com.booktrack.model.Usuario;
import com.booktrack.repository.LivroRepository;
import com.booktrack.repository.UsuarioRepository;

@Service
public class LivroService {

    @Autowired
    private LivroRepository repository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    public List<Livro> listarTodos(Long usuarioId, LivroStatus status) {
        if (status != null) {
            return repository.findByUsuarioIdAndStatus(usuarioId, status);
        }
        return repository.findByUsuarioId(usuarioId);
    }

    public Livro buscarPorId(Long id, Long usuarioId) {
        return repository.findByIdAndUsuarioId(id, usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Livro não encontrado com id: " + id));
    }

    public Livro salvar(LivroRequestDTO dto, Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        Livro livro = new Livro();
        livro.setTitulo(dto.getTitulo());
        livro.setAutor(dto.getAutor());
        livro.setAno(dto.getAno());
        livro.setGenero(dto.getGenero());
        livro.setIsbn(dto.getIsbn());
        livro.setCapaUrl(dto.getCapaUrl());
        livro.setStatus(dto.getStatus());
        livro.setNota(dto.getNota());
        livro.setComentario(dto.getComentario());
        livro.setUsuario(usuario);

        return repository.save(livro);
    }

    public Livro atualizar(Long id, LivroRequestDTO dto, Long usuarioId) {
        Livro livro = buscarPorId(id, usuarioId);
        livro.setTitulo(dto.getTitulo());
        livro.setAutor(dto.getAutor());
        livro.setAno(dto.getAno());
        livro.setGenero(dto.getGenero());
        livro.setIsbn(dto.getIsbn());
        livro.setCapaUrl(dto.getCapaUrl());
        livro.setStatus(dto.getStatus());
        livro.setNota(dto.getNota());
        livro.setComentario(dto.getComentario());
        return repository.save(livro);
    }

    public void deletar(Long id, Long usuarioId) {
        Livro livro = buscarPorId(id, usuarioId);
        repository.delete(livro);
    }
}