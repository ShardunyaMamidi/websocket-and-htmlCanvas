package com.shar.websocket_stomp.repository;

import com.shar.websocket_stomp.model.Player;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlayerRepo extends JpaRepository<Player, String> {
    List<Player> findByRoomIdAndIsActiveTrue(String roomId);
}
