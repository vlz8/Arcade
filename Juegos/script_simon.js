(function () {
    const KEY = 'simon-best';
    const tones = [329.63, 261.63, 392.0, 196.0];
    let ctxAudio = null;

    function beep(freq, ms) {
        try {
            if (!ctxAudio) ctxAudio = new (window.AudioContext || window.webkitAudioContext)();
            const o = ctxAudio.createOscillator();
            const g = ctxAudio.createGain();
            o.connect(g);
            g.connect(ctxAudio.destination);
            o.frequency.value = freq;
            o.type = 'sine';
            g.gain.setValueAtTime(0.12, ctxAudio.currentTime);
            g.gain.exponentialRampToValueAtTime(0.01, ctxAudio.currentTime + ms / 1000);
            o.start();
            o.stop(ctxAudio.currentTime + ms / 1000);
        } catch (_) {}
    }

    const buttons = document.querySelectorAll('.simon-btn');
    const startBtn = document.getElementById('start-btn');
    const levelEl = document.getElementById('level');
    const bestEl = document.getElementById('best');
    const statusEl = document.getElementById('game-status');

    let sequence = [];
    let playerStep = 0;
    let playing = false;
    let accepting = false;
    let best = parseInt(localStorage.getItem(KEY) || '0', 10) || 0;

    function loadBest() {
        best = parseInt(localStorage.getItem(KEY) || '0', 10) || 0;
        bestEl.textContent = String(best);
    }

    function flash(i, ms, done) {
        const btn = document.querySelector('.simon-btn[data-color="' + i + '"]');
        btn.classList.add('lit');
        beep(tones[i], ms);
        setTimeout(() => {
            btn.classList.remove('lit');
            if (done) done();
        }, ms);
    }

    function playSequence(index, cb) {
        if (index >= sequence.length) {
            accepting = true;
            statusEl.textContent = 'Your turn — repeat the sequence';
            if (cb) cb();
            return;
        }
        setTimeout(() => {
            flash(sequence[index], 420, () => {
                playSequence(index + 1, cb);
            });
        }, index === 0 ? 400 : 280);
    }

    function nextRound() {
        sequence.push(Math.floor(Math.random() * 4));
        levelEl.textContent = String(sequence.length);
        accepting = false;
        playing = true;
        startBtn.disabled = true;
        statusEl.textContent = 'Watch…';
        playSequence(0, () => {
            playing = false;
        });
    }

    function startGame() {
        sequence = [];
        playerStep = 0;
        levelEl.textContent = '0';
        statusEl.textContent = 'Watch…';
        nextRound();
    }

    function fail() {
        accepting = false;
        playing = false;
        startBtn.disabled = false;
        const len = sequence.length;
        if (len - 1 > best) {
            best = len - 1;
            localStorage.setItem(KEY, String(best));
            bestEl.textContent = String(best);
        }
        statusEl.textContent = 'Wrong! You reached level ' + Math.max(0, len - 1) + '. Press Start.';
        sequence = [];
        levelEl.textContent = '0';
    }

    function onPadClick(i) {
        if (!accepting || playing) return;
        flash(i, 200, null);
        if (i !== sequence[playerStep]) {
            fail();
            return;
        }
        playerStep++;
        if (playerStep >= sequence.length) {
            accepting = false;
            playerStep = 0;
            if (sequence.length > best) {
                best = sequence.length;
                localStorage.setItem(KEY, String(best));
                bestEl.textContent = String(best);
            }
            statusEl.textContent = 'Nice! Next level…';
            setTimeout(nextRound, 900);
        }
    }

    buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const c = parseInt(btn.dataset.color, 10);
            onPadClick(c);
        });
    });

    startBtn.addEventListener('click', () => {
        if (playing) return;
        startGame();
    });

    document.getElementById('reset-btn').addEventListener('click', () => {
        sequence = [];
        playerStep = 0;
        accepting = false;
        playing = false;
        startBtn.disabled = false;
        levelEl.textContent = '0';
        statusEl.textContent = 'Press Start — watch the sequence, then repeat';
    });

    document.getElementById('home-btn').addEventListener('click', () => {
        window.location.href = '../index.html';
    });

    loadBest();
})();
