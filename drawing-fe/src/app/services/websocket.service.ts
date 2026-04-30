import { Injectable } from '@angular/core';
import { Client, Message } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WebsocketService {
    private stompClient: Client | any;
    public messageSubject = new Subject<any>();
    public drawSubject = new Subject<any>();

    connect(roomId: string, username: string) {
        const socket = new SockJS('http://localhost:8080/ws-game');
        this.stompClient = new Client({
            webSocketFactory: () => socket,
            debug: (str) => console.log(str),
            onConnect: (frame) => {
                // Subscribe to Chat
                this.stompClient.subscribe(`/topic/${roomId}/chat`, (chatEvent: any) => {
                    this.messageSubject.next(JSON.parse(chatEvent.body));
                });

                // Subscribe to Drawing
                this.stompClient.subscribe(`/topic/${roomId}/location`, (drawingEvent: any) => {
                    this.drawSubject.next(JSON.parse(drawingEvent.body));
                });

                // Join Room message
                this.send(`/app/${roomId}/chat.addUser`, {
                    sender: username,
                    type: 'JOIN',
                    content: `${username} has joined!`,
                });
            },
        });

        this.stompClient.activate();
    }

    send(destination: string, payload: any) {
        if (this.stompClient && this.stompClient.connected) {
            this.stompClient.publish({
                destination: destination,
                body: JSON.stringify(payload),
            });
        }
    }
}
