package com.shar.websocket_stomp.controller;

import com.shar.websocket_stomp.model.Coordinate;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
@Slf4j
public class LocationController {

    @MessageMapping("/{roomId}/get-location") // When this endpoint is triggered
    @SendTo("/topic/{roomId}/location") // Clients subscribed to this will receive the location
    public Coordinate getLocation(@DestinationVariable String roomId, @Payload Coordinate coordinate) {
        log.info("Clicked location = X : {}, Y : {}", coordinate.getX(), coordinate.getY());
        return coordinate;
    }

}
