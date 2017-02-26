import * as _ from 'lodash';

export type Checker = boolean;
export class Vector { 
  x: number;
  y: number;

  constructor(options: {x: number, y: number}) {
    this.x = options.x;
    this.y = options.y;
  }

  toString() {
    return [this.x, this.y].join('-');
  }

  toIndex(boardSize: number) {
    return this.x + this.y * boardSize;
  }
};

export class VectorHelper {
  static add(a: Vector, b: Vector) {
    return new Vector({ 
      x: a.x + b.x,
      y: a.y + b.y,
    });
  }
  static multiply(vector: Vector, multiplier: number) {
    return new Vector({
      x: vector.x * multiplier,
      y: vector.y * multiplier,
    })
  }
}

export type Move = {
  checker: Checker,
  vector: Vector,
};
export type PossibleMove = {
  move: Move,
  scoreDelta: number,
}
export enum GameEvent {
  GameFinished,
}

class ReversiError extends Error {}

const DIRECTIONS = [
  { x: -1, y: -1 }, { x: -1, y: +0 }, { x: -1, y: +1 },
  { x: +0, y: -1 },    /* 0, 0 */   , { x: +0, y: +1 },
  { x: +1, y: -1 }, { x: +1, y: +0 }, { x: +1, y: +1 },
].map(v => new Vector(v));

export abstract class Player {
  public checker: Checker;
  constructor(
    public color: string,
    public name: string
  ) {}
  abstract async turn(game: Reversi) : Promise<Vector>;
  async onGameFinished(game: Reversi) {}
}

export class Reversi { 
  moves: {
    move: Move,
    board: { [key: string]: Checker },  
  }[] = [];

  possibleMoves: { [key: string]: PossibleMove } = {};
  board: { [key: string]: Checker } = {};
  score: { [key: string]: number } = {};

  // Player and Turn 
  private _currentPlayer: Player;
  get currentPlayer() { return this._currentPlayer; }
  public changeTurn() {
    if (this.currentPlayer == this.playerTrue) {
      this._currentPlayer = this.playerFalse;
    } else {
      this._currentPlayer = this.playerTrue;      
    }
  }

  async start() {
    while (1) {
      const vector = await this._currentPlayer.turn(this);
      try {
        const result = this.runMove({ vector: vector, checker: this._currentPlayer.checker });
        if (result != null) {
          return result;
        }
      } catch (e) {
        window.alert("Wrong Move");
      }
    }
  }
  
  constructor(
    public boardSize: number,
    public playerTrue: Player,
    public playerFalse: Player,
  ) {
    this.playerTrue.checker = true;
    this.playerFalse.checker = false;

    this._currentPlayer = this.playerTrue;

    // Setup inital board
    const floor = boardSize / 2 - 1;
    const ceil = boardSize / 2;

    this.set([
      { vector: new Vector({ x: floor, y: floor }), checker: this.playerFalse.checker },
      { vector: new Vector({ x: floor, y: ceil }), checker: this.playerTrue.checker },
      { vector: new Vector({ x: ceil , y: floor }), checker: this.playerTrue.checker },
      { vector: new Vector({ x: ceil , y: ceil }), checker: this.playerFalse.checker }
    ]);
  } 

  get(vector: Vector): Checker | undefined {
    return this.board[vector.toString()];
  }
  set(changes: Move[]): GameEvent | null {
    // Set the checkers and update score
    changes.forEach(change => {
      this.board[change.vector.toString()] = change.checker;
    });
    this._updateScores();


    // change turn
    this.changeTurn();

    // Player Changed. so update scores and do things
    this._updatePossibleMoves();

    // since current player can't play, change turn again
    if (_.size(this.possibleMoves) == 0) {
      this.changeTurn();
      
      this._updatePossibleMoves();
      if (_.size(this.possibleMoves) == 0) {
        // if even opponent can't play any more, the game is done
        return GameEvent.GameFinished;
      }
    }
    return null
  }

  isValidVector(vector: Vector) {
    return vector.x >= 0 && vector.x < this.boardSize && 
           vector.y >= 0 && vector.y < this.boardSize;
  }

  runMove(move: Move) : GameEvent | null {
    // Can i play that Vector?
    if (this.get(move.vector) != undefined) {
      throw new ReversiError(`wrong move. this Vector is already played ${JSON.stringify(move)}`);
    }
    const flipableDirections = this._flipableDirections(move);
    if (flipableDirections.length === 0) {
      throw new ReversiError(`wrong move. there isn't any checker you can't flip ${JSON.stringify(move)}`);
    }
   
    this.moves.push({
      move: move,
      board: _.cloneDeep(this.board),
    });
    
    const changes = _(flipableDirections).flatMap<Move>(v => {
      const changes: Move[] = [];
      for (let i = 0; i < v.distance; i++ ) {
        const delta = VectorHelper.multiply(v.direction, i);
        const loc = VectorHelper.add(move.vector, delta);    
        changes.push({ vector: loc, checker: move.checker});
      }
      return changes;
    }).value();

    return this.set(changes);
  }

  // Score And Winner
  get winner() : Player {
    return _([this.playerTrue, this.playerFalse]).maxBy(player => this.score[player.checker.toString()]);
  }

  private _updateScores() {
    this.score = _(this.board).values().countBy(checker => checker).value();
  }

  // Find Possible Moves with given player
  private _updatePossibleMoves() {
    // Update Playble locations
    this.possibleMoves = {};
    for (let x = 0; x < this.boardSize; x++) {
      for (let y = 0; y < this.boardSize; y++) {
        const vector = new Vector({ x, y });

        if (this.get(vector) == undefined) {
          const move = { checker: this.currentPlayer.checker, vector };
          const fliplable = this._flipableDirections(move);
          const scoreDelta = _.sum(fliplable.map(f => f.distance - 1)) + 1;
          if (fliplable.length > 0) {
            this.possibleMoves[move.vector.toString()] = { move, scoreDelta };
          }
        }
      }
    }
  }
  
  // Find flipable Directions 
  private _flipableDirections(move: Move) {
    const flipableDirections: { direction: Vector, distance: number }[] = [];

    for (const key in DIRECTIONS) {
      const direction = DIRECTIONS[key];

      // first, it should find opponent checker from the distance 1
      const firstVector = VectorHelper.add(move.vector, direction);
      const firstChecker = this.get(firstVector);
      if (firstChecker != undefined && firstChecker != move.checker) {
        // find the direction that is valid.
        let distance = 1;
        while(1) {
          distance += 1;
          const VectorDelta = VectorHelper.multiply(direction, distance);
          const nextVector = VectorHelper.add(move.vector, VectorDelta);    

          if (!this.isValidVector(nextVector)) {
            // Out of board. this direction is invalid
            break;
          } else {
            const checker = this.get(nextVector);
            // If the board is empty
            if (checker == undefined) {
              // this direction is invalid
              break;
            } else {
              if (checker == move.checker) {
                // O - X - O. valid
                flipableDirections.push({
                  direction, 
                  distance,
                })
                break;
              }
            }            
          }
        }
      }
    }

    return flipableDirections;
  }
}
