package com.sipel.CES.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Entity(name="basesoperacionais")
@Table(name="bases_operacionais")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BaseOperacional {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String nomeBase;
}
