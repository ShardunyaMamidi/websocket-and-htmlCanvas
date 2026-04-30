import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'lobby',
  imports: [FormsModule],
  templateUrl: './lobby.html',
  styleUrl: './lobby.css',
})
export class Lobby {
  username: string = '';
  roomId: string = '';

  constructor(private router: Router) {}

  joinRoom(): void {
    if (this.username.trim() && this.roomId.trim()) {
      this.router.navigate(['/draw'], {
        queryParams: { 
          user: this.username, 
          room: this.roomId 
        }
      });
    } else {
      alert('Please enter both a username and a Room ID');
    }
  }
}
