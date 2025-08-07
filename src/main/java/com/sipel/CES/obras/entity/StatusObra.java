package com.sipel.CES.obras.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity(name="status_obras")
@Table(name="status_obras")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StatusObra {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String nomeStatus;
}
