package com.shar.websocket_stomp.controller;

import com.shar.websocket_stomp.model.Greeting;
import com.shar.websocket_stomp.model.Person;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.util.HtmlUtils;

@Controller
public class GreetingController {

    @MessageMapping("/hello")  //When this endpoint is hit from frontend, greeting() is called
    @SendTo("/topic/greetings") // This sends the greetings message to all who are subscribed to /topic/greetings
    public Greeting greeting(@Payload Person person) throws Exception {
        Thread.sleep(1000);
        return new Greeting("Hello " + HtmlUtils.htmlEscape(person.getName()) + "!");
    }
}
