import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DrawingBoard } from './components/drawing-board/drawing-board';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DrawingBoard],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('drawing-fe');
}
