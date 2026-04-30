import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WebsocketService } from '../../services/websocket.service';
import { CommonModule, DecimalPipe } from '@angular/common';

@Component({
  selector: 'drawing-board',
  imports: [CommonModule, DecimalPipe],
  templateUrl: './drawing-board.html',
  styleUrl: './drawing-board.css',
})
export class DrawingBoard implements OnInit {
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;

  roomId!: string;
  username!: string;
  isDrawing = false;
  lastX = 0;
  lastY = 0;
  messages: any[] = [];
  coordinates: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private wsService: WebsocketService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.roomId = this.route.snapshot.queryParamMap.get('room') || 'Room 101';
    this.username = this.route.snapshot.queryParamMap.get('user') || 'Guest';

    this.ctx = this.canvas!.nativeElement.getContext('2d')!;
    this.wsService.connect(this.roomId, this.username);

    // Listen for incoming drawings from others
    this.wsService.drawSubject.subscribe((data) => {
      if (data.senderId !== this.username) {
        this.draw(data.lastX, data.lastY, data.x, data.y, '#ff4757');
      }
      this.logCoordinate(data);
      this.cdr.detectChanges();
    });

    // Listen for chat
    this.wsService.messageSubject.subscribe((msg) => {
      this.messages.push(msg);
      this.cdr.detectChanges();
    });
  }

  // --- Drawing Logic ---
  startDrawing(e: MouseEvent) {
    this.isDrawing = true;
    [this.lastX, this.lastY] = [e.offsetX, e.offsetY];
  }

  onMouseMove(e: MouseEvent) {
    if (!this.isDrawing) return;
    const [x, y] = [e.offsetX, e.offsetY];

    this.draw(this.lastX, this.lastY, x, y, '#2ed573'); // Local draw

    // Send to backend
    this.wsService.send(`/app/${this.roomId}/get-location`, {
      x,
      y,
      lastX: this.lastX,
      lastY: this.lastY,
      senderId: this.username,
    });

    [this.lastX, this.lastY] = [x, y];
  }

  draw(x1: number, y1: number, x2: number, y2: number, color: string) {
    this.ctx!.strokeStyle = color;
    this.ctx!.lineWidth = 2;
    this.ctx!.lineCap = 'round';
    this.ctx!.beginPath();
    this.ctx!.moveTo(x1, y1);
    this.ctx!.lineTo(x2, y2);
    this.ctx!.stroke();
  }

  logCoordinate(data: any) {
    this.coordinates.unshift(data);
    if (this.coordinates.length > 20) this.coordinates.pop();
  }

  sendMessage(text: string) {
    this.wsService.send(`/app/${this.roomId}/chat.sendMessage`, {
      sender: this.username,
      content: text,
      type: 'CHAT',
    });
  }
}
