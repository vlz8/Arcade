(function () {
    const KEY = 'guess-best';
    const input = document.getElementById('guess-input');
    const guessBtn = document.getElementById('guess-btn');
    const attemptsEl = document.getElementById('attempts');
    const bestEl = document.getElementById('best');
    const statusEl = document.getElementById('game-status');
    const historyEl = document.getElementById('history');

    let secret = 0;
    let attempts = 0;
    let solved = false;

    function loadBest() {
        const v = localStorage.getItem(KEY);
        bestEl.textContent = v === null ? '—' : v;
    }

    function newGame() {
        secret = Math.floor(Math.random() * 100) + 1;
        attempts = 0;
        solved = false;
        attemptsEl.textContent = '0';
        statusEl.textContent = 'Type a number and press Guess';
        historyEl.innerHTML = '';
        input.value = '';
        input.disabled = false;
        guessBtn.disabled = false;
        input.focus();
    }

    function guess() {
        if (solved) return;
        const n = parseInt(input.value, 10);
        if (Number.isNaN(n) || n < 1 || n > 100) {
            statusEl.textContent = 'Enter a whole number between 1 and 100';
            return;
        }
        attempts++;
        attemptsEl.textContent = String(attempts);

        const line = document.createElement('div');
        if (n === secret) {
            line.textContent = attempts + '. ' + n + ' — You got it!';
            historyEl.prepend(line);
            solved = true;
            statusEl.textContent = '🎉 Correct in ' + attempts + ' tries!';
            input.disabled = true;
            guessBtn.disabled = true;

            const prev = localStorage.getItem(KEY);
            const prevN = prev === null ? null : parseInt(prev, 10);
            if (prevN === null || attempts < prevN) {
                localStorage.setItem(KEY, String(attempts));
                bestEl.textContent = String(attempts);
            }
        } else if (n < secret) {
            line.textContent = attempts + '. ' + n + ' — Higher ↑';
            historyEl.prepend(line);
            statusEl.textContent = 'Higher than ' + n;
        } else {
            line.textContent = attempts + '. ' + n + ' — Lower ↓';
            historyEl.prepend(line);
            statusEl.textContent = 'Lower than ' + n;
        }
        input.value = '';
        input.focus();
    }

    guessBtn.addEventListener('click', guess);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') guess();
    });

    document.getElementById('reset-btn').addEventListener('click', newGame);
    document.getElementById('home-btn').addEventListener('click', () => {
        window.location.href = '../index.html';
    });

    loadBest();
    newGame();
})();
