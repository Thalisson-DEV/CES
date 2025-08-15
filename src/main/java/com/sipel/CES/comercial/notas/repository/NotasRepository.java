package com.sipel.CES.comercial.notas.repository;

import com.sipel.CES.comercial.notas.entity.Nota;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotasRepository extends JpaRepository<Nota, Integer> {
}
