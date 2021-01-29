const gameBoard = document.getElementById("game-board");

// Snake game vars
let snakeHead = null;
let appleRow, appleCol;
let tilesToAdd = 0;
let score = 0;

// Key used to stop the render method
let intervalKey;

const TILES_WIDE = 60,
  TILES_HIGH = 40,
  TILE_WIDTH = 20;

const TILES_PER_APPLE = 3;

// Flag for starting render after first move
let started = false;

class SnakeNode {
  constructor(direction, row, col, isHead = false) {
    this.direction = direction;
    this.row = row;
    this.col = col;
    this.next = null;
    this.isHead = isHead;
  }
}

setupGridTiles();
setupGame();

// Event listeners
document.addEventListener("keydown", changeDirection);
document
  .querySelector("#gameover-menu button")
  .addEventListener("click", setupGame);

function setupGame() {
  // If a game just finished (i.e. started is set to true from the last game)
  if (started) {
    // Remove the snake class from all snake tiles (traverse the linked list and use the row and column properties) and remove the apple
    let currentNode = snakeHead;
    while (currentNode !== null) {
      console.log(currentNode.row, currentNode.col);
      document
        .querySelector(`.r-${currentNode.row}.c-${currentNode.col}`)
        .classList.remove("snake");
      currentNode = currentNode.next;
    }
    snakeHead = null;
    document
      .querySelector(`.r-${appleRow}.c-${appleCol}`)
      .classList.remove("apple");
  }

  // Setup the new game
  createSnake();
  generateApple();
  score = 0;
  started = false;
  tilesToAdd = 0;

  document.querySelector("#gameover-menu").style.display = "none";
}

function setupGridTiles() {
  for (let r = 0; r < TILES_HIGH; r++) {
    for (let c = 0; c < TILES_WIDE; c++) {
      // Create the grid tile element
      const tile = document.createElement("div");
      // Give the proper classes
      tile.className = `grid-tile r-${r} c-${c}`;
      // Add the tile to the game board
      gameBoard.appendChild(tile);
    }
  }
}

function createSnake() {
  let col = 4;
  let snakeTile = document.querySelector(`.r-${1}.c-${col}`);
  snakeTile.classList.add("snake");

  // Create the head of the linked list
  snakeHead = new SnakeNode(null, 1, col, (isHead = true));
  let snakeNode = snakeHead;

  col--;

  for (; col > 0; col--) {
    snakeTile = snakeTile.previousElementSibling;
    snakeTile.classList.add("snake");

    snakeNode.next = new SnakeNode(null, 1, col);
    snakeNode = snakeNode.next;
  }
}

function render() {
  moveSnake();
}

function moveSnake() {
  let currentNode = snakeHead;
  let direction = currentNode.direction;

  while (currentNode !== null) {
    const prevRow = currentNode.row,
      prevCol = currentNode.col;

    switch (currentNode.direction) {
      case "up":
        currentNode.row--;
        break;
      case "left":
        currentNode.col--;
        break;
      case "down":
        currentNode.row++;
        break;
      case "right":
        currentNode.col++;
        break;
    }
    // Check for gameover conditions (only for the head of the snake)
    if (currentNode.isHead) {
      if (checkGameOver()) {
        // Reset the head back to its old position (for game reset purposes)
        currentNode.row = prevRow;
        currentNode.col = prevCol;
        return;
      }
    }

    document
      .querySelector(`.r-${prevRow}.c-${prevCol}`)
      .classList.remove("snake");

    // After the move, check for apple collision
    if (currentNode.row === appleRow && currentNode.col === appleCol) {
      // Add new tiles to the add queue
      // Remove the apple (note that appleRow and appleCol are updated in generateApple())
      document
        .querySelector(`.r-${appleRow}.c-${appleCol}`)
        .classList.remove("apple");
      // Add new apple
      generateApple();
      tilesToAdd += TILES_PER_APPLE;
      score++;
    }
    document
      .querySelector(`.r-${currentNode.row}.c-${currentNode.col}`)
      .classList.add("snake");

    const temp = currentNode.direction;
    currentNode.direction = direction;
    direction = temp;

    if (currentNode.next === null && tilesToAdd > 0) {
      let row = currentNode.row,
        col = currentNode.col;
      switch (direction) {
        case "up":
          row++;
          break;
        case "left":
          col++;
          break;
        case "down":
          row--;
          break;
        case "right":
          col--;
          break;
      }
      currentNode.next = new SnakeNode(direction, row, col);
      document.querySelector(`.r-${row}.c-${col}`).classList.add("snake");
      tilesToAdd--;
      break;
    }
    currentNode = currentNode.next;
  }
}

function changeDirection(e) {
  if (e.key.match(/^[w,a,s,d]$/i)) {
    setDirectionFromKey(snakeHead, e.key);
    if (!started) {
      started = true;
      let currentNode = snakeHead.next;
      while (currentNode !== null) {
        currentNode.direction = "right";
        currentNode = currentNode.next;
      }
      intervalKey = setInterval(render, 1000 / 10);
    }
  }
  e.preventDefault();
}

function generateApple() {
  const emptyTiles = [];
  document.querySelectorAll(".grid-tile").forEach((tile) => {
    if (!tile.classList.contains("snake")) {
      emptyTiles.push(tile);
    }
  });
  const randIndex = Math.floor(Math.random() * emptyTiles.length);
  const appleTile = emptyTiles[randIndex];

  appleTile.classList.add("apple");

  let appleClass = appleTile.className;

  appleRow = parseInt(
    appleClass.substring(
      appleClass.indexOf("r-") + 2,
      appleClass.indexOf("c-") - 1
    )
  );
  appleCol = parseInt(appleClass.substring(appleClass.indexOf("c-") + 2));
}

function setDirectionFromKey(tile, key) {
  switch (key.toLowerCase()) {
    case "w":
      tile.direction = "up";
      break;
    case "a":
      tile.direction = "left";
      break;
    case "s":
      tile.direction = "down";
      break;
    case "d":
      tile.direction = "right";
      break;
  }
}

function checkGameOver() {
  // This is called immediately after the snake head's coords change
  if (
    snakeHead.row < 0 ||
    snakeHead.row >= TILES_HIGH ||
    snakeHead.col < 0 ||
    snakeHead.col >= TILES_WIDE ||
    document
      .querySelector(`.r-${snakeHead.row}.c-${snakeHead.col}`)
      .classList.contains("snake")
  ) {
    clearInterval(intervalKey);
    displayScoreboard();
    return true;
  }
  return false;
}

function displayScoreboard() {
  document.getElementById("gameover-menu").style.display = "block";
  document.querySelector("#gameover-menu p").innerHTML = `Score: ${score}`;
}
