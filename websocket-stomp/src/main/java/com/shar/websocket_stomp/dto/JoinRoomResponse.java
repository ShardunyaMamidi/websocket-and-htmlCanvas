package com.shar.websocket_stomp.dto;

import com.shar.websocket_stomp.model.Player;

import java.util.List;

public record JoinRoomResponse(
        String playerId,
        String roomId,
        String name,
        List<Player> playersInRoom
) {}
