package com.shar.websocket_stomp.service;

import com.shar.websocket_stomp.dto.DrawActionDto;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

@Service
public class InMemoryCanvasService {

    private final Map<String, Queue<DrawActionDto>> inMemoryCanvas = new ConcurrentHashMap<>();

    public void storeDrawAction(String roomId, DrawActionDto drawAction) {
        String key = normalizeRoomId(roomId);
        inMemoryCanvas.computeIfAbsent(key, k -> new ConcurrentLinkedQueue<>()).add(drawAction);
    }

    public List<DrawActionDto> getHistory(String roomId) {
        Queue<DrawActionDto> history = inMemoryCanvas.get(normalizeRoomId(roomId));
        return history != null ? new ArrayList<>(history) : Collections.emptyList();
    }

    public void clearCanvas(String roomId) {
        inMemoryCanvas.remove(normalizeRoomId(roomId));
    }

    private String normalizeRoomId(String roomId) {
        return roomId == null ? "" : roomId.trim();
    }
}
