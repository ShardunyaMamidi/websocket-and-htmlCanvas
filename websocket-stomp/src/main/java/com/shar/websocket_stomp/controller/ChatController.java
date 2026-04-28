package com.shar.websocket_stomp.controller;

import com.shar.websocket_stomp.model.ChatMessage;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {

    @MessageMapping("/{roomId}/chat.sendMessage") // Users send to /app/chat.sendMessage
    @SendTo("/topic/{roomId}/chat")               // Everyone subscribed to /topic/chat receives it
    public ChatMessage sendMessage(@DestinationVariable String roomId, @Payload ChatMessage chatMessage) {
        return chatMessage;
    }

    @MessageMapping("/{roomId}/chat.addUser")
    @SendTo("/topic/{roomId}/chat")   // Everyone subscribed to /topic/chat receives it
    public ChatMessage addUser(@DestinationVariable String roomId, @Payload ChatMessage chatMessage,
                               SimpMessageHeaderAccessor headerAccessor) {
        // Add username in web socket session
        headerAccessor.getSessionAttributes().put("username", chatMessage.getSender());
        return chatMessage;
    }
}
