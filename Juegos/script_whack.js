(function () {
    const GRID = 9;
    const DURATION = 30;
    const MOLE_MS_MIN = 450;
    const MOLE_MS_MAX = 900;

    const gridEl = document.getElementById('mole-grid');
    const scoreEl = document.getElementById('score');
    const timeEl = document.getElementById('time');
    const statusEl = document.getElementById('game-status');
    const startBtn = document.getElementById('start-btn');

    let score = 0;
    let timeLeft = DURATION;
    let active = false;
    let timerId = null;
    let moleTimer = null;
    let currentHole = -1;

    function buildGrid() {
        gridEl.innerHTML = '';
        for (let i = 0; i < GRID; i++) {
            const hole = document.createElement('button');
            hole.type = 'button';
            hole.className = 'hole';
            hole.dataset.index = String(i);
            const mole = document.createElement('span');
            mole.className = 'mole';
            mole.textContent = '🐹';
            mole.setAttribute('aria-hidden', 'true');
            hole.appendChild(mole);
            hole.addEventListener('click', () => whack(i));
            gridEl.appendChild(hole);
        }
    }

    function holes() {
        return gridEl.querySelectorAll('.hole');
    }

    function hideMole() {
        if (currentHole >= 0) {
            const h = holes()[currentHole];
            if (h) h.classList.remove('up');
        }
        currentHole = -1;
    }

    function popRandom() {
        hideMole();
        currentHole = Math.floor(Math.random() * GRID);
        holes()[currentHole].classList.add('up');
        const wait = MOLE_MS_MIN + Math.random() * (MOLE_MS_MAX - MOLE_MS_MIN);
        moleTimer = window.setTimeout(() => {
            if (active) popRandom();
        }, wait);
    }

    function whack(index) {
        if (!active) return;
        if (index !== currentHole) return;
        score += 10;
        scoreEl.textContent = String(score);
        window.clearTimeout(moleTimer);
        hideMole();
        if (active) popRandom();
    }

    function endGame() {
        active = false;
        window.clearInterval(timerId);
        window.clearTimeout(moleTimer);
        hideMole();
        startBtn.disabled = false;
        statusEl.textContent = 'Time! Final score: ' + score + ' — Start again?';
    }

    function tick() {
        timeLeft--;
        timeEl.textContent = String(timeLeft);
        if (timeLeft <= 0) endGame();
    }

    function start() {
        window.clearInterval(timerId);
        window.clearTimeout(moleTimer);
        score = 0;
        timeLeft = DURATION;
        scoreEl.textContent = '0';
        timeEl.textContent = String(DURATION);
        active = true;
        startBtn.disabled = true;
        statusEl.textContent = 'Go!';
        hideMole();
        window.clearTimeout(moleTimer);
        popRandom();
        timerId = window.setInterval(tick, 1000);
    }

    function reset() {
        window.clearInterval(timerId);
        window.clearTimeout(moleTimer);
        active = false;
        score = 0;
        timeLeft = DURATION;
        scoreEl.textContent = '0';
        timeEl.textContent = String(DURATION);
        hideMole();
        startBtn.disabled = false;
        statusEl.textContent = 'Press Start — tap moles for +10 points';
    }

    document.getElementById('reset-btn').addEventListener('click', reset);
    document.getElementById('home-btn').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
    startBtn.addEventListener('click', start);

    buildGrid();
})();
