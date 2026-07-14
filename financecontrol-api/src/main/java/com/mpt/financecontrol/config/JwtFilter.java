package com.mpt.financecontrol.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mpt.financecontrol.exceptions.ErroResponseDto;
import com.mpt.financecontrol.usuario.entity.Role;
import com.mpt.financecontrol.usuario.entity.Usuario;
import com.mpt.financecontrol.usuario.repository.UsuarioRepository;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UsuarioRepository usuarioRepository;
    private final ObjectMapper mapper = new ObjectMapper();

    public JwtFilter(JwtUtil jwtUtil, UsuarioRepository usuarioRepository) {
        this.jwtUtil = jwtUtil;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        String token = (header != null && header.startsWith("Bearer ")) ? header.substring(7) : null;

        if (token != null) {
            try {
                UUID id = jwtUtil.getId(token);
                Role role = jwtUtil.getRole(token);

                Usuario usuario = usuarioRepository.findById(id).orElse(null);
                if (usuario == null || !usuario.getAtivo()) {
                    escreverErro(request, response, "Usuário inativo ou não encontrado");
                    return;
                }

                List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));

                if (SecurityContextHolder.getContext().getAuthentication() == null) {
                    var auth = new UsernamePasswordAuthenticationToken(id, null, authorities);
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            } catch (JwtException | IllegalArgumentException e) {
                SecurityContextHolder.clearContext();
                escreverErro(request, response, "Token inválido ou expirado");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private void escreverErro(HttpServletRequest request, HttpServletResponse response, String mensagem) throws IOException {
        ErroResponseDto erro = new ErroResponseDto();
        erro.setErro(mensagem);
        erro.setCodigo(HttpServletResponse.SC_UNAUTHORIZED);
        erro.setTimestamp(new Date());
        erro.setPath(request.getRequestURI());

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write(mapper.writeValueAsString(erro));
    }
}
