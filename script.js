// Canvas elements
const body = document.body;
const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
const width = 500;
const height = 700;
const screenWidth = window.screen.width;
const canvasPosition = (screenWidth - width) / 2;
const isMobile = window.matchMedia('(max-width: 600px)');
const gameOverEl = document.createElement('div');

// Paddle
const paddleHeight = 10;
const paddleWidth = 50;
const paddleDiff = 25;
let paddleBottomX = 225;
let paddleTopX = 225;
let playerMoved = false;
let paddleContact = false;

// Ball
let ballX = 250;
let ballY = 350;
const ballRadius = 5;

// Speed
let speedY;
let speedX;
let trajectoryX;
let computerSpeed;

// Mobile settings
if (isMobile.matches) {
  speedY = -2;
  speedX = speedY;
  computerSpeed = 4;
} else {
  speedY = -1;
  speedX = speedY;
  computerSpeed = 3;
}

// Score
let playerScore = 0;
let computerScore = 0;
const winningScore = 3;
let isGameOver = true;
let isNewGame = true;

// Render the canvas
const renderGameComponents = function () {
  // Canvas background color, dimensions and position (centered by flex in css)
  context.fillStyle = 'black';
  context.fillRect(0, 0, width, height);
  // Paddle color
  context.fillStyle = 'white';
  // PC paddle (top)
  context.fillRect(paddleTopX, 10, paddleWidth, paddleHeight);
  // Player paddle (bottom)
  context.fillRect(paddleBottomX, height - 20, paddleWidth, paddleHeight);
  // Center line
  context.beginPath();
  context.setLineDash([20, 5]);
  context.moveTo(0, 350);
  context.lineTo(500, 350);
  context.strokeStyle = 'white';
  context.stroke();
  // Ball
  context.beginPath();
  context.arc(ballX, ballY, ballRadius, 2 * Math.PI, false);
  context.fillStyle = 'white';
  context.fill();
  // Scores
  context.font = '32px Courier New';
  context.fillText(playerScore, 20, canvas.height / 2 + 50);
  context.fillText(computerScore, 20, canvas.height / 2 - 30);
};

// Create the canvas
const createCanvas = function () {
  // Set the width and height to our defined constants
  canvas.width = width;
  canvas.height = height;
  // Append the canvas to the body
  body.appendChild(canvas);
  // Render all game components
  renderGameComponents();
};

// Reset ball specs
const ballReset = function () {
  // Center the ball
  ballX = width / 2;
  ballY = height / 2;
  // Set the speed
  speedY = -3;
  // Paddle contact constant to false
  paddleContact = false;
};

// Adjust ball movement
const ballMove = function () {
  // Vertical speed
  ballY += -speedY;
  // Horizontal speed
  if (playerMoved && paddleContact) ballX += speedX;
};

// Determine What Ball Bounces Off, Score Points, Reset Ball
const ballBounceAndScore = function () {
  // Bounce off left game pad wall
  if (ballX < 0 && speedX < 0) {
    speedX = -speedX;
  }
  // Bounce off right game pad wall
  if (ballX > width && speedX > 0) {
    speedX = -speedX;
  }
  // Bounce off player paddle (bottom)
  if (ballY > height - paddleDiff) {
    if (ballX > paddleBottomX && ballX < paddleBottomX + paddleWidth) {
      paddleContact = true;
      // Raise speed on hit
      if (playerMoved) {
        speedY -= 1;
        // Max speed
        if (speedY < -5) {
          speedY = -5;
          computerSpeed = 6;
        }
      }
      speedY = -speedY;
      trajectoryX = ballX - (paddleBottomX + paddleDiff);
      speedX = trajectoryX * 0.3;
    } else if (ballY > height) {
      // Reset ball, add to computer score
      ballReset();
      computerScore++;
    }
  }
  // Bounce off computer paddle (top)
  if (ballY < paddleDiff) {
    if (ballX > paddleTopX && ballX < paddleTopX + paddleWidth) {
      // Rise speed on hit
      if (playerMoved) {
        speedY += 1;
        // Max speed
        if (speedY > 5) speedY = 5;
      }
      speedY = -speedY;
    } else if (ballY < 0) {
      // Reset Ball, add to Player Score
      ballReset();
      playerScore++;
    }
  }
};

// Computer's paddle movement
const computerMovement = function () {
  if (playerMoved) {
    paddleTopX + paddleDiff < ballX
      ? (paddleTopX += computerSpeed)
      : (paddleTopX -= computerSpeed);
  }
};

const showGameOverEl = function (winner) {
  // Hide the game view
  canvas.hidden = true;
  // Clear the div
  gameOverEl.textContent = '';
  // Container
  gameOverEl.classList.add('game-over-container');
  // Title
  const title = document.createElement('h1');
  title.textContent = `${winner} wins!`;
  // Button
  const playAgainBtn = document.createElement('button');
  playAgainBtn.setAttribute('onclick', 'startGame()');
  playAgainBtn.textContent = 'Play again';
  // Append
  gameOverEl.append(title,playAgainBtn);
  body.appendChild(gameOverEl);
};

// Check If One Player Has Winning Score, If They Do, End Game
const gameOver = function () {
  if (playerScore === winningScore || computerScore === winningScore) {
    isGameOver = true;
    // Set winner
    const winner = playerScore === winningScore ? 'Human' : 'Computer';
    showGameOverEl(winner);
  }
};

// Animate by running these functions each frame
const animate = function () {
  // Render all game components
  renderGameComponents();
  // Ball movement on X and Y
  ballMove();
  // Ball bounce of walls, paddles and increase score
  ballBounceAndScore();
  // Move computer's paddle
  computerMovement();
  //
  gameOver();
  // Use request animation frame to continuously run this function, only if the game is not over
  if (!isGameOver) window.requestAnimationFrame(animate);
};

// Start new game
const startGame = function () {
  // Runs only when a game is finished and the player pushed play again
  if (isGameOver && !isNewGame) {
    body.removeChild(gameOverEl)
    canvas.hidden = false
  }
  isGameOver = false;
  isNewGame = false;
  // Reset scores
  playerScore = 0;
  computerScore = 0;
  // Center the ball, create canvas and game components,
  ballReset();
  createCanvas();
  animate();
  // Track mouse X coordinates on the canvas
  canvas.addEventListener('mousemove', e => {
    playerMoved = true;
    // Take into account the css flex center
    paddleBottomX = e.clientX - canvasPosition - paddleDiff;
    // Limit paddle to the left of the game pad
    if (paddleBottomX < paddleDiff) {
      paddleBottomX = 0;
    }
    // Limit paddle to the right of the game pad
    if (paddleBottomX > width - paddleWidth) {
      paddleBottomX = width - paddleWidth;
    }
    // Hide mouse cursor
    canvas.style.cursor = 'none';
  });
};

// Initialization
startGame();
