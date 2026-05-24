package com.shar.websocket_stomp.dto;

public record CreateRoomRequest(String roomId, String roomName, Integer maxPlayers) {}
