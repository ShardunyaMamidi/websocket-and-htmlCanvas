import { Component } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SessionService } from '../../services/session.service';
import { RoomApiService } from '../../services/room-api.service';

@Component({
  selector: 'lobby',
  imports: [FormsModule],
  templateUrl: './lobby.html',
  styleUrl: './lobby.css',
})
export class Lobby {
  username = '';
  roomId = '';
  createRoom = false;
  isJoining = false;
  errorMessage = '';

  constructor(
    private router: Router,
    private session: SessionService,
    private roomApi: RoomApiService,
  ) {}

  async joinRoom(): Promise<void> {
    const name = this.username.trim();
    const room = this.roomId.trim();

    if (!name || !room) {
      this.errorMessage = 'Please enter both a username and a Room ID';
      return;
    }

    this.isJoining = true;
    this.errorMessage = '';

    try {
      const playerId = this.session.getOrCreatePlayerId();

      if (this.createRoom) {
        await this.roomApi.createRoom(room, room);
      }

      const response = await this.roomApi.joinRoom(room, playerId, name);

      await this.router.navigate(['/draw'], {
        queryParams: {
          user: response.name,
          room: response.roomId,
          playerId: response.playerId,
        },
      });
    } catch (err: unknown) {
      this.errorMessage = this.resolveErrorMessage(err);
    } finally {
      this.isJoining = false;
    }
  }

  private resolveErrorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const body = err.error as { message?: string } | string | null;
      if (body && typeof body === 'object' && body.message) {
        return body.message;
      }
      return err.message;
    }
    if (err instanceof Error) {
      return err.message;
    }
    return 'Could not join the room. Is the backend running on port 8090?';
  }
}
