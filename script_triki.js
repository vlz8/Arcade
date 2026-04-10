class TicTacToe{

    constructor(){
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.scores = { X: 0, O: 0};
        this.gameOver = false;
        this.initializeGame();
    }

    initializeGame(){
        this.cells = document.querySelectorAll('.cell');
        this.currentPlayerDisplay = document.getElementById('current-player');
        this.scoreX = document.getElementById('score-x');
        this.scoreO = document.getElementById('score-o');
        this.gameStatus = document.getElementById('game-status');

        this.addEventListeners();
    }

    addEventListeners(){
        this.cells.forEach(cell => {
            cell.addEventListener('click', this.handleCellClick.bind(this))
        })

        document.getElementById('reset-btn').addEventListener('click', () => this.resetGame());
        document.getElementById('new-game-btn').addEventListener('click', () => this.newGame());
        document.getElementById('home-btn').addEventListener('click', () => this.goHome());
    }

    handleCellClick(event){
        if (this.gameOver) return;

        const cell = event.target;
        const index = parseInt(cell.getAttribute('data-index'));

        // Don't allow clicking on already filled cells
        if (this.board[index] !== '') return;

        // Place current player's mark
        this.board[index] = this.currentPlayer;
        cell.textContent = this.currentPlayer;
        cell.classList.add(this.currentPlayer.toLowerCase());

        // Check if this move creates a winning condition (3 in a row)
        if (this.checkForLoss()) {
            this.gameOver = true;
            this.gameStatus.textContent = `Player ${this.currentPlayer} wins!`;
            this.gameStatus.classList.add('winner'); 

            this.scores[this.currentPlayer]++;
            this.updateScoreDisplay();
            return;
        }

        // Check for draw (board full with no loser)
        if (this.checkForDraw()) {
            this.gameOver = true;
            this.gameStatus.textContent = "It's a draw!";
            this.gameStatus.classList.add('draw');
            return;
        }

        // Switch player only if game continues
        this.switchPlayer();
    }

    checkForLoss(){
        const winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6]             // diagonals
        ];

        return winningCombinations.some(combination => {
            const [a, b, c] = combination;
            return this.board[a] &&
                   this.board[a] === this.board[b] &&
                   this.board[a] === this.board[c] &&
                   this.board[a] === this.currentPlayer;
        });
    }

    checkForDraw(){
        return this.board.every(cell => cell !== '');
    }

    switchPlayer(){
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' :  'X';
        this.currentPlayerDisplay.textContent = this.currentPlayer;
        // Change background based on player
        const gameBoard = document.getElementById('game-board');
        gameBoard.style.backgroundColor = this.currentPlayer === 'X' ? '#e74c3c' : '#3498db';
    }

    updateScoreDisplay(){
        this.scoreX.textContent = this.scores.X;
        this.scoreO.textContent = this.scores.O;
    }

    resetGame(){
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameOver = false;
        this.gameStatus.textContent = '';
        this.gameStatus.className = 'game-status';

        this.cells.forEach(cell => {
            cell.textContent = '';
            cell.className = 'cell';
        });

        this.currentPlayerDisplay.textContent = this.currentPlayer;
        document.getElementById('game-board').style.backgroundColor = '#e74c3c';
        this.updateScoreDisplay();
    }

    newGame(){
        this.scores = { X: 0, O: 0};
        this.resetGame();
    }

    goHome(){
        window.location.href = 'index.html';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TicTacToe();
});