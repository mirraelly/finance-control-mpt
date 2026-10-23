package com.mpt.financecontrol.dashboard.controller;

import com.mpt.financecontrol.config.JwtFilter;
import com.mpt.financecontrol.config.SecurityConfig;
import com.mpt.financecontrol.dashboard.dtos.DashboardResumoDto;
import com.mpt.financecontrol.dashboard.service.DashboardService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.YearMonth;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = DashboardController.class,
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = { SecurityConfig.class, JwtFilter.class }))
@AutoConfigureMockMvc(addFilters = false)
class DashboardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private DashboardService service;

    @Test
    @DisplayName("GET /dashboard/resumo retorna os indicadores do anoMes informado")
    void resumo_comAnoMesValido_retorna200() throws Exception {
        DashboardResumoDto resumo = new DashboardResumoDto(
                YearMonth.of(2026, 10),
                new BigDecimal("8450.00"),
                new BigDecimal("5800.00"),
                new BigDecimal("3420.00"),
                new BigDecimal("2380.00")
        );
        when(service.buscarResumo(YearMonth.of(2026, 10))).thenReturn(resumo);

        mockMvc.perform(get("/dashboard/resumo").param("anoMes", "2026-10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mes").value("2026-10"))
                .andExpect(jsonPath("$.saldoTotal").value(8450))
                .andExpect(jsonPath("$.receitasMes").value(5800))
                .andExpect(jsonPath("$.despesasMes").value(3420))
                .andExpect(jsonPath("$.saldoMes").value(2380));
    }

    @Test
    @DisplayName("GET /dashboard/resumo rejeita anoMes em formato invalido")
    void resumo_comAnoMesInvalido_retorna400() throws Exception {
        mockMvc.perform(get("/dashboard/resumo").param("anoMes", "outubro-2026"))
                .andExpect(status().isBadRequest());
    }
}
