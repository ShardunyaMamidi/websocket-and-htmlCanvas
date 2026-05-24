import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  inject,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { WebsocketService } from '../../services/websocket.service';
import { RoomApiService } from '../../services/room-api.service';
import { SessionService } from '../../services/session.service';
import { CommonModule } from '@angular/common';
import { DrawAction } from '../../models/game.models';

const BRUSH_COLOR = '#2ed573';
const BRUSH_SIZE = 2;

@Component({
  selector: 'drawing-board',
  imports: [CommonModule],
  templateUrl: './drawing-board.html',
  styleUrl: './drawing-board.css',
})
export class DrawingBoard implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvas?: ElementRef<HTMLCanvasElement>;
  private ctx?: CanvasRenderingContext2D;
  private initialized = false;
  private readonly subscriptions = new Subscription();
  private readonly remotePenBySender = new Map<string, { lastX: number; lastY: number }>();

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly session = inject(SessionService);

  roomId = this.route.snapshot.queryParamMap.get('room') ?? '';
  username = this.route.snapshot.queryParamMap.get('user') ?? 'Guest';
  playerId =
    this.route.snapshot.queryParamMap.get('playerId') ??
    this.session.getPlayerId() ??
    '';

  sessionError = '';

  messages: { sender: string; content: string }[] = [];
  coordinates: DrawAction[] = [];

  isDrawing = false;
  lastX: number | null = null;
  lastY: number | null = null;

  constructor(
    private wsService: WebsocketService,
    private roomApi: RoomApiService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngAfterViewInit() {
    if (!this.roomId || !this.playerId) {
      this.sessionError = 'Missing room or player session. Please return to the lobby and join again.';
      this.cdr.detectChanges();
      return;
    }

    this.initCanvas();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.wsService.disconnect();
    if (this.roomId && this.playerId) {
      this.roomApi.leaveRoom(this.roomId, this.playerId).catch(() => undefined);
    }
  }

  private initCanvas() {
    if (this.initialized || !this.canvas?.nativeElement) {
      return;
    }

    const context = this.canvas.nativeElement.getContext('2d');
    if (!context) {
      this.sessionError = 'Could not initialize the drawing canvas.';
      return;
    }

    this.ctx = context;
    this.clearCanvasSurface();
    this.initialized = true;

    this.subscriptions.add(
      this.wsService.coordHistorySubject.subscribe((history) => {
        this.replayHistory(history);
        this.cdr.detectChanges();
      }),
    );

    this.subscriptions.add(
      this.wsService.drawSubject.subscribe((data) => {
        if (data.senderId !== this.playerId) {
          this.renderDrawAction(data);
        }
        this.logCoordinate(data);
        this.cdr.detectChanges();
      }),
    );

    this.subscriptions.add(
      this.wsService.messageSubject.subscribe((msg) => {
        const chat = msg as { sender: string; content: string };
        this.messages.push(chat);
        this.cdr.detectChanges();
      }),
    );

    this.wsService.connect(this.roomId, this.username, this.playerId);
  }

  goToLobby() {
    this.router.navigate(['/lobby']);
  }

  private clearCanvasSurface() {
    if (!this.ctx || !this.canvas) return;
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
  }

  private replayHistory(history: DrawAction[]) {
    if (!this.ctx || !Array.isArray(history) || history.length === 0) {
      return;
    }
    this.remotePenBySender.clear();
    for (const action of history) {
      this.renderDrawAction(action);
    }
  }

  startDrawing(e: MouseEvent) {
    if (!this.ctx) return;
    this.isDrawing = true;
    const x = e.offsetX;
    const y = e.offsetY;
    this.lastX = x;
    this.lastY = y;
    this.drawPoint(x, y, BRUSH_COLOR, BRUSH_SIZE);
    this.publishDraw({ x, y, type: 'START' });
  }

  onMouseMove(e: MouseEvent) {
    if (!this.ctx || !this.isDrawing || this.lastX === null || this.lastY === null) return;

    const x = e.offsetX;
    const y = e.offsetY;
    this.drawLine(this.lastX, this.lastY, x, y, BRUSH_COLOR, BRUSH_SIZE);
    this.publishDraw({ x, y, type: 'DRAW' });
    this.lastX = x;
    this.lastY = y;
  }

  stopDrawing() {
    if (!this.isDrawing) return;
    this.isDrawing = false;
    this.lastX = null;
    this.lastY = null;
    this.publishDraw({ x: 0, y: 0, type: 'END' });
  }

  private publishDraw(partial: Pick<DrawAction, 'x' | 'y' | 'type'>) {
    this.wsService.send(`/app/room/${this.roomId}/get-location`, {
      ...partial,
      color: BRUSH_COLOR,
      brushSize: BRUSH_SIZE,
      senderId: this.playerId,
    });
  }

  drawPoint(x: number, y: number, color: string, brushSize: number) {
    if (!this.ctx) return;
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawLine(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: string,
    brushSize: number,
  ) {
    if (!this.ctx) return;
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = brushSize;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
  }

  logCoordinate(data: DrawAction) {
    this.coordinates.unshift(data);
    if (this.coordinates.length > 20) {
      this.coordinates.pop();
    }
  }

  sendMessage(text: string) {
    if (!text.trim()) return;
    this.wsService.send(`/app/${this.roomId}/chat.sendMessage`, {
      sender: this.username,
      content: text,
      type: 'CHAT',
    });
  }

  /** Renders a stroke segment (used for history and remote live drawing). */
  private renderDrawAction(action: DrawAction) {
    if (!this.ctx) return;

    const sender = action.senderId ?? '';
    const color = action.color ?? BRUSH_COLOR;
    const brushSize = action.brushSize ?? BRUSH_SIZE;

    if (action.type === 'START') {
      this.remotePenBySender.set(sender, { lastX: action.x, lastY: action.y });
      this.drawPoint(action.x, action.y, color, brushSize);
    } else if (action.type === 'DRAW') {
      const pen = this.remotePenBySender.get(sender);
      if (pen) {
        this.drawLine(pen.lastX, pen.lastY, action.x, action.y, color, brushSize);
      }
      this.remotePenBySender.set(sender, { lastX: action.x, lastY: action.y });
    } else if (action.type === 'END') {
      this.remotePenBySender.delete(sender);
    }
  }
}
