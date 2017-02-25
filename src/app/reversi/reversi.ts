
export type Checker = boolean;
export class Vector { 
  x: number;
  y: number;

  constructor(options: {x: number, y: number}) {
    this.x = options.x;
    this.y = options.y;
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

class ReversiError extends Error {}


const DIRECTIONS = [
  { x: -1, y: -1 }, { x: -1, y: +0 }, { x: -1, y: +1 },
  { x: +0, y: -1 },    /* 0, 0 */   , { x: +0, y: +1 },
  { x: +1, y: -1 }, { x: +1, y: +0 }, { x: +1, y: +1 },
].map(v => new Vector(v));

export class Reversi { 
  private moves: Move[] = [];
  board: { [key: number]: Checker } = {};

  constructor(public boardSize: number) {} 

  each(fn) { }
  get(vector: Vector): Checker | undefined {
    return this.board[[vector.x, vector.y].join('-')];
  }
  set(vector: Vector, checker: Checker): void {
    this.board[[vector.x, vector.y].join('-')] = checker;
  }

  isValidVector(vector: Vector) {
    return vector.x >= 0 && vector.x < this.boardSize && 
           vector.y>= 0 && vector.y < this.boardSize;
  }

  runMove(move: Move) {
    // Can i play that Vector?
    if (this.get(move.vector) != undefined) {
      throw new ReversiError(`wrong move. this Vector is already played ${JSON.stringify(move)}`);
    }
    const flipableDirections = this._flipableDirections(move);
    if (flipableDirections.length === 0) {
      throw new ReversiError(`wrong move. there isn't any checker you can't flip ${JSON.stringify(move)}`);
    }
    
    this.moves.push(move);

    // Ok. Flip now
    flipableDirections.forEach(v => {
      for (let i = 0; i < v.distance; i++ ) {
        const delta = VectorHelper.multiply(v.direction, i);
        const loc = VectorHelper.add(move.vector, delta);    
        this.set(loc, move.checker);
      }
    });
  }

  private _flipableDirections(move: Move) {
    const isValidMove = true
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
