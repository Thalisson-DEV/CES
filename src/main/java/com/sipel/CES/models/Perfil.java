package com.sipel.CES.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;

@Entity(name="perfis")
@Table(name="perfis")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Perfil implements GrantedAuthority {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String nomePerfil;

    @Override
    public String getAuthority() {
        return "ROLE_" + this.nomePerfil.toUpperCase();
    }
}
