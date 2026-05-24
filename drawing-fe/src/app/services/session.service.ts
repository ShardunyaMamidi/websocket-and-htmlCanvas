import { Injectable } from '@angular/core';

const PLAYER_ID_KEY = 'sketch-it-out-player-id';

@Injectable({ providedIn: 'root' })
export class SessionService {
  getOrCreatePlayerId(): string {
    const existing = localStorage.getItem(PLAYER_ID_KEY);
    if (existing) {
      return existing;
    }
    const id = crypto.randomUUID();
    localStorage.setItem(PLAYER_ID_KEY, id);
    return id;
  }

  getPlayerId(): string | null {
    return localStorage.getItem(PLAYER_ID_KEY);
  }
}
