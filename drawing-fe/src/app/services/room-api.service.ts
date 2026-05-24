import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { JoinRoomResponse, RoomSummary } from '../models/game.models';

@Injectable({ providedIn: 'root' })
export class RoomApiService {
  private readonly baseUrl = `${environment.apiUrl}/api/rooms`;

  constructor(private http: HttpClient) {}

  createRoom(roomId: string, roomName?: string, maxPlayers?: number): Promise<RoomSummary> {
    return firstValueFrom(
      this.http.post<RoomSummary>(this.baseUrl, {
        roomId,
        roomName: roomName ?? roomId,
        maxPlayers,
      }),
    );
  }

  joinRoom(roomId: string, playerId: string, name: string): Promise<JoinRoomResponse> {
    return firstValueFrom(
      this.http.post<JoinRoomResponse>(`${this.baseUrl}/${encodeURIComponent(roomId)}/join`, {
        playerId,
        name,
      }),
    );
  }

  leaveRoom(roomId: string, playerId: string): Promise<void> {
    return firstValueFrom(
      this.http.post<void>(`${this.baseUrl}/${encodeURIComponent(roomId)}/leave`, {
        playerId,
        name: '',
      }),
    );
  }
}
