(function () {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    const scoreEl = document.getElementById('score');
    const bestEl = document.getElementById('best');
    const statusEl = document.getElementById('game-status');

    const BEST_KEY = 'floppy-best';
    const LEGACY_KEY = 'flappy-best';

    const GRAVITY = 0.42;
    const FLAP = -7.8;
    const PIPE_W = 46;
    const GAP = 128;
    const PIPE_SPACING = 168;
    const SPEED = 2.4;
    const DISK_X = 72;
    const HIT_RX = 12;
    const HIT_RY = 14;

    let disk = { y: H / 2, vy: 0 };
    let pipes = [];
    let score = 0;
    let best = 0;
    let started = false;
    let gameOver = false;

    function loadBest() {
        let v = localStorage.getItem(BEST_KEY);
        if (v === null) v = localStorage.getItem(LEGACY_KEY);
        best = parseInt(v || '0', 10) || 0;
        bestEl.textContent = String(best);
    }

    function reset() {
        disk = { y: H / 2, vy: 0 };
        pipes = [];
        score = 0;
        started = false;
        gameOver = false;
        scoreEl.textContent = '0';
        loadBest();
        statusEl.textContent = 'Click, tap, or Space to flap — avoid the pillars';
    }

    function flap() {
        if (gameOver) {
            reset();
            return;
        }
        if (!started) {
            started = true;
            statusEl.textContent = 'Flying!';
        }
        disk.vy = FLAP;
    }

    function ellipseRectHit(cx, cy, rx, ry, rxx, ryy, rw, rh) {
        const nx = Math.max(rxx, Math.min(cx, rxx + rw));
        const ny = Math.max(ryy, Math.min(cy, ryy + rh));
        const dx = (cx - nx) / rx;
        const dy = (cy - ny) / ry;
        return dx * dx + dy * dy < 1;
    }

    function hitPipe(p) {
        const cx = DISK_X;
        const cy = disk.y;
        const topH = p.gapY;
        const botY = p.gapY + GAP;
        return (
            ellipseRectHit(cx, cy, HIT_RX, HIT_RY, p.x, 0, PIPE_W, topH) ||
            ellipseRectHit(cx, cy, HIT_RX, HIT_RY, p.x, botY, PIPE_W, H - botY)
        );
    }

    function spawnPipe() {
        const minGapTop = 56;
        const maxGapTop = H - GAP - minGapTop;
        const gapY = minGapTop + Math.random() * (maxGapTop - minGapTop);
        pipes.push({ x: W, gapY, scored: false });
    }

    function endGame() {
        gameOver = true;
        started = false;
        if (score > best) {
            best = score;
            localStorage.setItem(BEST_KEY, String(best));
            bestEl.textContent = String(best);
        }
        statusEl.textContent = 'Game over — flap or Reset to try again';
    }

    function update() {
        if (gameOver) return;

        if (!started) {
            disk.y = H / 2 + Math.sin(performance.now() / 400) * 6;
            disk.vy = 0;
            return;
        }

        disk.vy += GRAVITY;
        disk.y += disk.vy;

        if (disk.y + HIT_RY >= H || disk.y - HIT_RY <= 0) {
            endGame();
            return;
        }

        const rightmost = pipes.length ? Math.max(...pipes.map((p) => p.x)) : -999;
        if (pipes.length === 0 || rightmost < W - PIPE_SPACING) {
            spawnPipe();
        }

        for (const p of pipes) {
            p.x -= SPEED;
            if (!p.scored && p.x + PIPE_W < DISK_X) {
                p.scored = true;
                score++;
                scoreEl.textContent = String(score);
            }
        }

        pipes = pipes.filter((p) => p.x > -PIPE_W);

        for (const p of pipes) {
            if (hitPipe(p)) {
                endGame();
                return;
            }
        }
    }

    function drawFloppyDisk(tilt) {
        ctx.save();
        ctx.rotate(tilt);

        const w = 26;
        const h = 22;
        ctx.fillStyle = '#37474f';
        ctx.strokeStyle = '#263238';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        const r = 3;
        ctx.moveTo(-w / 2 + r, -h / 2);
        ctx.lineTo(w / 2 - r, -h / 2);
        ctx.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
        ctx.lineTo(w / 2, h / 2 - r);
        ctx.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
        ctx.lineTo(-w / 2 + r, h / 2);
        ctx.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
        ctx.lineTo(-w / 2, -h / 2 + r);
        ctx.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#78909c';
        ctx.fillRect(4, -h / 2 + 3, 9, h - 6);
        ctx.strokeStyle = '#546e7a';
        ctx.strokeRect(4, -h / 2 + 3, 9, h - 6);

        ctx.fillStyle = '#ff7043';
        ctx.fillRect(-w / 2 + 3, -h / 2 + 4, 14, 9);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 7px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('HD', -w / 2 + 10, -h / 2 + 10);

        ctx.fillStyle = '#263238';
        ctx.beginPath();
        ctx.arc(-6, 5, 2.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#455a64';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#eceff1';
        ctx.fillRect(-w / 2 + 3, h / 2 - 5, w - 6, 3);

        ctx.restore();
    }

    function drawGridBg() {
        ctx.fillStyle = '#1a237e';
        ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = 'rgba(100, 181, 246, 0.08)';
        ctx.lineWidth = 1;
        for (let x = 0; x < W; x += 24) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, H);
            ctx.stroke();
        }
        for (let y = 0; y < H; y += 24) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(W, y);
            ctx.stroke();
        }
    }

    function drawPipe(p) {
        const topH = p.gapY;
        const botY = p.gapY + GAP;
        const glow = 'rgba(0, 229, 255, 0.15)';

        ctx.fillStyle = '#37474f';
        ctx.fillRect(p.x, 0, PIPE_W, topH);
        ctx.fillRect(p.x, botY, PIPE_W, H - botY);

        ctx.fillStyle = '#263238';
        ctx.fillRect(p.x + 4, 0, 6, topH);
        ctx.fillRect(p.x + 4, botY, 6, H - botY);

        ctx.fillStyle = glow;
        ctx.fillRect(p.x + 14, 0, 4, topH);
        ctx.fillRect(p.x + 14, botY, 4, H - botY);

        ctx.fillStyle = '#546e7a';
        ctx.fillRect(p.x - 2, topH - 14, PIPE_W + 4, 14);
        ctx.fillRect(p.x - 2, botY, PIPE_W + 4, 14);

        ctx.fillStyle = '#00e5ff';
        ctx.fillRect(p.x + 2, topH - 10, PIPE_W - 4, 3);
        ctx.fillRect(p.x + 2, botY + 4, PIPE_W - 4, 3);
    }

    function draw() {
        drawGridBg();

        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.fillRect(0, H - 32, W, 32);
        ctx.fillStyle = '#5c6bc0';
        for (let x = 0; x < W; x += 16) {
            ctx.fillRect(x, H - 28, 10, 4);
        }

        for (const p of pipes) {
            drawPipe(p);
        }

        ctx.save();
        ctx.translate(DISK_X, disk.y);
        const tilt = Math.min(Math.max(disk.vy * 0.07, -0.55), 0.85);
        drawFloppyDisk(tilt);
        ctx.restore();

        if (!started && !gameOver) {
            ctx.fillStyle = 'rgba(13, 27, 62, 0.72)';
            ctx.fillRect(0, 0, W, H);
            ctx.fillStyle = '#e1f5fe';
            ctx.font = 'bold 22px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Ready?', W / 2, H / 2 - 14);
            ctx.font = '15px Arial';
            ctx.fillStyle = '#b3e5fc';
            ctx.fillText('Flap to start', W / 2, H / 2 + 14);
        }

        if (gameOver) {
            ctx.fillStyle = 'rgba(13, 27, 62, 0.78)';
            ctx.fillRect(0, 0, W, H);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 26px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Game Over', W / 2, H / 2 - 18);
            ctx.font = '17px Arial';
            ctx.fillStyle = '#b3e5fc';
            ctx.fillText('Score: ' + score, W / 2, H / 2 + 14);
        }
    }

    function loop() {
        update();
        draw();
        requestAnimationFrame(loop);
    }

    document.getElementById('reset-btn').addEventListener('click', reset);
    document.getElementById('home-btn').addEventListener('click', () => {
        window.location.href = '../index.html';
    });

    canvas.addEventListener('click', (e) => {
        e.preventDefault();
        flap();
    });

    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            flap();
        }
    });

    loadBest();
    reset();
    requestAnimationFrame(loop);
})();
