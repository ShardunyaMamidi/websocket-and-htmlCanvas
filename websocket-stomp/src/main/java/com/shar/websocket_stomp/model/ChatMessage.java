package com.shar.websocket_stomp.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.stereotype.Component;

@Component
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {

    private String sender;  // Has the ID
    private String content;
    private MessageType type;


    private enum MessageType { CHAT, JOIN, LEAVE }

}
