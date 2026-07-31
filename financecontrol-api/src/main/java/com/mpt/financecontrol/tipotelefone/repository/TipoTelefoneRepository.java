package com.mpt.financecontrol.tipotelefone.repository;

import com.mpt.financecontrol.tipotelefone.entity.TipoTelefone;
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
public interface TipoTelefoneRepository extends JpaRepository<TipoTelefone, UUID> {

    @Query(value = """
        SELECT count(*) > 0 FROM tipo_telefone t
            WHERE unaccent(lower(t.nome)) = unaccent(lower(CAST(:nome AS text)))
    """, nativeQuery = true)
    boolean existsByNomeNormalizado(@Param("nome") String nome);

    @Query(value = """
        SELECT * FROM tipo_telefone t
            WHERE unaccent(lower(t.nome)) = unaccent(lower(CAST(:nome AS text)))
    """, nativeQuery = true)
    Optional<TipoTelefone> findByNomeNormalizado(@Param("nome") String nome);

    @Query(value = """
        SELECT * FROM tipo_telefone t
            WHERE (CAST(:nome AS text) IS NULL
                OR unaccent(lower(t.nome)) LIKE unaccent(lower('%' || CAST(:nome AS text) || '%')))
    """,
    countQuery = """
        SELECT count(*) FROM tipo_telefone t
            WHERE (CAST(:nome AS text) IS NULL
                OR unaccent(lower(t.nome)) LIKE unaccent(lower('%' || CAST(:nome AS text) || '%')))
    """,
    nativeQuery = true)
    Page<TipoTelefone> findAllWithFilters(Pageable pageable, @Param("nome") String nome);

    @Query("SELECT t FROM TipoTelefone t "
    +      "    WHERE t.ativo = true "
    +      "ORDER BY t.nome")
    List<TipoTelefone> findForSelect();
}
