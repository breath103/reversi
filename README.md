# Machine learning Reversi.
this project aim to train "not brute forcing based" neural network that plays Reversi (Othello)

Current approach is using whole board (10 X 10 vector) as an input for every moves. with marking every cell in board with current status, which is one of
{ 0: "move to evaluate (not played yet)", 1: "empty", 2: "my checker", 3: "enemy checker" }
than get output from network (0.0 ~ 1.0) then play the move that has highest score.

so the idea is train neural network to understand the value of moves on each given status.
all the cells marked red are the moves that AI could make, and the opacity means the score of each moves the AI think on given situation of board. 
![GitHub Logo](https://github.com/breath103/reversi/blob/master/docs/1.png)

for training, currently it use really simple Win / Loose based propagination.
it records every (Move - Board) pair, and when the game finished train it. 
if the move was made by winner, propagate is 1.0
if the move was made by looser, propagate is 0.0
```
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
```

great thanks for angular2-starter-kit for UI, synapticJS for neural network. 


Referrences
http://protohacks.net/Papers/Thesis.pdf
http://www.ai.rug.nl/~mwiering/GROUP/ARTICLES/paper-othello.pdf

