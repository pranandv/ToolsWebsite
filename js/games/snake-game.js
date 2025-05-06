document.addEventListener('DOMContentLoaded', function() {
    // Game elements
    const gameBoard = document.getElementById('game-board');
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('high-score');
    const finalScoreElement = document.getElementById('final-score');
    const gameOverElement = document.getElementById('game-over');
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const restartBtn = document.getElementById('restart-btn');
    
    // Mobile controls
    const upBtn = document.getElementById('up-btn');
    const leftBtn = document.getElementById('left-btn');
    const rightBtn = document.getElementById('right-btn');
    const downBtn = document.getElementById('down-btn');
    
    // Game variables
    const boardSize = getBoardSize();
    const cellSize = 20;
    const gridSize = Math.floor(boardSize / cellSize);
    let snake = [];
    let food = {};
    let direction = 'right';
    let nextDirection = 'right';
    let gameSpeed = 150;
    let gameInterval;
    let score = 0;
    let highScore = localStorage.getItem('snakeHighScore') || 0;
    let isGameRunning = false;
    let isPaused = false;
    
    // Initialize high score from localStorage
    highScoreElement.textContent = highScore;
    
    /**
     * Get the board size based on the window size
     * @returns {number} - Board size in pixels
     */
    function getBoardSize() {
        // Get actual game board width
        const style = window.getComputedStyle(gameBoard);
        const width = parseInt(style.width, 10);
        return width;
    }
    
    /**
     * Initialize the game
     */
    function initGame() {
        // Reset game state
        snake = [
            { x: 3, y: Math.floor(gridSize / 2) },
            { x: 2, y: Math.floor(gridSize / 2) },
            { x: 1, y: Math.floor(gridSize / 2) }
        ];
        
        direction = 'right';
        nextDirection = 'right';
        score = 0;
        scoreElement.textContent = '0';
        
        // Clear the board
        gameBoard.innerHTML = '';
        gameOverElement.style.display = 'none';
        
        // Create food
        createFood();
        
        // Render initial state
        renderSnake();
        renderFood();
    }
    
    /**
     * Start the game
     */
    function startGame() {
        if (!isGameRunning) {
            initGame();
            isGameRunning = true;
            isPaused = false;
            gameInterval = setInterval(gameLoop, gameSpeed);
            startBtn.textContent = 'Restart';
            pauseBtn.disabled = false;
            

        } else {
            // Restart the game
            clearInterval(gameInterval);
            initGame();
            isPaused = false;
            gameInterval = setInterval(gameLoop, gameSpeed);
            pauseBtn.textContent = 'Pause';
        }
    }
    
    /**
     * Pause/resume the game
     */
    function togglePause() {
        if (isGameRunning) {
            if (isPaused) {
                // Resume
                gameInterval = setInterval(gameLoop, gameSpeed);
                isPaused = false;
                pauseBtn.textContent = 'Pause';
            } else {
                // Pause
                clearInterval(gameInterval);
                isPaused = true;
                pauseBtn.textContent = 'Resume';
            }
        }
    }
    
    /**
     * Main game loop
     */
    function gameLoop() {
        // Update snake position
        moveSnake();
        
        // Check for collisions
        if (checkCollision()) {
            gameOver();
            return;
        }
        
        // Check if food is eaten
        if (snake[0].x === food.x && snake[0].y === food.y) {
            eatFood();
        } else {
            // Remove the tail (snake didn't grow)
            snake.pop();
        }
        
        // Render the updated state
        renderSnake();
    }
    
    /**
     * Move the snake based on the current direction
     */
    function moveSnake() {
        // Update direction for the next move
        direction = nextDirection;
        
        // Calculate new head position
        const head = { ...snake[0] };
        
        switch (direction) {
            case 'up':
                head.y -= 1;
                break;
            case 'down':
                head.y += 1;
                break;
            case 'left':
                head.x -= 1;
                break;
            case 'right':
                head.x += 1;
                break;
        }
        
        // Add new head to the beginning of the snake
        snake.unshift(head);
    }
    
    /**
     * Check for collisions with walls or self
     * @returns {boolean} - True if collision detected
     */
    function checkCollision() {
        const head = snake[0];
        
        // Check wall collision
        if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
            return true;
        }
        
        // Check self collision (skip the head)
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Create food at a random position
     */
    function createFood() {
        // Create random position for food
        let newFood;
        let foodOnSnake;
        
        // Keep generating positions until we find one that's not on the snake
        do {
            foodOnSnake = false;
            newFood = {
                x: Math.floor(Math.random() * gridSize),
                y: Math.floor(Math.random() * gridSize)
            };
            
            // Check if food is on the snake
            for (let i = 0; i < snake.length; i++) {
                if (newFood.x === snake[i].x && newFood.y === snake[i].y) {
                    foodOnSnake = true;
                    break;
                }
            }
        } while (foodOnSnake);
        
        food = newFood;
    }
    
    /**
     * Handle food consumption
     */
    function eatFood() {
        // Increment score
        score += 10;
        scoreElement.textContent = score;
        
        // Update high score if needed
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
        
        // Create new food
        createFood();
        renderFood();
        
        // Increase speed slightly
        if (gameSpeed > 50 && score % 50 === 0) {
            clearInterval(gameInterval);
            gameSpeed -= 10;
            gameInterval = setInterval(gameLoop, gameSpeed);
        }
    }
    
    /**
     * Render the snake on the board
     */
    function renderSnake() {
        // Remove all existing snake segments
        const segments = gameBoard.querySelectorAll('.snake');
        segments.forEach(segment => segment.remove());
        
        // Create and append new segments
        snake.forEach(segment => {
            const snakeElement = document.createElement('div');
            snakeElement.className = 'snake';
            snakeElement.style.top = `${segment.y * cellSize}px`;
            snakeElement.style.left = `${segment.x * cellSize}px`;
            gameBoard.appendChild(snakeElement);
        });
    }
    
    /**
     * Render the food on the board
     */
    function renderFood() {
        // Remove existing food
        const existingFood = gameBoard.querySelector('.food');
        if (existingFood) {
            existingFood.remove();
        }
        
        // Create and append new food
        const foodElement = document.createElement('div');
        foodElement.className = 'food';
        foodElement.style.top = `${food.y * cellSize}px`;
        foodElement.style.left = `${food.x * cellSize}px`;
        gameBoard.appendChild(foodElement);
    }
    
    /**
     * Handle game over
     */
    function gameOver() {
        clearInterval(gameInterval);
        isGameRunning = false;
        gameOverElement.style.display = 'block';
        finalScoreElement.textContent = score;
        startBtn.textContent = 'Start Game';
        pauseBtn.disabled = true;
    }
    
    /**
     * Handle keyboard input
     * @param {KeyboardEvent} e - Keyboard event
     */
    function handleKeydown(e) {
        // Update direction based on arrow key input
        switch (e.key) {
            case 'ArrowUp':
                if (direction !== 'down') {
                    nextDirection = 'up';
                }
                e.preventDefault();
                break;
            case 'ArrowDown':
                if (direction !== 'up') {
                    nextDirection = 'down';
                }
                e.preventDefault();
                break;
            case 'ArrowLeft':
                if (direction !== 'right') {
                    nextDirection = 'left';
                }
                e.preventDefault();
                break;
            case 'ArrowRight':
                if (direction !== 'left') {
                    nextDirection = 'right';
                }
                e.preventDefault();
                break;
        }
    }
    
    // Add event listeners
    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', togglePause);
    restartBtn.addEventListener('click', startGame);
    document.addEventListener('keydown', handleKeydown);
    
    // Mobile control listeners
    upBtn.addEventListener('click', () => {
        if (direction !== 'down') {
            nextDirection = 'up';
        }
    });
    
    downBtn.addEventListener('click', () => {
        if (direction !== 'up') {
            nextDirection = 'down';
        }
    });
    
    leftBtn.addEventListener('click', () => {
        if (direction !== 'right') {
            nextDirection = 'left';
        }
    });
    
    rightBtn.addEventListener('click', () => {
        if (direction !== 'left') {
            nextDirection = 'right';
        }
    });
    

});