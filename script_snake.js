class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('high-score');
        this.gameStatus = document.getElementById('game-status');
        this.resetBtn = document.getElementById('reset-btn');

        // Game settings
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;

        // Game state
        this.snake = [{ x: 10, y: 10 }];
        this.food = { x: 5, y: 5 };
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.highScore = this.loadHighScore();
        this.gameOver = false;
        this.gameSpeed = 150; // milliseconds between frames
        this.lastTime = 0;

        this.init();
    }

    init() {
        this.resetBtn.addEventListener('click', () => this.resetGame());
        document.getElementById('home-btn').addEventListener('click', () => this.goHome());
        document.addEventListener('keydown', (e) => this.changeDirection(e));
        this.updateScoreDisplay();
        this.gameLoop();
    }

    gameLoop() {
        if (this.gameOver) {
            this.gameStatus.textContent = 'Game Over! Press Reset to Play Again';
            return;
        }

        setTimeout(() => {
            this.clearCanvas();
            this.moveSnake();
            this.drawFood();
            this.drawSnake();
            this.checkCollision();
            this.gameLoop();
        }, this.gameSpeed);
    }

    clearCanvas() {
        this.ctx.fillStyle = '#111';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawSnake() {
        this.snake.forEach((segment, index) => {
            this.ctx.fillStyle = index === 0 ? '#e74c3c' : '#ec7063'; // Head is darker red
            this.ctx.fillRect(segment.x * this.gridSize, segment.y * this.gridSize, this.gridSize - 2, this.gridSize - 2);

            // Add eyes to the head
            if (index === 0) {
                this.ctx.fillStyle = '#000';
                // Left eye
                this.ctx.fillRect(segment.x * this.gridSize + 4, segment.y * this.gridSize + 4, 3, 3);
                // Right eye
                this.ctx.fillRect(segment.x * this.gridSize + this.gridSize - 7, segment.y * this.gridSize + 4, 3, 3);
            }
        });
    }

    drawFood() {
        this.ctx.fillStyle = '#f1c40f'; // Yellow food
        this.ctx.beginPath();
        const radius = (this.gridSize - 2) / 2;
        const centerX = this.food.x * this.gridSize + this.gridSize / 2;
        const centerY = this.food.y * this.gridSize + this.gridSize / 2;
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.fill();

        // Add shine effect
        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.arc(centerX - 2, centerY - 2, 2, 0, Math.PI * 2);
        this.ctx.fill();
    }

    moveSnake() {
        const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };

        // Wrap around screen (optional - comment out for classic snake that dies on wall)
        /* if (head.x < 0) head.x = this.tileCount - 1;
        if (head.x >= this.tileCount) head.x = 0;
        if (head.y < 0) head.y = this.tileCount - 1;
        if (head.y >= this.tileCount) head.y = 0; */

        this.snake.unshift(head);

        // Check if ate food
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score++;
            this.updateScoreDisplay();
            this.placeFood();
            // Increase speed slightly as score increases
            if (this.score % 5 === 0 && this.gameSpeed > 50) {
                this.gameSpeed -= 5;
            }
        } else {
            this.snake.pop(); // Remove tail if didn't eat
        }
    }

    changeDirection(event) {
        const keyPressed = event.keyCode;
        const UP = 38, DOWN = 40, LEFT = 37, RIGHT = 39;

        // Prevent 180-degree turns
        const goingUp = this.dy === -1;
        const goingDown = this.dy === 1;
        const goingLeft = this.dx === -1;
        const goingRight = this.dx === 1;

        if (keyPressed === LEFT && !goingRight) {
            this.dx = -1;
            this.dy = 0;
        }
        if (keyPressed === UP && !goingDown) {
            this.dx = 0;
            this.dy = -1;
        }
        if (keyPressed === RIGHT && !goingLeft) {
            this.dx = 1;
            this.dy = 0;
        }
        if (keyPressed === DOWN && !goingUp) {
            this.dx = 0;
            this.dy = 1;
        }
    }

    checkCollision() {
        const head = this.snake[0];

        // Wall collision (classic snake behavior - die on wall hit)
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            this.gameOver = true;
            return;
        }

        // Self collision
        for (let i = 1; i < this.snake.length; i++) {
            if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                this.gameOver = true;
                return;
            }
        }
    }

    placeFood() {
        let foodX, foodY;
        do {
            foodX = Math.floor(Math.random() * this.tileCount);
            foodY = Math.floor(Math.random() * this.tileCount);
        } while (this.snake.some(segment => segment.x === foodX && segment.y === foodY));

        this.food = { x: foodX, y: foodY };
    }

    updateScoreDisplay() {
        this.scoreElement.textContent = this.score;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.highScoreElement.textContent = this.highScore;
            this.saveHighScore();
        }
    }

    resetGame() {
        this.snake = [{ x: 10, y: 10 }];
        this.food = { x: 5, y: 5 };
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.gameOver = false;
        this.gameSpeed = 150;
        this.gameStatus.textContent = 'Use Arrow Keys to Play';
        this.updateScoreDisplay();
        // Restart the game loop
        this.lastTime = performance.now();
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    goHome() {
        window.location.href = 'index.html';
    }

    loadHighScore() {
        return parseInt(localStorage.getItem('snakeHighScore')) || 0;
    }

    saveHighScore() {
        localStorage.setItem('snakeHighScore', this.highScore);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
});