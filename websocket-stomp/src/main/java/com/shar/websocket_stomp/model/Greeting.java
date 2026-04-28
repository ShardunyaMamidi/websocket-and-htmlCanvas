package com.shar.websocket_stomp.model;

public class Greeting {

    Greeting() {}

    public Greeting(String content) {
        this.content = content;
    }

    private String content;

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
