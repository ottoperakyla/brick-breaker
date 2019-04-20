enum GameState {
  Init = "init",
  Running = "running",
  Win = "win",
  Lose = "lose"
}

enum Color {
  Black = "black",
  Red = "red",
  Green = "green",
  Blue = "blue",
  Yellow = "yellow",
  White = "white"
}

interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  color: Color;
}

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: Color;
}

let mouseX: number = 0;
let mouseY: number = 0;
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const paddle: Paddle = {
  x: canvas.width / 2,
  y: canvas.height - 50,
  width: 100,
  height: 10,
  color: Color.Green
};
const fullscreenButton = document.querySelector("#fullscreen");
fullscreenButton.addEventListener("click", e => {
  canvas.requestFullscreen();
});

const ball: Ball = {
  x: 75,
  y: 75,
  vx: 5,
  vy: 7,
  radius: 10,
  color: Color.Blue
};

let gameState: GameState = GameState.Init;
let bricks: boolean[] = [];
const brickWidth = 80;
const brickHeight = 20;
const brickRows = 14;
const bricksPerRow = canvas.width / brickWidth;
const bricksAmount = brickRows * bricksPerRow;
let bricksLeft = 0;
const bricksStartIndex = 3 * bricksPerRow;

function resetBricks() {
  let i = 0;
  for (; i < bricksStartIndex; i++) {
    bricks[i] = false;
  }
  for (; i < bricksAmount; i++) {
    bricksLeft++;
    bricks[i] = true;
  }
}

function init() {
  resetBall();
  resetBricks();
  gameState = GameState.Running;
  render();
}

function drawRect(
  x: number,
  y: number,
  width: number,
  height: number,
  color: Color
) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
}

function drawCircle(x: number, y: number, radius: number, color: Color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.fill();
}

function drawText(
  x: number,
  y: number,
  text: string,
  color: Color,
  fontSize: number
) {
  ctx.fillStyle = color;
  ctx.font = `${fontSize}px Verdana`;
  ctx.fillText(text, x, y);
}

function drawBricks() {
  bricks.forEach((alive, i) => {
    if (alive) {
      const row = Math.floor(i / bricksPerRow);
      const col = i % bricksPerRow;
      const x = col * brickWidth + 1;
      const y = row * brickHeight + 1;
      const width = brickWidth - 2;
      const height = brickHeight - 2;

      drawRect(x, y, width, height, Color.Red);
    }
  });
}

function drawAll() {
  // background
  drawRect(0, 0, canvas.width, canvas.height, Color.White);

  // paddle
  drawRect(paddle.x, paddle.y, paddle.width, paddle.height, paddle.color);

  // ball
  drawCircle(ball.x, ball.y, ball.radius, ball.color);
  drawBricks();
}

function resetBall() {
  ball.x = canvas.width / 2 - ball.radius;
  ball.y = canvas.height / 2 - ball.radius;
}

function moveBall() {
  ball.x += ball.vx;
  ball.y += ball.vy;

  // bottom, game over
  if (ball.y > canvas.height - ball.radius) {
    resetBall();
    resetBricks();
  }

  // hit wall
  if (
    (ball.x > canvas.width - ball.radius && ball.vx > 0) ||
    (ball.x < ball.radius && ball.vx < 0)
  ) {
    ball.vx = -ball.vx;
  }

  // ceiling
  if (ball.y < ball.radius && ball.vy < 0) {
    ball.vy = -ball.vy;
  }
}

function colRowToIndex(col: number, row: number) {
  return col + row * bricksPerRow;
}

function isBrickAtColRow(col: number, row: number) {
  if (col >= 0 && col < bricksPerRow && row >= 0 && row < brickRows) {
    const brickIndex = colRowToIndex(col, row);
    return bricks[brickIndex];
  } else {
    return false;
  }
}

function ballBrickHandling() {
  const ballBrickCol = Math.floor(ball.x / brickWidth);
  const ballBrickRow = Math.floor(ball.y / brickHeight);
  const index = colRowToIndex(ballBrickCol, ballBrickRow);
  if (isBrickAtColRow(ballBrickCol, ballBrickRow)) {
    bricks[index] = false;
    bricksLeft--;

    const prevBallX = ball.x - ball.vx;
    const prevBallY = ball.y - ball.vy;
    const ballBrickColPrev = Math.floor(prevBallX / brickWidth);
    const ballBrickRowPrev = Math.floor(prevBallY / brickHeight);

    const columnChanged = ballBrickColPrev !== ballBrickCol;
    const rowChanged = ballBrickRowPrev !== ballBrickRow;
    const armpitCase = !(columnChanged || rowChanged);

    // colum changed, so its a horizontal collision
    if (columnChanged) {
      if (!isBrickAtColRow(ballBrickColPrev, ballBrickRow)) {
        // adjacent brick is missing
        ball.vx *= -1;
      }
    }

    // row changed, so its a vertical collision
    if (rowChanged) {
      if (!isBrickAtColRow(ballBrickCol, ballBrickRowPrev)) {
        // adjacent brick is missing
        ball.vy *= -1;
      }
    }

    if (armpitCase) {
      ball.vy *= -1;
      ball.vx *= -1;
    }
  }
}

function ballPaddleHandling() {
  if (
    ball.y > paddle.y - ball.radius &&
    ball.y < paddle.y &&
    ball.x > paddle.x - ball.radius &&
    ball.x < paddle.x + paddle.width
  ) {
    const paddleCenter = paddle.x + paddle.width / 2;
    const distanceFromPaddleCenter = paddleCenter - ball.x;

    ball.vy *= -1;
    ball.vx = distanceFromPaddleCenter * 0.25;

    if (bricksLeft === 0) {
      resetBricks();
    }
  }
}

function moveAll() {
  moveBall();
  ballBrickHandling();
  ballPaddleHandling();
}

function renderWin() {
  drawRect(0, 0, canvas.width, canvas.height, Color.Black);
  ctx.textAlign = "center";
  drawText(canvas.width / 2, canvas.height / 2, "You Win!!!", Color.Yellow, 40);
}

function renderLose() {
  drawRect(0, 0, canvas.width, canvas.height, Color.Black);
  ctx.textAlign = "center";
  drawText(canvas.width / 2, canvas.height / 2, "You Lose!!!", Color.Red, 40);
}

function render() {
  switch (gameState) {
    case GameState.Init:
      init();
      break;
    case GameState.Running:
      moveAll();
      drawAll();
      requestAnimationFrame(render);
      break;
    case GameState.Win:
      renderWin();
      break;
    case GameState.Lose:
      renderLose();
      break;
  }
}

function movePaddle(event: MouseEvent) {
  const rect = canvas.getBoundingClientRect();
  const root = document.documentElement;
  mouseX = event.clientX - rect.left - root.scrollLeft;
  mouseY = event.clientY - rect.top - root.scrollTop;
  const relativePosition = mouseX - paddle.width / 2;

  paddle.x = Math.min(
    canvas.width - paddle.width,
    Math.max(0, relativePosition)
  );
}

window.addEventListener("load", render);
document.addEventListener("mousemove", movePaddle);
