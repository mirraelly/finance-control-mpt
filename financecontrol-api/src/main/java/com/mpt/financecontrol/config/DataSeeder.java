package com.mpt.financecontrol.config;

import com.mpt.financecontrol.tenant.entity.Tenant;
import com.mpt.financecontrol.tenant.repository.TenantRepository;
import com.mpt.financecontrol.usuario.entity.Role;
import com.mpt.financecontrol.usuario.entity.Usuario;
import com.mpt.financecontrol.usuario.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DataSeeder implements ApplicationRunner {

    private static final String TENANT_ADMIN_NOME = "FinanceControl Admin";

    private final TenantRepository tenantRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.superadmin.email}")
    private String email;

    @Value("${app.superadmin.password}")
    private String password;

    @Value("${app.superadmin.nome}")
    private String nome;

    public DataSeeder(TenantRepository tenantRepository, UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.tenantRepository = tenantRepository;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (usuarioRepository.findByEmail(email).isPresent())
            return;

        Tenant tenantAdmin = tenantRepository.findByNome(TENANT_ADMIN_NOME)
                .orElseGet(() -> {
                    Tenant t = new Tenant();
                    t.setNome(TENANT_ADMIN_NOME);
                    return tenantRepository.save(t);
                });

        Usuario superAdmin = new Usuario();
        superAdmin.setTenant(tenantAdmin);
        superAdmin.setNome(nome);
        superAdmin.setEmail(email);
        superAdmin.setSenha(passwordEncoder.encode(password));
        superAdmin.setCodigoPais("55");
        superAdmin.setAtivo(true);
        superAdmin.setRole(Role.SUPERADMIN);

        usuarioRepository.save(superAdmin);

        System.out.println("SuperAdmin criado — email: " + email);
    }
}
