const cvs = document.getElementById("tetris");
const ctx = cvs.getContext("2d");
const scoreElement = document.getElementById("score");

const row = 16;
const cols = 16;
const sq = (squaresize = 25);
const vacantBoxColor = "White";

//drawing square
function drawSquare(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * sq, y * sq, sq, sq);

  ctx.strokeStyle = "#383737";
  ctx.strokeRect(x * sq, y * sq, sq, sq);  //API draws a rectangle that is stroked (outlined) according to the current strokeStyle and other context settings
  //This method draws directly to the canvas without modifying the current path, so any subsequent fill() or stroke() calls will have no effect on it.
}
//create the board
let board = [];
for (r = 0; r < row; r++) {
  board[r] = [];
  for (c = 0; c < cols; c++) {
    board[r][c] = vacantBoxColor;
  }
}
//draw the board
function drawBoard() {
  for (r = 0; r < row; r++) {
    for (c = 0; c < cols; c++) {
      drawSquare(c, r, board[r][c]);
    }
  }
}
drawBoard();
//Pieces and their colors
const Pieces = [
  [Z, "#ed665f"],
  [S, "#82c05a"],
  [T, "#f2f261"],
  [O, "#7c7dcd"],
  [L, "#db92f2"],
  [I, "#72c1ea"],
  [J, "#f5cf53"],
];

//Generate random piece
function randomPiece() {
  let r = Math.floor(Math.random() * Pieces.length);
  return new Piece(Pieces[r][0], Pieces[r][1]);
}

let ran = randomPiece();

//object

function Piece(tetromino, color) {
  this.tetromino = tetromino;
  this.color = color;

  this.tetrominoN = 0;
  this.activetetromino = this.tetromino[this.tetrominoN];
  this.x = 3;
  this.y = -2;
}

//Fill Colour Function
Piece.prototype.fill = function (color) {
  for (r = 0; r < this.activetetromino.length; r++) {
    for (c = 0; c < this.activetetromino.length; c++) {
      if (this.activetetromino[r][c]) {
        drawSquare(this.x + c, this.y + r, color);
      }
    }
  }
};

//Draw a piece on board
Piece.prototype.draw = function () {
  this.fill(this.color);
};

//undraw a piece on board
Piece.prototype.unDraw = function () {
  this.fill(vacantBoxColor);
};
//move down the piece
Piece.prototype.moveDown = function () {
  if (!this.collision(0, 1, this.activetetromino)) {
    this.unDraw();
    this.y++;
    this.draw();
  } else {
    this.lock();
    ran = randomPiece();
  }
};

// move left the piece
Piece.prototype.moveLeft = function () {
  if (!this.collision(-1, 0, this.activetetromino)) {
    this.unDraw();
    this.x--;
    this.draw();
  }
};

// move right the piece
Piece.prototype.moveRight = function () {
  if (!this.collision(1, 0, this.activetetromino)) {
    this.unDraw();
    this.x++;
    this.draw();
  }
};
// Rotate piece
Piece.prototype.rotate = function () {
  let pattern = this.tetromino[(this.tetrominoN + 1) % this.tetromino.length];
  let kick = 0;
  if (this.collision(0, 0, pattern)) {
    if (this.x > cols / 2) kick = -1; //right wall touched
    else kick = 1; //left wall touched
  }
  if (!this.collision(kick, 0, pattern)) {
    this.unDraw();
    this.x += kick;
    this.tetrominoN = (this.tetrominoN + 1) % this.tetromino.length;
    this.activetetromino = this.tetromino[this.tetrominoN];
    this.draw();
  }
};

let score = 0;
Piece.prototype.lock = function () {
  for (r = 0; r < this.activetetromino.length; r++) {
    for (c = 0; c < this.activetetromino.length; c++) {
      //skip empty square
      if (!this.activetetromino[r][c]) {
        continue;
      }
      //piece to lock on top = game over
      if (this.y + r < 0) {
        alert("Game Over");
        // alert("Thanks for Playing");
        // alert("Hoping to see you soon");
        gameOver = true;
        break;
      }
      //we lock the piece
      board[this.y + r][this.x + c] = this.color;
    }
  }
  //removal of rows
  for (r = 0; r < row; r++) {
    let isRowFull = true;
    for (c = 0; c < cols; c++) {
      isRowFull = isRowFull && board[r][c] != vacantBoxColor;
    }
    if (isRowFull) {
      //if the row is full move down all the rows above it by one-one step
      for (y = r; y > 1; y--) {
        for (c = 0; c < cols; c++) {
          board[y][c] = board[y - 1][c];
        }
      }
      //top row board[0][....] has no row above it
      for (c = 0; c < cols; c++) {
        board[0][c] = vacantBoxColor;
      }
      score += 10;
    }
  }
  //update board
  drawBoard();
  // update score
  scoreElement.innerHTML = score;
};

//Colision function
Piece.prototype.collision = function (x, y, piece) {
  for (r = 0; r < piece.length; r++) {
    for (c = 0; c < piece.length; c++) {
      // when square is empty
      if (!piece[r][c]) continue;
      //new coordinate of piece after moving
      let newX = this.x + c + x;
      let newy = this.y + r + y;
      // we will not check newy<0 as we are starting y from negative which is -2
      if (
        newX < 0 /*left wall*/ ||
        newX >= cols /*right wall*/ ||
        newy >= row /* downward*/
      ) {
        return true;
      }
      if (newy < 0) {
        continue;
      }
      // if there is locked piece already there
      if (board[newy][newX] != vacantBoxColor) {
        return true;
      }
    }
  }
  return false;
};

//control the piece
document.addEventListener("keydown", Control);
function Control(event) {
  debugger;
  if (event.keyCode == 37) {
    //37 left arrow key for moving left
    ran.moveLeft();
    dropStart = Date.now();
  } else if (event.keyCode == 38) {
    //38 upward arrow key for rotation
    ran.rotate();
    dropStart = Date.now();
  } else if (event.keyCode == 39) {
    ran.moveRight();
    dropStart = Date.now();
  } else if (event.keyCode == 40) {
    ran.moveDown();
    // dropStart = Date.now();
  }
}

//Drop the piece in every 1 sec

let dropStart = Date.now();
let gameOver = false;
function drop() {
  let now = Date.now();
  let delta = now - dropStart;
  if (delta > 1000) {
    ran.moveDown();
    dropStart = Date.now();
  }
  if (!gameOver) {
    requestAnimationFrame(drop);
  }
}
drop();
