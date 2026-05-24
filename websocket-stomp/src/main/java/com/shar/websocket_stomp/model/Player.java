package com.shar.websocket_stomp.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Player implements Serializable {
    @Id
    private String playerId;
    private String name;
    private String roomId;
    private String score = "0";
    private Boolean isActive = true;
}
