import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Subject, firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { DrawAction, DrawingType } from '../models/game.models';

@Injectable({ providedIn: 'root' })
export class WebsocketService {
  private readonly http = inject(HttpClient);
  private stompClient?: Client;
  private historyDelivered = false;

  public messageSubject = new Subject<unknown>();
  public drawSubject = new Subject<DrawAction>();
  public coordHistorySubject = new Subject<DrawAction[]>();

  connect(roomId: string, displayName: string, _playerId: string) {
    this.disconnect();
    this.historyDelivered = false;

    const socket = new SockJS(environment.wsUrl);
    this.stompClient = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log(str),
      onConnect: () => {
        this.stompClient!.subscribe(`/topic/${roomId}/chat`, (chatEvent) => {
          this.messageSubject.next(JSON.parse(chatEvent.body));
        });

        this.stompClient!.subscribe(`/topic/${roomId}/location`, (drawingEvent) => {
          this.drawSubject.next(this.parseDrawAction(drawingEvent));
        });

        this.stompClient!.subscribe('/user/queue/canvas-history', (message) => {
          this.historyDelivered = true;
          const history = this.parseDrawActions(message);
          this.coordHistorySubject.next(history);
        });

        this.stompClient!.publish({
          destination: `/app/room/${roomId}/history`,
          body: '{}',
        });

        this.loadHistoryFallback(roomId);

        this.send(`/app/${roomId}/chat.addUser`, {
          sender: displayName,
          type: 'JOIN',
          content: `${displayName} has joined!`,
        });
      },
    });

    this.stompClient.activate();
  }

  /** REST fallback if the user-queue history message is delayed or missing. */
  private async loadHistoryFallback(roomId: string) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (this.historyDelivered) {
      return;
    }
    try {
      const history = await firstValueFrom(
        this.http.get<DrawAction[]>(
          `${environment.apiUrl}/api/rooms/${encodeURIComponent(roomId)}/canvas-history`,
        ),
      );
      this.historyDelivered = true;
      this.coordHistorySubject.next(history.map((a) => this.normalizeDrawAction(a)));
    } catch {
      // Backend may be unreachable; live drawing still works.
    }
  }

  disconnect() {
    if (this.stompClient?.active) {
      this.stompClient.deactivate();
    }
    this.stompClient = undefined;
  }

  send(destination: string, payload: unknown) {
    if (this.stompClient?.connected) {
      this.stompClient.publish({
        destination,
        body: JSON.stringify(payload),
      });
    }
  }

  private parseDrawAction(message: IMessage): DrawAction {
    const raw = typeof message.body === 'string' ? JSON.parse(message.body) : message.body;
    return this.normalizeDrawAction(raw);
  }

  private parseDrawActions(message: IMessage): DrawAction[] {
    if (!message.body) {
        return [];
    }
    const raw = typeof message.body === 'string' ? JSON.parse(message.body) : message.body;
    if (!Array.isArray(raw)) {
      return [];
    }
    return raw.map((item) => this.normalizeDrawAction(item));
  }

  private normalizeDrawAction(item: Partial<DrawAction> & { type?: string }): DrawAction {
    const type = String(item.type ?? 'DRAW').toUpperCase() as DrawingType;
    return {
      x: Number(item.x),
      y: Number(item.y),
      type: type === 'START' || type === 'DRAW' || type === 'END' ? type : 'DRAW',
      senderId: String(item.senderId ?? ''),
      color: item.color,
      brushSize: item.brushSize != null ? Number(item.brushSize) : undefined,
    };
  }
}
