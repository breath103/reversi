import {
  Component,
  OnInit,
} from '@angular/core';

import { Http, Response } from '@angular/http';
import { AppState } from '../app.service';
import { Reversi, Vector, Checker } from '../reversi';

@Component({
  selector: 'reversi', 
  providers: [],
  styleUrls: [ './index.css' ],
  templateUrl: './index.html'
})

export class ReversiComponent implements OnInit {
  reversi: Reversi;
  currentPlayer: Checker;
  boardLocations: Vector[];
  mouse: { x: number, y: number };

  constructor() {
    this.reversi = new Reversi(10);
    this.currentPlayer = false;

    this.boardLocations = [];
    for (let x = 0; x < this.reversi.boardSize; x++){
      for (let y = 0; y < this.reversi.boardSize; y++){
        this.boardLocations.push(new Vector({x, y}));
      }
    }

    this.reversi.set(new Vector({ x: 4, y: 4 }), false);
    this.reversi.set(new Vector({ x: 4, y: 5 }), true);
    this.reversi.set(new Vector({ x: 5, y: 4 }), true);
    this.reversi.set(new Vector({ x: 5, y: 5 }), false);
  }
  
  // Events
  public onClickCell(loc: Vector) {
    try {
      this.reversi.runMove({ vector: loc, checker: this.currentPlayer });
      this.currentPlayer = !this.currentPlayer;
    } catch (e) {
      
    }
  }

  public onHoverBoard($event: MouseEvent) {
    const rect = ($event.currentTarget as any).getBoundingClientRect();
    const x = $event.pageX - rect.left; //x position within the element
    const y = $event.pageY - rect.top;  //y position within the element
    this.mouse = { x, y };
  }

  public ngOnInit() {

  }
  
  public trackByLocation(v: Vector) {
    return `${v.x}-${v.y}`;
  }
}
