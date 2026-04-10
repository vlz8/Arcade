(function () {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    const SHIP_R = 12;
    const BULLET_R = 2;
    const BULLET_SPEED = 520;
    const BULLET_LIFE = 0.75;
    const SHOOT_COOLDOWN = 0.22;
    const THRUST = 520;
    const ROT_SPEED = 4.8;
    const MAX_SPEED = 380;
    const INVINCIBLE_TIME = 3;

    const RAD = { 0: 38, 1: 21, 2: 11 };
    const SCORE = { 0: 20, 1: 50, 2: 100 };
    const HIGHSCORE_KEY = 'asteroidsHighScore';

    const elScore = document.getElementById('score');
    const elHighScore = document.getElementById('highscore');
    const elLives = document.getElementById('lives');
    const elLevel = document.getElementById('level');
    const statusEl = document.getElementById('game-status');

    let ship = {
        x: W / 2,
        y: H / 2,
        angle: -Math.PI / 2,
        vx: 0,
        vy: 0
    };

    let bullets = [];
    let asteroids = [];
    let score = 0;
    let lives = 3;
    let level = 1;
    let gameOver = false;
    let invincible = 0;
    let shootTimer = 0;
    let blinkPhase = 0;
    let highScore = 0;

    const keys = {
        ArrowLeft: false,
        ArrowRight: false,
        ArrowUp: false,
        Space: false
    };

    function randomShape(tier) {
        const n = 8 + Math.floor(Math.random() * 5);
        const base = RAD[tier];
        const pts = [];
        for (let i = 0; i < n; i++) {
            const a = (i / n) * Math.PI * 2;
            const d = base * (0.78 + Math.random() * 0.38);
            pts.push(d);
        }
        return pts;
    }

    function wrap(v, max) {
        if (v < 0) return v + max;
        if (v >= max) return v - max;
        return v;
    }

    function dist(a, b) {
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        if (dx > W / 2) dx -= W;
        if (dx < -W / 2) dx += W;
        if (dy > H / 2) dy -= H;
        if (dy < -H / 2) dy += H;
        return Math.hypot(dx, dy);
    }

    function createAsteroid(x, y, tier, vx, vy) {
        return {
            x,
            y,
            tier,
            vx,
            vy,
            rot: Math.random() * Math.PI * 2,
            spin: (Math.random() - 0.5) * 1.2,
            shape: randomShape(tier)
        };
    }

    function spawnWave() {
        asteroids = [];
        const count = Math.min(3 + level * 2, 14);
        for (let i = 0; i < count; i++) {
            let x, y;
            let guard = 0;
            do {
                x = Math.random() * W;
                y = Math.random() * H;
                guard++;
            } while (Math.hypot(x - ship.x, y - ship.y) < 130 && guard < 40);

            const dir = Math.random() * Math.PI * 2;
            const spd = 45 + Math.random() * 70 + level * 8;
            asteroids.push(
                createAsteroid(x, y, 0, Math.cos(dir) * spd, Math.sin(dir) * spd)
            );
        }
    }

    function resetShip() {
        ship.x = W / 2;
        ship.y = H / 2;
        ship.angle = -Math.PI / 2;
        ship.vx = 0;
        ship.vy = 0;
        invincible = INVINCIBLE_TIME;
    }

    function newGame() {
        score = 0;
        lives = 3;
        level = 1;
        gameOver = false;
        bullets = [];
        elScore.textContent = '0';
        elLives.textContent = '3';
        elLevel.textContent = '1';
        statusEl.textContent = '← → rotate · ↑ thrust · clear all rocks to advance';
        resetShip();
        spawnWave();
    }

    function loadHighScore() {
        const saved = localStorage.getItem(HIGHSCORE_KEY);
        if (saved !== null) {
            highScore = parseInt(saved, 10);
            elHighScore.textContent = String(highScore);
        }
    }

    function saveHighScore() {
        if (score > highScore) {
            highScore = score;
            elHighScore.textContent = String(highScore);
            localStorage.setItem(HIGHSCORE_KEY, String(highScore));
        }
    }

    function splitAsteroid(a) {
        const t = a.tier;
        if (t >= 2) return [];
        const next = t + 1;
        const out = [];
        for (let k = 0; k < 2; k++) {
            const dir = Math.random() * Math.PI * 2;
            const spd = 80 + Math.random() * 120;
            out.push(
                createAsteroid(a.x, a.y, next, Math.cos(dir) * spd, Math.sin(dir) * spd)
            );
        }
        return out;
    }

    function tryShoot() {
        if (shootTimer > 0 || gameOver) return;
        shootTimer = SHOOT_COOLDOWN;
        const nx = Math.cos(ship.angle);
        const ny = Math.sin(ship.angle);
        const tip = SHIP_R + 6;
        bullets.push({
            x: ship.x + nx * tip,
            y: ship.y + ny * tip,
            vx: nx * BULLET_SPEED + ship.vx,
            vy: ny * BULLET_SPEED + ship.vy,
            life: BULLET_LIFE
        });
    }

    function updateShip(dt) {
        if (gameOver) return;

        if (keys.ArrowLeft) ship.angle -= ROT_SPEED * dt;
        if (keys.ArrowRight) ship.angle += ROT_SPEED * dt;

        if (keys.ArrowUp) {
            const ax = Math.cos(ship.angle) * THRUST * dt;
            const ay = Math.sin(ship.angle) * THRUST * dt;
            ship.vx += ax;
            ship.vy += ay;
            const sp = Math.hypot(ship.vx, ship.vy);
            if (sp > MAX_SPEED) {
                ship.vx = (ship.vx / sp) * MAX_SPEED;
                ship.vy = (ship.vy / sp) * MAX_SPEED;
            }
        }

        ship.x = wrap(ship.x + ship.vx * dt, W);
        ship.y = wrap(ship.y + ship.vy * dt, H);

        if (invincible > 0) invincible -= dt;
        if (shootTimer > 0) shootTimer -= dt;
        blinkPhase += dt * 12;

        if (keys.Space) tryShoot();
    }

    function updateBullets(dt) {
        for (let i = bullets.length - 1; i >= 0; i--) {
            const b = bullets[i];
            b.x = wrap(b.x + b.vx * dt, W);
            b.y = wrap(b.y + b.vy * dt, H);
            b.life -= dt;
            if (b.life <= 0) bullets.splice(i, 1);
        }
    }

    function updateAsteroids(dt) {
        asteroids.forEach((a) => {
            a.x = wrap(a.x + a.vx * dt, W);
            a.y = wrap(a.y + a.vy * dt, H);
            a.rot += a.spin * dt;
        });
    }

    function handleCollisions() {
        if (gameOver) return;

        let hit = true;
        while (hit) {
            hit = false;
            outer: for (let bi = bullets.length - 1; bi >= 0; bi--) {
                const b = bullets[bi];
                for (let ai = asteroids.length - 1; ai >= 0; ai--) {
                    const a = asteroids[ai];
                    const r = RAD[a.tier];
                    if (dist(b, a) < r + BULLET_R) {
                        bullets.splice(bi, 1);
                        score += SCORE[a.tier];
                        elScore.textContent = String(score);
                        const pieces = splitAsteroid(a);
                        asteroids.splice(ai, 1);
                        asteroids.push(...pieces);
                        hit = true;
                        break outer;
                    }
                }
            }
        }

        if (invincible <= 0) {
            for (let i = asteroids.length - 1; i >= 0; i--) {
                const a = asteroids[i];
                const r = RAD[a.tier];
                if (dist(ship, a) < r + SHIP_R) {
                    lives--;
                    elLives.textContent = String(lives);
                    bullets = [];
                    if (lives <= 0) {
                        gameOver = true;
                        saveHighScore();
                        statusEl.textContent = 'Game over — New game to retry';
                        return;
                    }
                    resetShip();
                    return;
                }
            }
        }

        if (asteroids.length === 0 && !gameOver) {
            level++;
            elLevel.textContent = String(level);
            statusEl.textContent = `Level ${level} — good luck`;
            resetShip();
            spawnWave();
        }
    }

    function drawShip() {
        const blink = invincible > 0 && Math.sin(blinkPhase) > 0;
        if (blink) return;

        ctx.save();
        ctx.translate(ship.x, ship.y);
        ctx.rotate(ship.angle);
        ctx.strokeStyle = '#22d3ee';
        ctx.fillStyle = 'rgba(34, 211, 238, 0.15)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(SHIP_R, 0);
        ctx.lineTo(-SHIP_R * 0.72, SHIP_R * 0.62);
        ctx.lineTo(-SHIP_R * 0.45, 0);
        ctx.lineTo(-SHIP_R * 0.72, -SHIP_R * 0.62);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        if (keys.ArrowUp && !gameOver) {
            ctx.strokeStyle = 'rgba(251, 191, 36, 0.85)';
            ctx.beginPath();
            ctx.moveTo(-SHIP_R * 0.55, 0);
            ctx.lineTo(-SHIP_R * 1.15 - Math.random() * 6, 0);
            ctx.stroke();
        }
        ctx.restore();
    }

    function drawAsteroid(a) {
        const n = a.shape.length;
        ctx.save();
        ctx.translate(a.x, a.y);
        ctx.rotate(a.rot);
        ctx.strokeStyle = '#94a3b8';
        ctx.fillStyle = 'rgba(30, 41, 59, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < n; i++) {
            const ang = (i / n) * Math.PI * 2;
            const d = a.shape[i];
            const px = Math.cos(ang) * d;
            const py = Math.sin(ang) * d;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }

    function drawBullets() {
        ctx.fillStyle = '#fbbf24';
        bullets.forEach((b) => {
            ctx.beginPath();
            ctx.arc(b.x, b.y, BULLET_R, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    function drawStars() {
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        for (let i = 0; i < 48; i++) {
            const sx = (i * 127 + 17) % W;
            const sy = (i * 89 + 31) % H;
            ctx.fillRect(sx, sy, 1 + (i % 2), 1);
        }
    }

    function draw() {
        ctx.fillStyle = '#050508';
        ctx.fillRect(0, 0, W, H);
        drawStars();

        asteroids.forEach(drawAsteroid);
        drawBullets();
        drawShip();
    }

    let last = performance.now();
    function loop(now) {
        const dt = Math.min(0.045, (now - last) / 1000);
        last = now;

        updateShip(dt);
        updateBullets(dt);
        updateAsteroids(dt);
        handleCollisions();

        draw();
        requestAnimationFrame(loop);
    }

    document.addEventListener('keydown', (e) => {
        if (e.code === 'ArrowLeft') {
            keys.ArrowLeft = true;
            e.preventDefault();
        }
        if (e.code === 'ArrowRight') {
            keys.ArrowRight = true;
            e.preventDefault();
        }
        if (e.code === 'ArrowUp') {
            keys.ArrowUp = true;
            e.preventDefault();
        }
        if (e.code === 'Space') {
            keys.Space = true;
            e.preventDefault();
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.code === 'ArrowLeft') keys.ArrowLeft = false;
        if (e.code === 'ArrowRight') keys.ArrowRight = false;
        if (e.code === 'ArrowUp') keys.ArrowUp = false;
        if (e.code === 'Space') keys.Space = false;
    });

    document.getElementById('reset-btn').addEventListener('click', newGame);
    document.getElementById('home-btn').addEventListener('click', () => {
        window.location.href = '../index.html';
    });

    loadHighScore();
    newGame();
    requestAnimationFrame(loop);
})();
