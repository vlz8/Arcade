(function () {
    const ROWS = 6;
    const COLS = 7;
    const boardEl = document.getElementById('board');
    const dropRow = document.getElementById('drop-row');
    const turnLabel = document.getElementById('turn-label');
    const statusEl = document.getElementById('game-status');

    let grid = [];
    let current = 1;
    let gameOver = false;

    const cells = [];

    function buildBoard() {
        boardEl.innerHTML = '';
        dropRow.innerHTML = '';
        cells.length = 0;
        for (let c = 0; c < COLS; c++) {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'drop-btn';
            b.textContent = '▼';
            b.dataset.col = String(c);
            b.addEventListener('click', () => drop(c));
            dropRow.appendChild(b);
        }
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const div = document.createElement('div');
                div.className = 'cell';
                div.dataset.r = String(r);
                div.dataset.c = String(c);
                boardEl.appendChild(div);
                if (!cells[r]) cells[r] = [];
                cells[r][c] = div;
            }
        }
    }

    function reset() {
        grid = Array(ROWS)
            .fill(null)
            .map(() => Array(COLS).fill(0));
        current = 1;
        gameOver = false;
        buildBoard();
        updateTurnUi();
        statusEl.textContent = 'Red goes first — click a column arrow';
        setDropEnabled(true);
    }

    function updateTurnUi() {
        turnLabel.textContent = current === 1 ? 'Red' : 'Yellow';
        turnLabel.className = current === 1 ? '' : 'yellow';
    }

    function setDropEnabled(on) {
        dropRow.querySelectorAll('.drop-btn').forEach((b) => {
            b.disabled = !on;
        });
    }

    function columnTop(col) {
        for (let r = ROWS - 1; r >= 0; r--) {
            if (grid[r][col] === 0) return r;
        }
        return -1;
    }

    function checkWin(player) {
        const dirs = [
            [0, 1],
            [1, 0],
            [1, 1],
            [1, -1],
        ];
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (grid[r][c] !== player) continue;
                for (const [dr, dc] of dirs) {
                    let n = 1;
                    for (let k = 1; k < 4; k++) {
                        const nr = r + dr * k;
                        const nc = c + dc * k;
                        if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) break;
                        if (grid[nr][nc] !== player) break;
                        n++;
                    }
                    if (n >= 4) return true;
                }
            }
        }
        return false;
    }

    function boardFull() {
        return grid[0].every((v) => v !== 0);
    }

    function drop(col) {
        if (gameOver) return;
        const row = columnTop(col);
        if (row < 0) return;

        grid[row][col] = current;
        const el = cells[row][col];
        el.classList.remove('red', 'yellow');
        el.classList.add(current === 1 ? 'red' : 'yellow');

        if (checkWin(current)) {
            gameOver = true;
            statusEl.textContent = (current === 1 ? 'Red' : 'Yellow') + ' wins!';
            setDropEnabled(false);
            return;
        }

        if (boardFull()) {
            gameOver = true;
            statusEl.textContent = "It's a draw!";
            setDropEnabled(false);
            return;
        }

        current = current === 1 ? 2 : 1;
        updateTurnUi();
    }

    document.getElementById('reset-btn').addEventListener('click', reset);
    document.getElementById('home-btn').addEventListener('click', () => {
        window.location.href = '../index.html';
    });

    reset();
})();
