package com.shar.websocket_stomp.service;

import com.shar.websocket_stomp.model.Player;
import com.shar.websocket_stomp.repository.PlayerRepo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class PlayerService {

    private final PlayerRepo repo;

    public PlayerService(PlayerRepo repo) {
        this.repo = repo;
    }

    public List<Player> getPlayers() {
        return repo.findAll();
    }

    public Optional<Player> getPlayerById(String id) {
        return repo.findById(id);
    }

    public List<Player> getActivePlayersInRoom(String roomId) {
        return repo.findByRoomIdAndIsActiveTrue(roomId);
    }

    @Transactional
    public Player joinRoom(String roomId, String playerId, String name) {
        Player player = repo.findById(playerId).orElse(new Player());
        player.setPlayerId(playerId);
        player.setName(name);
        player.setRoomId(roomId);
        player.setIsActive(true);
        if (player.getScore() == null) {
            player.setScore("0");
        }
        return repo.save(player);
    }

    @Transactional
    public void leaveRoom(String playerId) {
        repo.findById(playerId).ifPresent(player -> {
            player.setIsActive(false);
            repo.save(player);
        });
    }

    public void deletePlayer(String id) {
        repo.deleteById(id);
    }
}
