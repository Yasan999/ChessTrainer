package com.ctrainer.model;

import lombok.Data;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import java.time.LocalDateTime;

@Data
@Entity
public class Res {
    @Id
    @GeneratedValue
    private Long id;
    private Long uid;
    private int scr;
    private String mod;
    private LocalDateTime ts;
}