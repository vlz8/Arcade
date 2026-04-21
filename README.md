# Arcade Game Collection

This is a collection of classic games developed purely with HTML, CSS, and JavaScript. All games run directly in the browser, requiring no installation or external dependencies.

## General Features

- **Technology**: HTML5, CSS3, vanilla JavaScript (no frameworks)
- **Responsiveness**: Designed to work on mobile devices and desktop
- **Persistence**: Some games use `localStorage` to save personal records
- **Controls**: Keyboard (arrow keys, WASD, spacebar) or mouse depending on the game
- **Reset**: Each game includes buttons to restart or return to the main menu

## Game List

### 1. Tic Tac Toe (Triki)
- **Description**: The classic three-in-a-row game. You play against another player on the same device.
- **Controls**: Click on the squares to place your mark (X or O).
- **Features**: Shows X and O score markers for the current match.

### 2. Snake Game
- **Description**: Control a snake that grows when eating food. Avoid hitting walls or yourself.
- **Controls**: Arrow keys to move the snake.
- **Features**: Current score, high score saved, gradual difficulty increase.
- **Highscore**: Yes, saves the high score in `localStorage`.

### 3. Tetris
- **Description**: Fit falling tetromino pieces to complete lines and prevent the screen from filling up.
- **Controls**: Arrows to move and rotate, spacebar for hard drop.
- **Features**: Current score, lines cleared, high score.
- **Highscore**: Yes, saves the high score in `localStorage`.

### 4. Floppy Disc
- **Description**: A "Flappy Bird" style game where you control a floppy disk that must pass between obstacles.
- **Controls**: Click or press spacebar to make the disk rise.
- **Features**: Distance traveled counter.
- **Highscore**: Yes, saves the high score in `localStorage`.

### 5. Pong
- **Description**: Classic table tennis gameplay. Play against the computer, first to 7 points wins.
- **Controls**: W/S or up/down arrow keys to move your paddle.
- **Features**: Score display for player and CPU.

### 6. Breakout
- **Description**: Control a paddle to bounce a ball and break all the bricks on screen.
- **Controls**: Left/right arrows or A/D to move paddle, spacebar to launch ball.
- **Features**: Current score, remaining lives.

### 7. Memory
- **Description**: A memory game where you flip cards to find matching pairs.
- **Controls**: Click on cards to flip them.
- **Features**: Move counter and pairs found (8 pairs total).

### 8. Simon Says
- **Description**: Repeat the color and sound sequence the game shows you, each time longer.
- **Controls**: Click the colored buttons in the correct order.
- **Features**: Current level and best level achieved.
- **Highscore**: Yes, saves the best level in `localStorage`.

### 9. Guess the Number
- **Description**: Guess the secret number between 1 and 100 in as few attempts as possible.
- **Controls**: Type a number in the field and press "Guess" or Enter.
- **Features**: Attempt counter, best (lowest) attempt count, attempt history.
- **Highscore**: Yes, saves the best attempt count in `localStorage`.

### 10. Connect Four
- **Description**: Drop discs one by one, trying to connect four of your color horizontally, vertically, or diagonally.
- **Controls**: Click the arrows above each column to drop your disc.
- **Features**: Indicates whose turn it is (red or yellow).

### 11. Whack-a-Mole
- **Description**: Hit as many moles as you can before the 30-second timer runs out.
- **Controls**: Click on moles when they appear (+10 points per hit).
- **Features**: Current score, countdown timer.

### 12. Asteroids
- **Description**: A spaceship must destroy asteroids while avoiding collisions, with asteroids breaking into smaller pieces when shot.
- **Controls**: Arrows to move and rotate, spacebar to shoot.
- **Features**: Survival and score from destroyed asteroids.
- **Highscore**: Yes, saves the high score in `localStorage`.

## How to Play

1. Open `index.html` in any modern browser (Chrome, Firefox, Safari, Edge).
2. Click on the game you want to play from the main menu.
3. Each game has its own instructions and controls displayed on screen.
4. Use the "Home" button to return to the main menu at any time.
5. Games with highscore will automatically save your best performance in your browser.

## Technologies Used

- **HTML5**: Structure and semantics of the pages
- **CSS3**: Styles, animations, and responsive design
- **JavaScript**: Game logic, event handling, and state management
- **localStorage**: Persistence of records between sessions (in some games)

## Notes

- All games are fully functional and standalone.
- No servers, external APIs, or additional downloads required.
- Performance may vary by device, but they're optimized for modern browsers.
- Records saved in `localStorage` are specific to each browser and device.
