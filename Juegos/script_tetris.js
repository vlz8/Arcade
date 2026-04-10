class TetrisGame {
    constructor() {
        this.grid = document.getElementById('tetris-grid');
        this.previewGrid = document.getElementById('preview-grid');
        this.scoreElement = document.getElementById('score');
        this.linesElement = document.getElementById('lines');
        this.highScoreElement = document.getElementById('high-score');
        this.HIGH_SCORE_KEY = 'tetris-high-score';
        this.gameStatus = document.getElementById('game-status');
        this.resetBtn = document.getElementById('reset-btn');

        // Game constants
        this.ROWS = 20;
        this.COLS = 10;
        this.PREVIEW_SIZE = 4;

        // Tetromino shapes (I, J, L, O, S, T, Z)
        this.TETROMINOES = [
            [[1, 1, 1, 1]],                                    // I
            [[2, 0, 0], [2, 2, 2]],                            // J
            [[0, 0, 3], [3, 3, 3]],                            // L
            [[4, 4], [4, 4]],                                  // O
            [[0, 5, 5], [5, 5, 0]],                            // S
            [[0, 6, 0], [6, 6, 6]],                            // T
            [[7, 7, 0], [0, 7, 7]]                             // Z
        ];

        // Game state
        this.board = Array(this.ROWS).fill().map(() => Array(this.COLS).fill(0));
        this.currentPiece = null;
        this.nextPiece = null;
        this.currentX = 0;
        this.currentY = 0;
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.gameOver = false;
        this.isPaused = false;
        this.dropCounter = 0;
        this.dropInterval = 1000; // Start with 1 second drop speed
        this.lastTime = 0;
        this.highScore = this.loadHighScore();

        this.init();
    }

    loadHighScore() {
        const v = localStorage.getItem(this.HIGH_SCORE_KEY);
        const n = parseInt(v || '0', 10);
        return Number.isFinite(n) ? n : 0;
    }

    saveHighScoreIfNeeded() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem(this.HIGH_SCORE_KEY, String(this.highScore));
        }
    }

    createMainGrid() {
        this.grid.innerHTML = '';
        for (let i = 0; i < this.ROWS * this.COLS; i++) {
            const cell = document.createElement('div');
            cell.className = 'tetris-cell';
            this.grid.appendChild(cell);
        }
    }

    init() {
        this.resetBtn.addEventListener('click', () => this.resetGame());
        document.getElementById('home-btn').addEventListener('click', () => this.goHome());
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        this.createMainGrid();
        this.createPreviewGrid();
        this.resetGame();
        this.updateDisplay();
        // Start the game loop
        this.lastTime = performance.now();
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    createPreviewGrid() {
        this.previewGrid.innerHTML = '';
        for (let i = 0; i < this.PREVIEW_SIZE * this.PREVIEW_SIZE; i++) {
            const cell = document.createElement('div');
            cell.className = 'preview-cell';
            this.previewGrid.appendChild(cell);
        }
    }

    resetGame() {
        const wasGameOver = this.gameOver;
        this.board = Array(this.ROWS).fill().map(() => Array(this.COLS).fill(0));
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.gameOver = false;
        this.dropInterval = 1000;
        this.dropCounter = 0;
        this.nextPiece = null;
        this.spawnPiece();
        this.spawnNextPiece();
        this.updateDisplay();
        this.gameStatus.textContent = 'Use Arrow Keys to Play';
        this.lastTime = performance.now();
        if (wasGameOver) {
            requestAnimationFrame(this.gameLoop.bind(this));
        }
    }

    spawnPiece() {
        if (this.nextPiece) {
            this.currentPiece = this.nextPiece;
        } else {
            this.currentPiece = this.TETROMINOES[Math.floor(Math.random() * this.TETROMINOES.length)];
        }
        this.currentX = Math.floor((this.COLS - this.currentPiece[0].length) / 2);
        this.currentY = 0;

        // Check if spawn position is occupied (game over)
        if (this.checkCollision(this.currentPiece, this.currentX, this.currentY)) {
            this.gameOver = true;
            this.saveHighScoreIfNeeded();
            this.gameStatus.textContent = 'Game Over! Press Reset to Play Again';
            this.updateDisplay();
        }
    }

    spawnNextPiece() {
        this.nextPiece = this.TETROMINOES[Math.floor(Math.random() * this.TETROMINOES.length)];
        this.drawPreview();
    }

    drawPreview() {
        const cells = this.previewGrid.querySelectorAll('.preview-cell');
        cells.forEach(cell => cell.className = 'preview-cell');

        if (!this.nextPiece) return;

        const pieceWidth = this.nextPiece[0].length;
        const pieceHeight = this.nextPiece.length;
        const startX = Math.floor((this.PREVIEW_SIZE - pieceWidth) / 2);
        const startY = Math.floor((this.PREVIEW_SIZE - pieceHeight) / 2);

        this.nextPiece.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    const index = ((startY + y) * this.PREVIEW_SIZE + (startX + x));
                    cells[index].className = `preview-cell cell-${value - 1}`;
                }
            });
        });
    }

    checkCollision(piece, offsetX, offsetY) {
        for (let y = 0; y < piece.length; y++) {
            for (let x = 0; x < piece[y].length; x++) {
                if (piece[y][x] !== 0) {
                    const newX = offsetX + x;
                    const newY = offsetY + y;

                    // Check bounds
                    if (newX < 0 || newX >= this.COLS || newY >= this.ROWS) {
                        return true;
                    }

                    // Check collision with existing pieces
                    if (newY >= 0 && this.board[newY][newX] !== 0) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    mergePiece() {
        for (let y = 0; y < this.currentPiece.length; y++) {
            for (let x = 0; x < this.currentPiece[y].length; x++) {
                if (this.currentPiece[y][x] !== 0) {
                    this.board[this.currentY + y][this.currentX + x] = this.currentPiece[y][x];
                }
            }
        }
    }

    rotatePiece() {
        const rotated = this.currentPiece[0].map((_, index) =>
            this.currentPiece.map(row => row[index]).reverse()
        );

        if (!this.checkCollision(rotated, this.currentX, this.currentY)) {
            this.currentPiece = rotated;
        }
    }

    moveLeft() {
        if (!this.checkCollision(this.currentPiece, this.currentX - 1, this.currentY)) {
            this.currentX--;
        }
    }

    moveRight() {
        if (!this.checkCollision(this.currentPiece, this.currentX + 1, this.currentY)) {
            this.currentX++;
        }
    }

    moveDown() {
        if (!this.checkCollision(this.currentPiece, this.currentX, this.currentY + 1)) {
            this.currentY++;
            return true;
        }
        return false;
    }

    dropPiece() {
        while (this.moveDown()) {
            // Keep moving down until collision
        }
        this.placePiece();
    }

    placePiece() {
        this.mergePiece();
        this.clearLines();
        this.spawnPiece();
        this.spawnNextPiece();

        if (this.gameOver) {
            this.saveHighScoreIfNeeded();
            this.gameStatus.textContent = 'Game Over! Press Reset to Play Again';
            this.updateDisplay();
        }
    }

    clearLines() {
        let linesCleared = 0;

        for (let y = this.ROWS - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell !== 0)) {
                this.board.splice(y, 1);
                this.board.unshift(Array(this.COLS).fill(0));
                linesCleared++;
                y++; // Check same row again after shift
            }
        }

        if (linesCleared > 0) {
            this.lines += linesCleared;
            // Scoring: 40 * level for 1 line, 100 * level for 2, 300 * level for 3, 1200 * level for 4
            const lineScores = [0, 40, 100, 300, 1200];
            this.score += lineScores[linesCleared] * this.level;

            // Level up every 10 lines
            this.level = Math.floor(this.lines / 10) + 1;
            // Increase speed as level increases
            this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 50);

            this.updateDisplay();
        }
    }

    handleKeyPress(event) {
        if (this.gameOver || this.isPaused) return;

        switch(event.key) {
            case 'ArrowLeft':
                this.moveLeft();
                break;
            case 'ArrowRight':
                this.moveRight();
                break;
            case 'ArrowDown':
                this.moveDown();
                break;
            case 'ArrowUp':
                this.rotatePiece();
                break;
            case ' ':
                this.dropPiece();
                break;
            case 'p':
            case 'P':
                this.togglePause();
                break;
        }

        this.updateDisplay();
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        this.gameStatus.textContent = this.isPaused ? 'Paused - Press P to Continue' : 'Use Arrow Keys to Play';
    }

    gameLoop(timestamp = 0) {
        if (this.gameOver) return;

        if (this.isPaused) {
            requestAnimationFrame(this.gameLoop.bind(this));
            return;
        }

        const delta = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.dropCounter += delta;
        if (this.dropCounter > this.dropInterval) {
            if (!this.moveDown()) {
                this.placePiece();
            }
            this.dropCounter = 0;
        }

        this.drawBoard();
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    drawBoard() {
        const cells = this.grid.querySelectorAll('.tetris-cell');
        cells.forEach((cell, index) => {
            const row = Math.floor(index / this.COLS);
            const col = index % this.COLS;
            const value = this.board[row][col];

            if (value !== 0) {
                cell.className = `tetris-cell cell-${value - 1}`;
            } else {
                cell.className = 'tetris-cell';
            }
        });

        // Draw current piece
        for (let y = 0; y < this.currentPiece.length; y++) {
            for (let x = 0; x < this.currentPiece[y].length; x++) {
                if (this.currentPiece[y][x] !== 0) {
                    const boardY = this.currentY + y;
                    const boardX = this.currentX + x;

                    if (boardY >= 0) {
                        const index = boardY * this.COLS + boardX;
                        const cell = cells[index];
                        if (cell) {
                            cell.className = `tetris-cell cell-${this.currentPiece[y][x] - 1}`;
                        }
                    }
                }
            }
        }
    }

    updateDisplay() {
        this.scoreElement.textContent = this.score;
        this.linesElement.textContent = this.lines;
        this.highScoreElement.textContent = this.highScore;
    }

    goHome() {
        window.location.href = '../index.html';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TetrisGame();
});