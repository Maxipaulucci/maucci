package com.maxturnos.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class JwtUserPrincipal implements UserDetails {

    private final String email;
    private final String rol;
    private final String nombreNegocio;
    private final boolean superAdmin;

    public JwtUserPrincipal(String email, String rol, String nombreNegocio, boolean superAdmin) {
        this.email = email;
        this.rol = rol;
        this.nombreNegocio = nombreNegocio;
        this.superAdmin = superAdmin;
    }

    public String getEmail() {
        return email;
    }

    public String getRol() {
        return rol;
    }

    public String getNombreNegocio() {
        return nombreNegocio;
    }

    public boolean isSuperAdmin() {
        return superAdmin;
    }

    public boolean isAdmin() {
        return "admin".equals(rol);
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (superAdmin) {
            return List.of(new SimpleGrantedAuthority("ROLE_SUPERADMIN"));
        }
        if (isAdmin()) {
            return List.of(new SimpleGrantedAuthority("ROLE_ADMIN"));
        }
        return List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override
    public String getPassword() {
        return null;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
