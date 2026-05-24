export type DrawingType = 'START' | 'DRAW' | 'END';

export interface DrawAction {
  x: number;
  y: number;
  type: DrawingType;
  senderId: string;
  color?: string;
  brushSize?: number;
}

export interface Player {
  playerId: string;
  name: string;
  roomId: string;
  score: string;
  isActive: boolean;
}

export interface JoinRoomResponse {
  playerId: string;
  roomId: string;
  name: string;
  playersInRoom: Player[];
}

export interface RoomSummary {
  roomId: string;
  roomName: string;
  maxPlayers: number;
  playerCount: number;
}
