package com.shar.websocket_stomp.controller;

import com.shar.websocket_stomp.dto.DrawActionDto;
import com.shar.websocket_stomp.service.InMemoryCanvasService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/debug")
@CrossOrigin(origins = {"http://localhost:4200", "http://127.0.0.1:4200"})
public class CanvasDebugController {

    private final InMemoryCanvasService canvasService;

    public CanvasDebugController(InMemoryCanvasService canvasService) {
        this.canvasService = canvasService;
    }

    @GetMapping("/canvas/{roomId}")
    public List<DrawActionDto> getRoomCanvas(@PathVariable String roomId) {
        return canvasService.getHistory(roomId);
    }
}
