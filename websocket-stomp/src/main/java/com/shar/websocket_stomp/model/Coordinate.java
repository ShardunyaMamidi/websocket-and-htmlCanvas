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
    private String senderId;
    private DrawingType type;
    private String color;
    private Integer brushSize;

    public enum DrawingType {
        START, DRAW, END
    }
}
