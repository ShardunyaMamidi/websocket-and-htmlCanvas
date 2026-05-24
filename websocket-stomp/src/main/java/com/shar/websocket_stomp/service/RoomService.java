package com.shar.websocket_stomp.service;

import com.shar.websocket_stomp.dto.JoinRoomResponse;
import com.shar.websocket_stomp.model.Player;
import com.shar.websocket_stomp.model.RoomState;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RoomService {

    private final Map<String, RoomState> rooms = new ConcurrentHashMap<>();
    private final PlayerService playerService;
    private final int defaultMaxPlayers;

    public RoomService(
            PlayerService playerService,
            @Value("${app.room.max-players:12}") int defaultMaxPlayers) {
        this.playerService = playerService;
        this.defaultMaxPlayers = defaultMaxPlayers;
    }

    public RoomState createRoom(String roomId, String roomName, Integer maxPlayers) {
        String normalizedId = normalizeRoomId(roomId);
        if (rooms.containsKey(normalizedId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Room already exists");
        }
        RoomState room = new RoomState(
                normalizedId,
                roomName != null && !roomName.isBlank() ? roomName.trim() : normalizedId,
                maxPlayers != null && maxPlayers > 0 ? maxPlayers : defaultMaxPlayers
        );
        rooms.put(normalizedId, room);
        return room;
    }

    public RoomState getOrCreateRoom(String roomId) {
        String normalizedId = normalizeRoomId(roomId);
        return rooms.computeIfAbsent(
                normalizedId,
                id -> new RoomState(id, id, defaultMaxPlayers)
        );
    }

    public RoomState getRoom(String roomId) {
        String normalizedId = normalizeRoomId(roomId);
        RoomState room = rooms.get(normalizedId);
        if (room == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found");
        }
        return room;
    }

    public JoinRoomResponse joinRoom(String roomId, String playerId, String name) {
        if (Objects.nonNull(playerId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "playerId is required");
        }
        if (Objects.nonNull(name)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "name is required");
        }

        RoomState room = getOrCreateRoom(roomId);
        String normalizedId = room.getRoomId();

        if (!room.getMemberIds().contains(playerId) && room.isFull()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Room is full");
        }

        room.addMember(playerId);
        Player player = playerService.joinRoom(normalizedId, playerId.trim(), name.trim());
        List<Player> playersInRoom = playerService.getActivePlayersInRoom(normalizedId);

        return new JoinRoomResponse(player.getPlayerId(), normalizedId, player.getName(), playersInRoom);
    }

    public void leaveRoom(String roomId, String playerId) {
        RoomState room = rooms.get(normalizeRoomId(roomId));
        if (room != null) {
            room.removeMember(playerId);
        }
        playerService.leaveRoom(playerId);
    }

    public List<Player> getPlayersInRoom(String roomId) {
        return playerService.getActivePlayersInRoom(normalizeRoomId(roomId));
    }

    private String normalizeRoomId(String roomId) {
        if (roomId == null || roomId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "roomId is required");
        }
        return roomId.trim();
    }
}
