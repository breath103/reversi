import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Reversi, Vector, Checker, Move } from '../reversi';

@Component({
  selector: 'checker', 
  providers: [],
  styles: [
    `
    .cell {
      border: 1px solid black;
      display: flex;
      width: 50px;
      height: 50px;    
      margin: auto;
      box-sizing: border-box;
      text-align: center;

      background-color: transparent;
      transition: background-color 0.2s;
    }

    .cell.possibleMove {
        background-color: rgba(0, 0, 0, 0.2);
        transition: background-color 0.2s;
    }
    .cell.possibleMove:hover {
        background-color: rgba(0, 0, 0, 0.8);
    }

    .checker {
        opacity: 0;
        width: 80%;
        height: 80%;
        margin: auto;
        border-radius: 50%;
        border: 3px solid black;
        
        transition: all 0.2s;
        transform: scale(1.5, 1.5);
        background-color: transparent;
    }

    .checker.checker-white {
        opacity: 1;
        transform: scale(1.0, 1.0);
        background-color: rgb(245, 130, 32);
    }

    .checker.checker-black {
        opacity: 1;
        transform: scale(1.0, 1.0);
        background-color: rgb(0, 146, 200);
    }
    `
  ],
  template: `
    <div 
      class="cell"
      [ngClass]="{possibleMove: possibleMove != undefined}"
      (click)="onClickCell()"
    > 
      <span>{{ possibleMove ? possibleMove.scoreDelta : 0 }}</span>
      <div 
        class="checker"
        [ngClass]="{'checker-white': checker == true, 'checker-black': checker == false }"
      ></div>
    </div>
  `
})
export class CheckerComponent {
  @Input() location: Vector;
  @Input() checker?: Checker;
  @Input() possibleMove: { move: Move, scoreDelta: number };
  @Output() onClick = new EventEmitter<Vector>();
  
  constructor() {}

  onClickCell() {
    this.onClick.emit(this.location);
  }
}
