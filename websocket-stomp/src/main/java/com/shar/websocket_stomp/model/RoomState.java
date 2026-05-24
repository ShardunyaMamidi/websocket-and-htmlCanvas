package com.shar.websocket_stomp.model;

import lombok.Getter;

import java.io.Serializable;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Getter
public class RoomState implements Serializable {
    private final String roomId;
    private final String roomName;
    private final int maxPlayers;
    private final Set<String> memberIds = ConcurrentHashMap.newKeySet();

    public RoomState(String roomId, String roomName, int maxPlayers) {
        this.roomId = roomId;
        this.roomName = roomName;
        this.maxPlayers = maxPlayers;
    }

    public boolean isFull() {
        return memberIds.size() >= maxPlayers;
    }

    public boolean addMember(String playerId) {
        return memberIds.add(playerId);
    }

    public void removeMember(String playerId) {
        memberIds.remove(playerId);
    }

    public int getPlayerCount() {
        return memberIds.size();
    }
}
