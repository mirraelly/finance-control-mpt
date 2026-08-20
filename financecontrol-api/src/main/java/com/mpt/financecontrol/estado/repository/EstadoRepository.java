package com.mpt.financecontrol.estado.repository;

import com.mpt.financecontrol.estado.entity.Estado;
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
public interface EstadoRepository extends JpaRepository<Estado, UUID> {

    boolean existsBySiglaIgnoreCase(String sigla);

    Optional<Estado> findBySiglaIgnoreCase(String sigla);

    @Query("SELECT e FROM Estado e "
    +      "    WHERE e.ativo = true "
    +      "ORDER BY e.nome")
    List<Estado> findForSelect();

    @Query(value = """
        SELECT * FROM estado e
            WHERE (CAST(:nome AS text) IS NULL
                    OR unaccent(lower(e.nome)) LIKE unaccent(lower('%' || CAST(:nome AS text) || '%')))
                AND (CAST(:sigla AS text) IS NULL OR upper(e.sigla) = upper(CAST(:sigla AS text)))
                AND (CAST(:codigoIbge AS integer) IS NULL OR e.codigo_ibge = CAST(:codigoIbge AS integer))
                AND (CAST(:ativo AS boolean) IS NULL OR e.ativo = CAST(:ativo AS boolean))
    """,
    countQuery = """
        SELECT count(*) FROM estado e
            WHERE (CAST(:nome AS text) IS NULL
                    OR unaccent(lower(e.nome)) LIKE unaccent(lower('%' || CAST(:nome AS text) || '%')))
                AND (CAST(:sigla AS text) IS NULL OR upper(e.sigla) = upper(CAST(:sigla AS text)))
                AND (CAST(:codigoIbge AS integer) IS NULL OR e.codigo_ibge = CAST(:codigoIbge AS integer))
                AND (CAST(:ativo AS boolean) IS NULL OR e.ativo = CAST(:ativo AS boolean))
    """,
    nativeQuery = true)
    Page<Estado> findAllWithFilters(
            Pageable pageable,
            @Param("nome") String nome,
            @Param("sigla") String sigla,
            @Param("codigoIbge") Integer codigoIbge,
            @Param("ativo") Boolean ativo
    );
}
