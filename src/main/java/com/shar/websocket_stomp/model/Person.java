package com.shar.websocket_stomp.model;

import org.springframework.stereotype.Component;

@Component
public class Person {
    Person() {}

    Person(String name) {
        this.name = name;
    }

    private String name;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
