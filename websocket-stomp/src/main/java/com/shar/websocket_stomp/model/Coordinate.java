package com.shar.websocket_stomp.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Coordinate {
    private Integer x;
    private Integer y;
    private Integer lastX;
    private Integer lastY;
    private String senderId;

    public Coordinate(Integer x, Integer y) {
        this.x = x;
        this.y = y;
    }
}
