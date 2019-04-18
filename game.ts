enum Color {
  Black = "black",
  Red = "red",
  Green = "green",
  Blue = "blue"
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

function drawAll() {
  // background
  drawRect(0, 0, canvas.width, canvas.height, Color.Black);

  // paddle
  drawRect(paddle.x, paddle.y, paddle.width, paddle.height, paddle.color);

  // ball
  drawCircle(ball.x, ball.y, ball.radius, ball.color);
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
    ball.y < paddle.y + paddle.height &&
    ball.x > paddle.x - ball.radius &&
    ball.x < paddle.x + paddle.width
  ) {
    const paddleCenter = paddle.x + paddle.width / 2;
    const distanceFromPaddleCenter = paddleCenter - ball.x;

    ball.vy = -ball.vy;
    ball.vx = distanceFromPaddleCenter * 0.35;
  }
}

function render() {
  moveAll();
  drawAll();
  requestAnimationFrame(render);
}

function movePaddle(event: MouseEvent) {
  const rect = canvas.getBoundingClientRect();
  const root = document.documentElement;
  const mouseX = event.clientX - rect.left - root.scrollLeft;
  const relativePosition = mouseX - paddle.width / 2;

  paddle.x = Math.min(
    canvas.width - paddle.width,
    Math.max(0, relativePosition)
  );
}

window.addEventListener("load", render);
document.addEventListener("mousemove", movePaddle);
