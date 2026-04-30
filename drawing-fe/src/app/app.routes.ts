import { Routes } from '@angular/router';
import { DrawingBoard } from './components/drawing-board/drawing-board';
import { Lobby } from './components/lobby/lobby';

export const routes: Routes = [
    { path: '', redirectTo: 'lobby', pathMatch: 'full' },
    { path: 'lobby', component: Lobby },
    { path: 'draw', component: DrawingBoard },
];
