import * as Rx from 'rxjs';
import { Reversi, Vector, Player } from '../reversi';

export class HumanPlayer extends Player {
  constructor(color: string, name: string, private cellClickObservable: Rx.Observable<Vector>) {
    super(color, name);
  }

  async turn(reversi: Reversi) {
    return new Promise((resolve, reject) => {
      this.cellClickObservable.subscribe(resolve);
    });
  }
}
