(function () {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    const WIN = 7;
    const PADDLE_W = 12;
    const PADDLE_H = 88;
    const BALL_R = 8;
    const SPEED = 6.2;
    const AI_SPEED = 4.8;
    const MAX_SPEED = 9;
    const MIN_X_SPEED = 4.8;

    let leftY = H / 2 - PADDLE_H / 2;
    let rightY = H / 2 - PADDLE_H / 2;
    let ball = { x: W / 2, y: H / 2, vx: SPEED, vy: SPEED * 0.65 };
    let scoreLeft = 0;
    let scoreRight = 0;
    let matchOver = false;
    const keys = { w: false, s: false, ArrowUp: false, ArrowDown: false };

    const elLeft = document.getElementById('score-left');
    const elRight = document.getElementById('score-right');
    const statusEl = document.getElementById('game-status');

    function normalizeBallSpeed() {
        const currentSpeed = Math.hypot(ball.vx, ball.vy) || SPEED;
        const scale = SPEED / currentSpeed;
        ball.vx *= scale;
        ball.vy *= scale;

        if (Math.abs(ball.vx) < MIN_X_SPEED) {
            const dirX = ball.vx >= 0 ? 1 : -1;
            ball.vx = dirX * MIN_X_SPEED;
            const vySign = ball.vy >= 0 ? 1 : -1;
            const vyMag = Math.sqrt(Math.max(0, SPEED * SPEED - ball.vx * ball.vx));
            ball.vy = vySign * vyMag;
        }
    }

    function resetBall(dir) {
        ball.x = W / 2;
        ball.y = H / 2;
        const angle = (Math.random() * 0.6 + 0.2) * Math.PI;
        const d = dir || (Math.random() < 0.5 ? 1 : -1);
        ball.vx = Math.cos(angle) * SPEED * d;
        ball.vy = (Math.random() < 0.5 ? -1 : 1) * Math.sin(angle) * SPEED;
        normalizeBallSpeed();
    }

    function resetMatch() {
        leftY = H / 2 - PADDLE_H / 2;
        rightY = H / 2 - PADDLE_H / 2;
        scoreLeft = 0;
        scoreRight = 0;
        matchOver = false;
        elLeft.textContent = '0';
        elRight.textContent = '0';
        statusEl.textContent = 'W / S or ↑ / ↓ — first to 7 wins';
        resetBall(Math.random() < 0.5 ? 1 : -1);
    }

    function clamp(y) {
        return Math.max(0, Math.min(H - PADDLE_H, y));
    }

    function update() {
        if (matchOver) return;

        if (keys.w || keys.ArrowUp) leftY = clamp(leftY - 6);
        if (keys.s || keys.ArrowDown) leftY = clamp(leftY + 6);

        const target = ball.y - PADDLE_H / 2;
        if (rightY < target - 2) rightY = clamp(rightY + AI_SPEED);
        else if (rightY > target + 2) rightY = clamp(rightY - AI_SPEED);

        ball.x += ball.vx;
        ball.y += ball.vy;

        if (ball.y - BALL_R < 0 || ball.y + BALL_R > H) {
            ball.vy *= -1;
            ball.y = Math.max(BALL_R, Math.min(H - BALL_R, ball.y));
        }

        if (ball.x - BALL_R < PADDLE_W && ball.y > leftY && ball.y < leftY + PADDLE_H && ball.vx < 0) {
            ball.vx *= -1;
            ball.x = PADDLE_W + BALL_R;
            ball.vy += (ball.y - (leftY + PADDLE_H / 2)) * 0.12;
            normalizeBallSpeed();
        }

        if (ball.x + BALL_R > W - PADDLE_W && ball.y > rightY && ball.y < rightY + PADDLE_H && ball.vx > 0) {
            ball.vx *= -1;
            ball.x = W - PADDLE_W - BALL_R;
            ball.vy += (ball.y - (rightY + PADDLE_H / 2)) * 0.12;
            normalizeBallSpeed();
        }

        ball.vy = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, ball.vy));

        if (ball.x < 0) {
            scoreRight++;
            elRight.textContent = String(scoreRight);
            checkWin();
            if (!matchOver) resetBall(1);
        } else if (ball.x > W) {
            scoreLeft++;
            elLeft.textContent = String(scoreLeft);
            checkWin();
            if (!matchOver) resetBall(-1);
        }
    }

    function checkWin() {
        if (scoreLeft >= WIN) {
            matchOver = true;
            statusEl.textContent = 'You win! Reset to play again';
        } else if (scoreRight >= WIN) {
            matchOver = true;
            statusEl.textContent = 'CPU wins — Reset to try again';
        }
    }

    function draw() {
        ctx.fillStyle = '#0a1628';
        ctx.fillRect(0, 0, W, H);

        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.setLineDash([10, 14]);
        ctx.beginPath();
        ctx.moveTo(W / 2, 0);
        ctx.lineTo(W / 2, H);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#1abc9c';
        ctx.fillRect(0, leftY, PADDLE_W, PADDLE_H);
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(W - PADDLE_W, rightY, PADDLE_W, PADDLE_H);

        ctx.fillStyle = '#ecf0f1';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
        ctx.fill();
    }

    function loop() {
        update();
        draw();
        requestAnimationFrame(loop);
    }

    document.addEventListener('keydown', (e) => {
        if (e.code === 'KeyW') keys.w = true;
        if (e.code === 'KeyS') keys.s = true;
        if (e.code === 'ArrowUp') {
            keys.ArrowUp = true;
            e.preventDefault();
        }
        if (e.code === 'ArrowDown') {
            keys.ArrowDown = true;
            e.preventDefault();
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.code === 'KeyW') keys.w = false;
        if (e.code === 'KeyS') keys.s = false;
        if (e.code === 'ArrowUp') keys.ArrowUp = false;
        if (e.code === 'ArrowDown') keys.ArrowDown = false;
    });

    document.getElementById('reset-btn').addEventListener('click', resetMatch);
    document.getElementById('home-btn').addEventListener('click', () => {
        window.location.href = '../index.html';
    });

    resetMatch();
    requestAnimationFrame(loop);
})();
