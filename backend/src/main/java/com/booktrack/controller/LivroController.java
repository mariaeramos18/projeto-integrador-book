package com.booktrack.controller;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.booktrack.dto.LivroInfoDTO;
import com.booktrack.dto.LivroRequestDTO;
import com.booktrack.dto.LivroResponseDTO;
import com.booktrack.model.Livro;
import com.booktrack.model.LivroStatus;
import com.booktrack.repository.UsuarioRepository;
import com.booktrack.service.JwtUtil;
import com.booktrack.service.LivroService;
import com.booktrack.service.OpenLibraryService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/livros")
public class LivroController {

    @Autowired
    private LivroService service;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
private OpenLibraryService openLibraryService; 

    // Extrai o usuário do token JWT enviado no header Authorization
    private Long extrairUsuarioId(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Token JWT ausente ou inválido");
        }
        String token = authHeader.substring(7);
        String email = jwtUtil.extrairEmail(token);
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"))
                .getId();
    }

    @GetMapping
    public ResponseEntity<?> listar(
            @RequestParam(required = false) String status,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long usuarioId = extrairUsuarioId(authHeader);
            LivroStatus filtro = status != null ? LivroStatus.valueOf(status.toUpperCase()) : null;
            List<LivroResponseDTO> response = service.listarTodos(usuarioId, filtro)
                    .stream()
                    .map(LivroResponseDTO::new)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Token inválido ou expirado"));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscar(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long usuarioId = extrairUsuarioId(authHeader);
            Livro livro = service.buscarPorId(id, usuarioId);
            return ResponseEntity.ok(new LivroResponseDTO(livro));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Token inválido ou expirado"));
        }
    }

    @GetMapping("/buscar-isbn/{isbn}")
    public ResponseEntity<?> buscarPorIsbn(
            @PathVariable String isbn,
            @RequestHeader("Authorization") String authHeader) {
        try {
            extrairUsuarioId(authHeader);
            LivroInfoDTO info = openLibraryService.buscarPorIsbn(isbn);
            return ResponseEntity.ok(info);
        } catch (com.booktrack.exception.ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Token inválido ou expirado"));
        }
    }

    @GetMapping("/buscar-titulo")
    public ResponseEntity<?> buscarPorTitulo(
            @RequestParam String titulo,
            @RequestHeader("Authorization") String authHeader) {
        try {
            extrairUsuarioId(authHeader);
            List<LivroInfoDTO> resultados = openLibraryService.buscarPorTitulo(titulo);
            return ResponseEntity.ok(resultados);
        } catch (com.booktrack.exception.ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Token inválido ou expirado"));
        }
    }

    @PostMapping
    public ResponseEntity<?> criar(
            @Valid @RequestBody LivroRequestDTO dto,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long usuarioId = extrairUsuarioId(authHeader);
            Livro novoLivro = service.salvar(dto, usuarioId);
            return ResponseEntity.status(HttpStatus.CREATED).body(new LivroResponseDTO(novoLivro));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Token inválido ou expirado"));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody LivroRequestDTO dto,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long usuarioId = extrairUsuarioId(authHeader);
            Livro livroAtualizado = service.atualizar(id, dto, usuarioId);
            return ResponseEntity.ok(new LivroResponseDTO(livroAtualizado));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Token inválido ou expirado"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletar(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long usuarioId = extrairUsuarioId(authHeader);
            service.deletar(id, usuarioId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Token inválido ou expirado"));
        }
    }
}