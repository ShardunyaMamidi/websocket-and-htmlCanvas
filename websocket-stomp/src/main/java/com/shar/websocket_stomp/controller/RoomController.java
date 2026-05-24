package com.shar.websocket_stomp.controller;

import com.shar.websocket_stomp.dto.CreateRoomRequest;
import com.shar.websocket_stomp.dto.JoinRoomRequest;
import com.shar.websocket_stomp.dto.JoinRoomResponse;
import com.shar.websocket_stomp.model.Player;
import com.shar.websocket_stomp.model.RoomState;
import com.shar.websocket_stomp.dto.DrawActionDto;
import com.shar.websocket_stomp.service.InMemoryCanvasService;
import com.shar.websocket_stomp.service.RoomService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rooms")
@CrossOrigin(origins = {"http://localhost:4200", "http://127.0.0.1:4200"})
public class RoomController {

    private final RoomService roomService;
    private final InMemoryCanvasService canvasService;

    public RoomController(RoomService roomService, InMemoryCanvasService canvasService) {
        this.roomService = roomService;
        this.canvasService = canvasService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createRoom(@RequestBody CreateRoomRequest request) {
        RoomState room = roomService.createRoom(request.roomId(), request.roomName(), request.maxPlayers());
        return ResponseEntity.status(HttpStatus.CREATED).body(roomSummary(room));
    }

    @PostMapping("/{roomId}/join")
    public ResponseEntity<JoinRoomResponse> joinRoom(
            @PathVariable String roomId,
            @RequestBody JoinRoomRequest request) {
        JoinRoomResponse response = roomService.joinRoom(roomId, request.playerId(), request.name());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{roomId}/leave")
    public ResponseEntity<Void> leaveRoom(
            @PathVariable String roomId,
            @RequestBody JoinRoomRequest request) {
        roomService.leaveRoom(roomId, request.playerId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{roomId}/players")
    public ResponseEntity<List<Player>> getPlayers(@PathVariable String roomId) {
        return ResponseEntity.ok(roomService.getPlayersInRoom(roomId));
    }

    @GetMapping("/{roomId}")
    public ResponseEntity<Map<String, Object>> getRoom(@PathVariable String roomId) {
        RoomState room = roomService.getRoom(roomId);
        return ResponseEntity.ok(roomSummary(room));
    }

    @GetMapping("/{roomId}/canvas-history")
    public ResponseEntity<List<DrawActionDto>> getCanvasHistory(@PathVariable String roomId) {
        return ResponseEntity.ok(canvasService.getHistory(roomId));
    }

    private Map<String, Object> roomSummary(RoomState room) {
        return Map.of(
                "roomId", room.getRoomId(),
                "roomName", room.getRoomName(),
                "maxPlayers", room.getMaxPlayers(),
                "playerCount", room.getPlayerCount()
        );
    }
}
