enum Color {
  Black = "black",
  Red = "red",
  Green = "green",
  Blue = "blue",
  Yellow = "yellow"
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

interface Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  color: Color;
  alive: boolean;
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

const ball: Ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  vx: 3,
  vy: 5,
  radius: 10,
  color: Color.Blue
};

const bricks: Brick[] = [];

for (let row = 0; row < 2; row++) {
  for (let col = 0; col < 10; col++) {
    const brickWidth = 60;
    const brickHeight = 20;
    const padding = 20;

    bricks.push({
      x: col * (brickWidth + padding) + padding / 2,
      y: row * (brickHeight + padding) + padding,
      color: Color.Red,
      width: brickWidth,
      height: brickHeight,
      alive: true
    });
  }
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

function drawText(x: number, y: number, text: string, color: Color) {
  ctx.fillStyle = color;
  ctx.font = "12px Verdana";
  ctx.fillText(text, x, y);
}

function drawBricks() {
  bricks
    .filter(brick => brick.alive)
    .forEach(brick => {
      drawRect(brick.x, brick.y, brick.width, brick.height, brick.color);
    });
}

function drawAll() {
  // background
  drawRect(0, 0, canvas.width, canvas.height, Color.Black);

  // paddle
  drawRect(paddle.x, paddle.y, paddle.width, paddle.height, paddle.color);

  // ball
  drawCircle(ball.x, ball.y, ball.radius, ball.color);

  drawBricks();

  drawText(mouseX, mouseY, `${mouseX}, ${mouseY}`, Color.Yellow);
}

function resetBall() {
  ball.x = canvas.width / 2 - ball.radius;
  ball.y = canvas.height / 2 - ball.radius;
}

function moveAll() {
  ball.x += ball.vx;
  ball.y += ball.vy;

  // bottom, game over
  if (ball.y > canvas.height - ball.radius) {
    resetBall();
  }

  // hit wall
  if (ball.x > canvas.width - ball.radius || ball.x < ball.radius) {
    ball.vx = -ball.vx;
  }

  // ceiling
  if (ball.y < ball.radius) {
    ball.vy = -ball.vy;
  }

  // hit paddle
  if (
    ball.y > paddle.y - ball.radius &&
    ball.y < paddle.y &&
    ball.x > paddle.x - ball.radius &&
    ball.x < paddle.x + paddle.width
  ) {
    const paddleCenter = paddle.x + paddle.width / 2;
    const distanceFromPaddleCenter = paddleCenter - ball.x;

    ball.vy = -ball.vy;
    ball.vx = distanceFromPaddleCenter * 0.35;
  }

  bricks
    .filter(brick => brick.alive)
    .forEach(brick => {
      if (
        ball.y - ball.radius < brick.y + brick.height &&
        ball.x > brick.x &&
        ball.x < brick.x + brick.width
      ) {
        brick.alive = false;
        ball.vy = -ball.vy;
      }
    });
}

function render() {
  moveAll();
  drawAll();
  requestAnimationFrame(render);
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
