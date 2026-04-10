(function () {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    const COLS = 10;
    const ROWS = 5;
    const BRICK_H = 26;
    const BRICK_PAD = 4;
    const BRICK_TOP = 48;
    const brickW = (W - BRICK_PAD * (COLS + 1)) / COLS;
    const paddleW = 96;
    const paddleH = 14;
    const BALL_R = 7;
    const colors = ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#3498db'];

    let paddleX = W / 2 - paddleW / 2;
    let ball = { x: W / 2, y: H - 80, vx: 0, vy: 0, stuck: true };
    let bricks = [];
    let score = 0;
    let lives = 3;
    let gameOver = false;
    let won = false;
    const keys = { left: false, right: false };

    const scoreEl = document.getElementById('score');
    const livesEl = document.getElementById('lives');
    const statusEl = document.getElementById('game-status');

    function buildBricks() {
        bricks = [];
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                bricks.push({
                    x: BRICK_PAD + c * (brickW + BRICK_PAD),
                    y: BRICK_TOP + r * (BRICK_H + BRICK_PAD),
                    alive: true,
                    color: colors[r % colors.length],
                });
            }
        }
    }

    function resetBall() {
        ball.x = paddleX + paddleW / 2;
        ball.y = H - 56;
        ball.vx = 0;
        ball.vy = 0;
        ball.stuck = true;
    }

    function resetGame() {
        buildBricks();
        score = 0;
        lives = 3;
        gameOver = false;
        won = false;
        paddleX = W / 2 - paddleW / 2;
        scoreEl.textContent = '0';
        livesEl.textContent = '3';
        statusEl.textContent = '← → or A D — Space to launch ball';
        resetBall();
    }

    function launch() {
        if (!ball.stuck || gameOver || won) return;
        ball.stuck = false;
        const a = (Math.random() * 0.5 + 0.25) * Math.PI;
        ball.vx = Math.cos(a) * (Math.random() < 0.5 ? -1 : 1) * 5;
        ball.vy = -Math.sin(a) * 5.5;
    }

    function brickAt(ix, iy) {
        return iy * COLS + ix;
    }

    function update() {
        if (gameOver || won) return;

        if (keys.left) paddleX = Math.max(0, paddleX - 7);
        if (keys.right) paddleX = Math.min(W - paddleW, paddleX + 7);

        if (ball.stuck) {
            ball.x = paddleX + paddleW / 2;
            ball.y = H - 56;
            return;
        }

        ball.x += ball.vx;
        ball.y += ball.vy;

        if (ball.x - BALL_R < 0 || ball.x + BALL_R > W) {
            ball.vx *= -1;
            ball.x = Math.max(BALL_R, Math.min(W - BALL_R, ball.x));
        }
        if (ball.y - BALL_R < 0) {
            ball.vy *= -1;
            ball.y = BALL_R;
        }

        if (ball.y + BALL_R > H) {
            lives--;
            livesEl.textContent = String(lives);
            if (lives <= 0) {
                gameOver = true;
                statusEl.textContent = 'Game over — Reset to play again';
            } else {
                resetBall();
                statusEl.textContent = 'Space to launch — Lives: ' + lives;
            }
            return;
        }

        if (
            ball.y + BALL_R >= H - paddleH - 8 &&
            ball.y + BALL_R <= H - 4 &&
            ball.x >= paddleX &&
            ball.x <= paddleX + paddleW &&
            ball.vy > 0
        ) {
            ball.vy *= -1;
            const hit = (ball.x - (paddleX + paddleW / 2)) / (paddleW / 2);
            ball.vx += hit * 2.5;
            ball.y = H - paddleH - 8 - BALL_R;
        }

        for (const b of bricks) {
            if (!b.alive) continue;
            if (
                ball.x + BALL_R > b.x &&
                ball.x - BALL_R < b.x + brickW &&
                ball.y + BALL_R > b.y &&
                ball.y - BALL_R < b.y + BRICK_H
            ) {
                b.alive = false;
                score += 10;
                scoreEl.textContent = String(score);
                const overlapL = ball.x + BALL_R - b.x;
                const overlapR = b.x + brickW - (ball.x - BALL_R);
                const overlapT = ball.y + BALL_R - b.y;
                const overlapB = b.y + BRICK_H - (ball.y - BALL_R);
                const m = Math.min(overlapL, overlapR, overlapT, overlapB);
                if (m === overlapL || m === overlapR) ball.vx *= -1;
                else ball.vy *= -1;
                break;
            }
        }

        if (bricks.every((b) => !b.alive)) {
            won = true;
            statusEl.textContent = 'You cleared the wall! Reset to play again';
        }
    }

    function draw() {
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, W, H);

        for (const b of bricks) {
            if (!b.alive) continue;
            ctx.fillStyle = b.color;
            ctx.fillRect(b.x, b.y, brickW, BRICK_H);
            ctx.strokeStyle = 'rgba(0,0,0,0.25)';
            ctx.strokeRect(b.x, b.y, brickW, BRICK_H);
        }

        ctx.fillStyle = '#ecf0f1';
        ctx.fillRect(paddleX, H - paddleH - 6, paddleW, paddleH);

        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
        ctx.fill();

        if (won || gameOver) {
            ctx.fillStyle = 'rgba(0,0,0,0.45)';
            ctx.fillRect(0, 0, W, H);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 28px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(won ? 'You win!' : 'Game Over', W / 2, H / 2);
        }
    }

    function loop() {
        update();
        draw();
        requestAnimationFrame(loop);
    }

    document.addEventListener('keydown', (e) => {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
            keys.left = true;
            e.preventDefault();
        }
        if (e.code === 'ArrowRight' || e.code === 'KeyD') {
            keys.right = true;
            e.preventDefault();
        }
        if (e.code === 'Space') {
            e.preventDefault();
            launch();
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = false;
        if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = false;
    });

    document.getElementById('reset-btn').addEventListener('click', resetGame);
    document.getElementById('home-btn').addEventListener('click', () => {
        window.location.href = '../index.html';
    });

    resetGame();
    requestAnimationFrame(loop);
})();
