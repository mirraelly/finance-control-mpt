package com.mpt.financecontrol.tipoemail.repository;

import com.mpt.financecontrol.tipoemail.entity.TipoEmail;
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
public interface TipoEmailRepository extends JpaRepository<TipoEmail, UUID> {

    @Query("""
        SELECT COUNT(t) > 0 FROM TipoEmail t
            WHERE FUNCTION('unaccent', LOWER(t.nome)) = FUNCTION('unaccent', LOWER(CAST(:nome AS string)))
    """)
    boolean existsByNomeNormalizado(@Param("nome") String nome);

    @Query("""
        SELECT t FROM TipoEmail t
            WHERE FUNCTION('unaccent', LOWER(t.nome)) = FUNCTION('unaccent', LOWER(CAST(:nome AS string)))
    """)
    Optional<TipoEmail> findByNomeNormalizado(@Param("nome") String nome);

    @Query("""
        SELECT t FROM TipoEmail t
            WHERE (:nome IS NULL OR FUNCTION('unaccent', LOWER(t.nome)) LIKE FUNCTION('unaccent', LOWER(CONCAT('%', CAST(:nome AS string), '%'))))
    """)
    Page<TipoEmail> findAllWithFilters(Pageable pageable, @Param("nome") String nome);

    @Query("SELECT t FROM TipoEmail t "
    +      "    WHERE t.ativo = true "
    +      "ORDER BY t.nome")
    List<TipoEmail> findForSelect();
}
