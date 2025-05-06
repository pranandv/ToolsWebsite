document.addEventListener('DOMContentLoaded', function() {
    // Game elements
    const canvas = document.getElementById('runner-canvas');
    const ctx = canvas.getContext('2d');
    const startBtn = document.getElementById('start-game-btn');
    const restartBtn = document.getElementById('restart-btn');
    const jumpBtn = document.getElementById('jump-btn');
    const duckBtn = document.getElementById('duck-btn');
    const playAgainBtn = document.getElementById('play-again-btn');
    const gameOverModal = document.getElementById('game-over-modal');
    const backdrop = document.getElementById('backdrop');
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('high-score');
    const distanceElement = document.getElementById('distance');
    const finalScoreElement = document.getElementById('final-score');
    const finalDistanceElement = document.getElementById('final-distance');

    // Game variables
    let gameRunning = false;
    let score = 0;
    let highScore = localStorage.getItem('runnerHighScore') || 0;
    let distance = 0;
    let speed = 5;
    let animationId;
    let spawnTimer = 0;
    let player;
    let obstacles = [];
    let coins = [];
    let backgrounds = [];
    let gameSpeed = 1;

    // Initialize high score
    highScoreElement.textContent = highScore;

    // Player class
    class Player {
        constructor() {
            this.position = {
                x: 50,
                y: canvas.height - 150
            };
            this.velocity = {
                x: 0,
                y: 0
            };
            this.width = 40;
            this.height = 80;
            this.jumping = false;
            this.ducking = false;
        }

        draw() {
            // Draw player body
            if (this.ducking) {
                // Ducking player (shorter and longer)
                ctx.fillStyle = '#4CAF50';
                ctx.fillRect(this.position.x, this.position.y + 40, this.width + 20, this.height - 40);
            } else {
                // Standing player
                ctx.fillStyle = '#4CAF50';
                ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
            }
            
            // Draw player details
            ctx.fillStyle = '#388E3C';
            // Head
            ctx.beginPath();
            ctx.arc(this.position.x + this.width/2, this.position.y + 15, 15, 0, Math.PI * 2);
            ctx.fill();
            
            // Eyes
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(this.position.x + this.width/2 + 5, this.position.y + 12, 5, 0, Math.PI * 2);
            ctx.fill();
            
            // Pupil
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(this.position.x + this.width/2 + 6, this.position.y + 12, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        update() {
            this.draw();
            
            // Apply gravity and movement
            this.position.y += this.velocity.y;
            
            // Check ground collision
            const groundPosition = canvas.height - 70;
            if (this.position.y + this.height >= groundPosition) {
                this.position.y = groundPosition - this.height;
                this.velocity.y = 0;
                this.jumping = false;
            } else {
                this.velocity.y += 0.6; // Gravity
            }
            
            // Update ducking state
            if (this.ducking) {
                this.height = 40;
            } else {
                this.height = 80;
            }
        }

        jump() {
            if (!this.jumping) {
                this.velocity.y = -15;
                this.jumping = true;
                this.ducking = false;
            }
        }

        duck() {
            if (!this.jumping) {
                this.ducking = true;
            }
        }

        stopDucking() {
            this.ducking = false;
        }
    }

    // Obstacle class
    class Obstacle {
        constructor(type = 'ground') {
            this.type = type; // 'ground' or 'air'
            this.width = 30 + Math.random() * 30;
            this.height = type === 'ground' ? 40 + Math.random() * 30 : 30;
            this.position = {
                x: canvas.width,
                y: type === 'ground' ? canvas.height - 70 - this.height : 150 + Math.random() * 100
            };
            this.markedForDeletion = false;
            this.passed = false;
            
            // Random color from red/orange/brown palette
            const colors = ['#F44336', '#FF5722', '#795548', '#E91E63'];
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
            
            // Add some details to obstacles
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(this.position.x + 10, this.position.y + 10, this.width - 20, this.height - 20);
        }

        update() {
            this.draw();
            this.position.x -= speed * gameSpeed;

            // Mark for deletion if offscreen
            if (this.position.x + this.width < 0) {
                this.markedForDeletion = true;
            }
            
            // Increase score when the player passes an obstacle
            if (!this.passed && this.position.x + this.width < player.position.x) {
                score += 10;
                this.passed = true;
                scoreElement.textContent = score;
            }
        }
    }

    // Coin class
    class Coin {
        constructor() {
            this.radius = 15;
            this.position = {
                x: canvas.width + Math.random() * 300,
                y: Math.random() * 200 + 100
            };
            this.markedForDeletion = false;
            this.collected = false;
        }

        draw() {
            // Draw coin
            ctx.fillStyle = 'gold';
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Coin detail (inner circle)
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.radius - 5, 0, Math.PI * 2);
            ctx.fill();
            
            // Shine effect
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.beginPath();
            ctx.arc(this.position.x - 5, this.position.y - 5, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        update() {
            this.draw();
            this.position.x -= speed * gameSpeed;

            // Mark for deletion if offscreen
            if (this.position.x + this.radius < 0) {
                this.markedForDeletion = true;
            }

            // Check for collision with player
            if (!this.collected) {
                const dx = this.position.x - (player.position.x + player.width / 2);
                const dy = this.position.y - (player.position.y + player.height / 2);
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.radius + player.width / 2) {
                    this.collected = true;
                    this.markedForDeletion = true;
                    score += 50;
                    scoreElement.textContent = score;
                }
            }
        }
    }

    // Background layer class for parallax effect
    class Background {
        constructor(speed, color, y, height) {
            this.x = 0;
            this.y = y;
            this.width = canvas.width;
            this.height = height;
            this.speed = speed;
            this.color = color;
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.fillRect(this.x + this.width, this.y, this.width, this.height);
        }

        update() {
            this.draw();
            this.x -= this.speed * gameSpeed;
            
            // Reset position when the first image is off screen
            if (this.x <= -this.width) {
                this.x = 0;
            }
        }
    }

    // Initialize game
    function initGame() {
        // Reset game state
        gameRunning = true;
        score = 0;
        distance = 0;
        speed = 5;
        gameSpeed = 1;
        spawnTimer = 0;
        
        // Update UI
        scoreElement.textContent = '0';
        distanceElement.textContent = '0m';
        
        // Hide game over modal
        gameOverModal.style.display = 'none';
        backdrop.style.display = 'none';
        
        // Create player
        player = new Player();
        
        // Reset arrays
        obstacles = [];
        coins = [];
        
        // Create background layers for parallax effect
        backgrounds = [
            // Sky
            new Background(0.5, '#87CEEB', 0, canvas.height),
            // Distant mountains
            new Background(1, '#9C9C9C', canvas.height - 200, 100),
            // Hills
            new Background(2, '#8B6914', canvas.height - 150, 80),
            // Ground
            new Background(5, '#795548', canvas.height - 70, 70)
        ];
    }

    // Game animation loop
    function animate() {
        animationId = window.requestAnimationFrame(animate);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update game speed based on score
        gameSpeed = 1 + score / 1000;
        
        // Update backgrounds (parallax layers)
        backgrounds.forEach(bg => bg.update());
        
        // Update player
        player.update();
        
        // Update and draw obstacles
        obstacles.forEach((obstacle, index) => {
            obstacle.update();
            
            // Check for collision with player
            if (checkCollision(player, obstacle)) {
                gameOver();
            }
            
            // Remove marked obstacles
            if (obstacle.markedForDeletion) {
                obstacles.splice(index, 1);
            }
        });
        
        // Update and draw coins
        coins.forEach((coin, index) => {
            coin.update();
            
            // Remove collected or off-screen coins
            if (coin.markedForDeletion) {
                coins.splice(index, 1);
            }
        });
        
        // Spawn new obstacles
        spawnTimer++;
        if (spawnTimer > (120 / gameSpeed)) {
            // Random type of obstacle (ground or air)
            const obstacleType = Math.random() > 0.3 ? 'ground' : 'air';
            
            // Only spawn if there's enough space since the last obstacle
            const lastObstacle = obstacles[obstacles.length - 1];
            if (!lastObstacle || canvas.width - lastObstacle.position.x > 300) {
                obstacles.push(new Obstacle(obstacleType));
                
                // Occasionally spawn a coin
                if (Math.random() > 0.7) {
                    coins.push(new Coin());
                }
                
                spawnTimer = 0;
            }
        }
        
        // Update distance and score
        distance += speed * gameSpeed / 30;
        distanceElement.textContent = Math.floor(distance) + 'm';
        
        // Draw ground
        ctx.fillStyle = '#5D4037';
        ctx.fillRect(0, canvas.height - 70, canvas.width, 70);
        
        // Draw ground details
        ctx.fillStyle = '#4E342E';
        for (let i = 0; i < canvas.width; i += 40) {
            ctx.fillRect(i, canvas.height - 70, 20, 10);
        }
    }

    // Check collision between player and obstacle
    function checkCollision(player, obstacle) {
        // Adjust hitbox when ducking
        const playerY = player.position.y;
        const playerHeight = player.height;
        
        return (
            player.position.x < obstacle.position.x + obstacle.width &&
            player.position.x + player.width > obstacle.position.x &&
            playerY < obstacle.position.y + obstacle.height &&
            playerY + playerHeight > obstacle.position.y
        );
    }

    // Game over
    function gameOver() {
        gameRunning = false;
        window.cancelAnimationFrame(animationId);
        
        // Update high score if needed
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('runnerHighScore', highScore);
        }
        
        // Update final score and distance
        finalScoreElement.textContent = score;
        finalDistanceElement.textContent = Math.floor(distance) + 'm';
        
        // Show game over modal
        gameOverModal.style.display = 'block';
        backdrop.style.display = 'block';
    }

    // Event listeners for keyboard controls
    window.addEventListener('keydown', (e) => {
        if (!gameRunning) return;
        
        switch (e.key) {
            case ' ':
            case 'ArrowUp':
                player.jump();
                break;
            case 'ArrowDown':
                player.duck();
                break;
        }
    });

    window.addEventListener('keyup', (e) => {
        if (!gameRunning) return;
        
        if (e.key === 'ArrowDown') {
            player.stopDucking();
        }
    });

    // Event listeners for touch controls
    jumpBtn.addEventListener('touchstart', () => {
        if (gameRunning) player.jump();
    });

    duckBtn.addEventListener('touchstart', () => {
        if (gameRunning) player.duck();
    });

    duckBtn.addEventListener('touchend', () => {
        if (gameRunning) player.stopDucking();
    });

    // Start game button
    startBtn.addEventListener('click', () => {
        initGame();
        animate();
    });

    // Restart game button
    restartBtn.addEventListener('click', () => {
        initGame();
        if (!animationId) {
            animate();
        }
    });

    // Play again button
    playAgainBtn.addEventListener('click', () => {
        initGame();
        animate();
    });

    // Initialize game on load
    initGame();
    animate();
});