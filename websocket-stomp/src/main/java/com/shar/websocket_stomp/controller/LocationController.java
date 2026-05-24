package com.shar.websocket_stomp.controller;

import com.shar.websocket_stomp.dto.DrawActionDto;
import com.shar.websocket_stomp.model.Coordinate;
import com.shar.websocket_stomp.service.InMemoryCanvasService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
@Slf4j
public class LocationController {

    private final InMemoryCanvasService canvasService;
    private final SimpMessagingTemplate messagingTemplate;

    public LocationController(InMemoryCanvasService canvasService, SimpMessagingTemplate messagingTemplate) {
        this.canvasService = canvasService;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/room/{roomId}/get-location")
    @SendTo("/topic/{roomId}/location")
    public Coordinate getLocation(@DestinationVariable String roomId, @Payload Coordinate coordinate) {
        log.debug("Draw {} in room {} at {},{}", coordinate.getType(), roomId, coordinate.getX(), coordinate.getY());
        DrawActionDto action = DrawActionDto.fromCoordinate(coordinate);
        canvasService.storeDrawAction(roomId, action);
        return coordinate;
    }

    /**
     * Client publishes here after subscribing to {@code /user/queue/canvas-history}.
     * History is sent only to the requesting session (not broadcast to the room).
     */
    @MessageMapping("/room/{roomId}/history")
    public void sendHistoryToClient(
            @DestinationVariable String roomId,
            SimpMessageHeaderAccessor headerAccessor) {
        List<DrawActionDto> history = canvasService.getHistory(roomId);
        log.debug("Sending {} history actions to session {} for room {}",
                history.size(), headerAccessor.getSessionId(), roomId);
        messagingTemplate.convertAndSendToUser(
                headerAccessor.getSessionId(),
                "/queue/canvas-history",
                history,
                headerAccessor.getMessageHeaders());
    }
}
