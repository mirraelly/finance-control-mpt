package com.mpt.financecontrol.tipoendereco.repository;

import com.mpt.financecontrol.tipoendereco.entity.TipoEndereco;
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
public interface TipoEnderecoRepository extends JpaRepository<TipoEndereco, UUID> {

    @Query(value = """
        SELECT count(*) > 0 FROM tipo_endereco t
            WHERE unaccent(lower(t.nome)) = unaccent(lower(CAST(:nome AS text)))
    """, nativeQuery = true)
    boolean existsByNomeNormalizado(@Param("nome") String nome);

    @Query(value = """
        SELECT * FROM tipo_endereco t
            WHERE unaccent(lower(t.nome)) = unaccent(lower(CAST(:nome AS text)))
    """, nativeQuery = true)
    Optional<TipoEndereco> findByNomeNormalizado(@Param("nome") String nome);

    @Query(value = """
        SELECT * FROM tipo_endereco t
            WHERE (CAST(:nome AS text) IS NULL
                OR unaccent(lower(t.nome)) LIKE unaccent(lower('%' || CAST(:nome AS text) || '%')))
    """,
    countQuery = """
        SELECT count(*) FROM tipo_endereco t
            WHERE (CAST(:nome AS text) IS NULL
                OR unaccent(lower(t.nome)) LIKE unaccent(lower('%' || CAST(:nome AS text) || '%')))
    """,
    nativeQuery = true)
    Page<TipoEndereco> findAllWithFilters(Pageable pageable, @Param("nome") String nome);

    @Query("SELECT t FROM TipoEndereco t "
    +      "    WHERE t.ativo = true "
    +      "ORDER BY t.nome")
    List<TipoEndereco> findForSelect();
}
