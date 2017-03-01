import * as _ from 'lodash';
import * as synaptic from 'synaptic';
import * as Rx from 'rxjs';

import { Reversi, Vector, Checker, GameEvent, Move, PossibleMove, Player } from '../reversi';

export class AIPlayer extends Player {
  network: synaptic.Network;
  networkSignature: number[];  
  networkOutputs: { [key: string]: number } = {};
  
  constructor(color: string, name: string, private boardSize: number) {
    super(color, name);
    this.networkSignature = [boardSize * boardSize, 10, 10, 1];
    this.loadNetwork();

    if (!this.network) {
      this.network = new synaptic.Architect.Perceptron(...this.networkSignature);
    }
  }

  private _boardToNetworkInput(board: any, boardSize: number, move: Move) {
    const inputs: number[] = [];
    for (let x = 0; x < boardSize; x++) {
      for (let y = 0; y < boardSize; y++) {
        const checker = board[new Vector({ x, y }).toString()];
        if (move.vector.x == x && move.vector.y == y) {
          inputs.push(0)
        } else {
          if (checker == undefined) {
            inputs.push(1);
          } else if (checker == move.checker) {
            inputs.push(2);
          } else {
            inputs.push(3);
          }
        }
      }
    }
    return inputs;
  }

  private get _localStorageKey() { 
    return this.networkSignature.toString() + this.name + ".v4";
  }

  public saveNetwork() {
    localStorage.setItem(this._localStorageKey, JSON.stringify(this.network.toJSON()));
  }

  public loadNetwork() {
    try {
      const json = localStorage.getItem(this._localStorageKey);
      if (json) {
        this.network = synaptic.Network.fromJSON(JSON.parse(json)) as any;
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Player
  async turn(reversi: Reversi) : Promise<Vector> {
    return await new Promise<Vector>((resolve, reject) => {
      // Among possibleMoves, find the highest score
      this.networkOutputs = {};
      const bestMove = _(reversi.possibleMoves).values<PossibleMove>()
                                               .maxBy(i => {
                                                  const predictedScore = this.network.activate(
                                                    this._boardToNetworkInput(reversi.board, reversi.boardSize, i.move)
                                                  )[0];

                                                  this.networkOutputs[i.move.vector.toString()] = predictedScore;
                                                  return predictedScore;
                                               });
      const scores = _.values(this.networkOutputs);
      const min = _.min(scores);
      const max = _.max(scores); 
      if (min != 0 && max != 0) {
        this.networkOutputs = _.mapValues(this.networkOutputs, (score) => {
          return (score - min) / (max - min);
        }) as any;                                               
      }
      setTimeout(() => {
        resolve(bestMove.move.vector);
      }, 20);
    });
  }

  async onGameFinished(game: Reversi) {
    if (game.winner == this) {
      console.log("Winner : ", game.winner.name, game.score);
    }
    game.moves.forEach(move => {
      // Retrospective my moves
      if (move.move.checker == this.checker) {
        const trainningOutput = game.winner.checker == move.move.checker ? 1 : 0;
        this.network.activate(this._boardToNetworkInput(move.board, game.boardSize, move.move));
        this.network.propagate(0.1, [trainningOutput]);
      } else {
        const trainningOutput = game.winner.checker == move.move.checker ? 1 : 0;
        this.network.activate(this._boardToNetworkInput(move.board, game.boardSize, move.move));
        this.network.propagate(0.1, [trainningOutput]);
      }
    });

    this.saveNetwork();
  }
}