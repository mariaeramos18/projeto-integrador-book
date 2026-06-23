package com.booktrack.controller;

import com.booktrack.dto.LivroRequestDTO;
import com.booktrack.dto.LivroResponseDTO;
import com.booktrack.model.Livro;
import com.booktrack.model.LivroStatus;
import com.booktrack.model.Usuario;
import com.booktrack.repository.UsuarioRepository;
import com.booktrack.service.JwtUtil;
import com.booktrack.service.LivroService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/livros")
public class LivroController {

    @Autowired
    private LivroService service;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UsuarioRepository usuarioRepository;

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