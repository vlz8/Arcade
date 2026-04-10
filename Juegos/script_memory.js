(function () {
    const EMOJIS = ['🍎', '🚀', '🎸', '🌟', '🎮', '🐱', '🍕', '🎯'];
    const grid = document.getElementById('memory-grid');
    const movesEl = document.getElementById('moves');
    const pairsEl = document.getElementById('pairs');
    const statusEl = document.getElementById('game-status');

    let moves = 0;
    let pairsFound = 0;
    let flipped = [];
    let lock = false;

    function shuffle(arr) {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    function build() {
        grid.innerHTML = '';
        moves = 0;
        pairsFound = 0;
        flipped = [];
        lock = false;
        movesEl.textContent = '0';
        pairsEl.textContent = '0';
        statusEl.textContent = 'Find all matching pairs';

        const deck = shuffle([...EMOJIS, ...EMOJIS]);
        deck.forEach((emoji, i) => {
            const card = document.createElement('button');
            card.type = 'button';
            card.className = 'memory-card';
            card.dataset.index = String(i);
            card.dataset.emoji = emoji;
            card.innerHTML =
                '<span class="back" aria-hidden="true">❓</span><span class="front" aria-hidden="true">' +
                emoji +
                '</span>';
            card.addEventListener('click', () => onCard(card));
            grid.appendChild(card);
        });
    }

    function onCard(card) {
        if (lock || card.classList.contains('matched') || card.classList.contains('flipped')) return;

        card.classList.add('flipped');
        flipped.push(card);

        if (flipped.length < 2) return;

        lock = true;
        moves++;
        movesEl.textContent = String(moves);

        const [a, b] = flipped;
        if (a.dataset.emoji === b.dataset.emoji) {
            a.classList.add('matched');
            b.classList.add('matched');
            a.classList.remove('flipped');
            b.classList.remove('flipped');
            flipped = [];
            pairsFound++;
            pairsEl.textContent = String(pairsFound);
            lock = false;
            if (pairsFound === 8) {
                statusEl.textContent = 'You win in ' + moves + ' moves — New game?';
            }
        } else {
            setTimeout(() => {
                a.classList.remove('flipped');
                b.classList.remove('flipped');
                flipped = [];
                lock = false;
            }, 700);
        }
    }

    document.getElementById('reset-btn').addEventListener('click', build);
    document.getElementById('home-btn').addEventListener('click', () => {
        window.location.href = '../index.html'; 
    });

    build();
})();
