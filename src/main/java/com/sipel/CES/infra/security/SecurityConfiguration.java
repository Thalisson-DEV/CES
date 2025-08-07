package com.sipel.CES.infra.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfiguration {

    @Autowired
    SecurityFilter securityFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        return httpSecurity
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> authorize

                        // Assets
                        .requestMatchers(HttpMethod.GET, "/", "/**.html", "/assets/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/favicon.ico").permitAll()
                        .requestMatchers("/error").permitAll()

                        // Auth-API
                        .requestMatchers(HttpMethod.POST, "/api/v1/auth/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/auth/register").hasAnyRole("ADMINISTRADOR", "COORDENADOR")

                        // Materiais-API
                        .requestMatchers(HttpMethod.GET, "/api/v1/material").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/material").hasAnyRole("ADMINISTRADOR", "COORDENADOR")

                        // Obras-API
                        .requestMatchers(HttpMethod.POST, "/api/v1/obras").hasAnyRole("ADMINISTRADOR", "COORDENADOR")
                        .requestMatchers(HttpMethod.POST, "/api/v1/obras/import").hasAnyRole("ADMINISTRADOR", "COORDENADOR")

                        // AnyResquest, precisa apenas estar authenticado
                        .anyRequest().authenticated()
                )
                .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
