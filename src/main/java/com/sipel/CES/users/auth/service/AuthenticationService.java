package com.sipel.CES.users.auth.service;

import com.sipel.CES.users.auth.exceptions.NoUserInLocalMemoryException;
import com.sipel.CES.users.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class AuthenticationService implements UserDetailsService {

    @Autowired
    UsuarioRepository repository;
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        try {
            if (username == null) {
                throw new NoUserInLocalMemoryException("Usuario não encontrado no banco de dados.");
            }
            return repository.findByUsername(username);
        } catch (NullPointerException e) {
            throw e;
        }

    }
}
