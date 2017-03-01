import {
  Component,
  OnInit,
} from '@angular/core';
import { Http, Response } from '@angular/http';

import * as _ from 'lodash';
import * as Rx from 'rxjs';

import * as synaptic from 'synaptic';

import { AppState } from '../app.service';
import { Reversi, Vector, Checker, GameEvent, Move, Player } from '../reversi';
import { CheckerComponent } from './checker';

import { HumanPlayer } from './human-player';
import { AIPlayer } from './ai-player';

const BOARD_SIZE = 10;

@Component({
  selector: 'reversi', 
  providers: [],
  styleUrls: [ './index.css' ],
  templateUrl: './index.html'
})
export class ReversiComponent implements OnInit {
  reversi: Reversi;
  cellClickObservable = new Rx.Subject<Vector>();
  humanPlayer: HumanPlayer = new HumanPlayer("#F48120", "Kurt", this.cellClickObservable);
  aiPlayer: AIPlayer = new AIPlayer("rgb(0, 146, 200)", "AH", BOARD_SIZE);
  aiPlayer2: AIPlayer = new AIPlayer("rgb(0, 146, 200)", "BA", BOARD_SIZE);
  boardLocations: Vector[][];

  constructor() {
    this.resetGame();
  }

  public ngOnInit() {
    // this.showModal();
  }
  
  public async resetGame() {
    // this.reversi = new Reversi(BOARD_SIZE, this.aiPlayer, this.humanPlayer);
    this.reversi = new Reversi(BOARD_SIZE, this.aiPlayer, this.aiPlayer2);

    this.boardLocations = [];
    for (let x = 0; x < this.reversi.boardSize; x++){
      this.boardLocations[x] = [];
      for (let y = 0; y < this.reversi.boardSize; y++){
        this.boardLocations[x][y] = new Vector({x, y});
      }
    }
    
    const event = await this.reversi.start();
    if (event == GameEvent.GameFinished) {
      await this.reversi.playerTrue.onGameFinished(this.reversi);
      await this.reversi.playerFalse.onGameFinished(this.reversi);

      this.resetGame();
      // this.showModal();
    }
  }


  // Events
  public onClickCell(loc: Vector) {
    this.cellClickObservable.next(loc);
  }

  public modalVisible: boolean = false;

  showModal() {
    this.modalVisible = true;
  }

  public onClickReplay() {
    this.modalVisible = false;
    this.resetGame();
  }

  public trackByLocation(v: Vector) {
    return v.toString();
  }
}
