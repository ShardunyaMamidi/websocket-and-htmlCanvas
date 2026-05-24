package com.shar.websocket_stomp.dto;

import com.shar.websocket_stomp.model.Coordinate;

public record DrawActionDto(
        Integer x,
        Integer y,
        Coordinate.DrawingType type,
        String senderId,
        String color,
        Integer brushSize
) {
    public static DrawActionDto fromCoordinate(Coordinate coordinate) {
        return new DrawActionDto(
                coordinate.getX(),
                coordinate.getY(),
                coordinate.getType(),
                coordinate.getSenderId(),
                coordinate.getColor(),
                coordinate.getBrushSize()
        );
    }
}
