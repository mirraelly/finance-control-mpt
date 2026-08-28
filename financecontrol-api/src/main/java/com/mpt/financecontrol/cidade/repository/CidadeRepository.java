package com.mpt.financecontrol.cidade.repository;

import com.mpt.financecontrol.cidade.entity.Cidade;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CidadeRepository extends JpaRepository<Cidade, UUID> {

    Optional<Cidade> findByCodigoIbge(Integer codigoIbge);

    Optional<Cidade> findByNomeIgnoreCaseAndEstadoId(String nome, UUID estadoId);

    @Query("SELECT c FROM Cidade c "
    +      "    WHERE c.ativo = true "
    +      "ORDER BY c.nome")
    List<Cidade> findForSelect();

    @Query(value = """
        SELECT * FROM cidade c
            WHERE (CAST(:nome AS text) IS NULL
                    OR unaccent(lower(c.nome)) LIKE unaccent(lower('%' || CAST(:nome AS text) || '%')))
                AND (CAST(:estadoId AS uuid) IS NULL OR c.estado_id = CAST(:estadoId AS uuid))
                AND (CAST(:codigoIbge AS integer) IS NULL OR c.codigo_ibge = CAST(:codigoIbge AS integer))
                AND (CAST(:ativo AS boolean) IS NULL OR c.ativo = CAST(:ativo AS boolean))
    """,
    countQuery = """
        SELECT count(*) FROM cidade c
            WHERE (CAST(:nome AS text) IS NULL
                    OR unaccent(lower(c.nome)) LIKE unaccent(lower('%' || CAST(:nome AS text) || '%')))
                AND (CAST(:estadoId AS uuid) IS NULL OR c.estado_id = CAST(:estadoId AS uuid))
                AND (CAST(:codigoIbge AS integer) IS NULL OR c.codigo_ibge = CAST(:codigoIbge AS integer))
                AND (CAST(:ativo AS boolean) IS NULL OR c.ativo = CAST(:ativo AS boolean))
    """,
    nativeQuery = true)
    Page<Cidade> findAllWithFilters(
            Pageable pageable,
            @Param("nome") String nome,
            @Param("estadoId") UUID estadoId,
            @Param("codigoIbge") Integer codigoIbge,
            @Param("ativo") Boolean ativo
    );
}
