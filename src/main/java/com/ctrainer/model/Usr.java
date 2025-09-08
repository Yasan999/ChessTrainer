package com.ctrainer.model;

import lombok.Data;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;

@Data
@Entity
public class Usr {
    @Id
    @GeneratedValue
    private Long id;
    private String fio;
    private int yob;
    @Column(unique = true)
    private String nick;
    private String pwd;
    private String bg;
}