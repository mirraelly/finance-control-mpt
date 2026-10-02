package com.mpt.financecontrol.loginlog.repository;

import com.mpt.financecontrol.loginlog.entity.LoginLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.UUID;

@Repository
public interface LoginLogRepository extends JpaRepository<LoginLog, UUID> {

    @Query(value = """
        SELECT * FROM login_log l
            WHERE (CAST(:sucesso AS boolean) IS NULL OR l.sucesso = CAST(:sucesso AS boolean))
                AND (CAST(:email AS text) IS NULL OR lower(l.email) LIKE lower('%' || CAST(:email AS text) || '%'))
                AND (CAST(:inicio AS timestamp) IS NULL OR l.created_at >= CAST(:inicio AS timestamp))
                AND (CAST(:fim AS timestamp) IS NULL OR l.created_at < CAST(:fim AS timestamp))
    """,
    countQuery = """
        SELECT count(*) FROM login_log l
            WHERE (CAST(:sucesso AS boolean) IS NULL OR l.sucesso = CAST(:sucesso AS boolean))
                AND (CAST(:email AS text) IS NULL OR lower(l.email) LIKE lower('%' || CAST(:email AS text) || '%'))
                AND (CAST(:inicio AS timestamp) IS NULL OR l.created_at >= CAST(:inicio AS timestamp))
                AND (CAST(:fim AS timestamp) IS NULL OR l.created_at < CAST(:fim AS timestamp))
    """,
    nativeQuery = true)
    Page<LoginLog> findAllWithFilters(
            Pageable pageable,
            @Param("sucesso") Boolean sucesso,
            @Param("email") String email,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim
    );
}
