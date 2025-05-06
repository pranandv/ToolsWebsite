document.addEventListener('DOMContentLoaded', function() {
    // Game elements
    const canvas = document.getElementById('fighting-canvas');
    const ctx = canvas.getContext('2d');
    const startBtn = document.getElementById('start-game-btn');
    const restartBtn = document.getElementById('restart-btn');
    const playAgainBtn = document.getElementById('play-again-btn');
    const gameOverModal = document.getElementById('game-over-modal');
    const backdrop = document.getElementById('backdrop');
    const winnerText = document.getElementById('winner-text');
    
    // Game variables
    let gameRunning = false;
    let animationId;
    let player1;
    let player2;
    let gravity = 0.7;
    let lastKey = '';
    
    // Player class
    class Fighter {
        constructor(name, position, velocity, color, offset, keys, isPlayer = true) {
            this.name = name;
            this.position = position;
            this.velocity = velocity;
            this.width = 50;
            this.height = 150;
            this.health = 100;
            this.color = color;
            this.attacking = false;
            this.attackBox = {
                position: {
                    x: this.position.x,
                    y: this.position.y
                },
                width: 100,
                height: 50,
                offset
            };
            this.keys = keys;
            this.isPlayer = isPlayer;
            this.lastDirection = isPlayer ? 'right' : 'left';
            this.cooldown = 0;
            this.specialAttackReady = true;
        }
        
        draw() {
            // Draw player body
            ctx.fillStyle = this.color;
            ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
            
            // Draw health bar background
            ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
            ctx.fillRect(
                this.isPlayer ? 20 : canvas.width - 220, 
                20, 
                200, 
                20
            );
            
            // Draw health bar
            ctx.fillStyle = 'lime';
            ctx.fillRect(
                this.isPlayer ? 20 : canvas.width - 220, 
                20, 
                this.health * 2, 
                20
            );
            
            // Draw player name
            ctx.fillStyle = 'white';
            ctx.font = '16px Arial';
            ctx.fillText(
                this.name, 
                this.isPlayer ? 20 : canvas.width - 220, 
                55
            );
            
            // Draw special attack indicator
            if (this.specialAttackReady) {
                ctx.fillStyle = 'gold';
                ctx.beginPath();
                ctx.arc(
                    this.isPlayer ? 235 : canvas.width - 235, 
                    30, 
                    10, 
                    0, 
                    Math.PI * 2
                );
                ctx.fill();
            }
            
            // Draw attack box when attacking (for debugging)
            if (this.attacking) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.fillRect(
                    this.attackBox.position.x, 
                    this.attackBox.position.y, 
                    this.attackBox.width, 
                    this.attackBox.height
                );
            }
        }
        
        update() {
            this.draw();
            
            this.attackBox.position.x = this.position.x + this.attackBox.offset.x;
            this.attackBox.position.y = this.position.y + this.attackBox.offset.y;
            
            this.position.y += this.velocity.y;
            this.position.x += this.velocity.x;
            
            // Apply gravity
            if (this.position.y + this.height + this.velocity.y >= canvas.height - 96) {
                this.velocity.y = 0;
                this.position.y = canvas.height - 96 - this.height;
            } else {
                this.velocity.y += gravity;
            }
            
            // Handle cooldown for special attack
            if (this.cooldown > 0) {
                this.cooldown--;
                if (this.cooldown === 0) {
                    this.specialAttackReady = true;
                }
            }
            
            // AI movement if not a player
            if (!this.isPlayer && gameRunning) {
                this.updateAI();
            }
        }
        
        attack() {
            this.attacking = true;
            setTimeout(() => {
                this.attacking = false;
            }, 100);
        }
        
        specialAttack() {
            if (!this.specialAttackReady) return;
            
            this.attacking = true;
            // Special attack has wider range
            const originalWidth = this.attackBox.width;
            this.attackBox.width = 150;
            
            setTimeout(() => {
                this.attacking = false;
                this.attackBox.width = originalWidth;
            }, 300);
            
            this.specialAttackReady = false;
            this.cooldown = 180; // 3 seconds at 60fps
        }
        
        takeHit(damage = 10) {
            this.health -= damage;
            if (this.health < 0) this.health = 0;
        }
        
        updateAI() {
            // Simple AI to follow and attack the player
            const player = player1;
            const distanceToPlayer = player.position.x - this.position.x;
            const absoluteDistance = Math.abs(distanceToPlayer);
            
            // Move towards player if too far
            if (absoluteDistance > 120) {
                this.velocity.x = distanceToPlayer > 0 ? 5 : -5;
                this.lastDirection = distanceToPlayer > 0 ? 'right' : 'left';
            } else {
                this.velocity.x = 0;
                
                // Attack if close enough
                if (absoluteDistance < 100 && Math.random() < 0.02) {
                    if (this.specialAttackReady && Math.random() < 0.3) {
                        this.specialAttack();
                    } else {
                        this.attack();
                    }
                }
            }
            
            // Jump occasionally
            if (Math.random() < 0.005 && this.position.y + this.height >= canvas.height - 96) {
                this.velocity.y = -15;
            }
        }
    }
    
    // Initialize game
    function initGame() {
        player1 = new Fighter(
            'Player 1',
            { x: 100, y: 0 },
            { x: 0, y: 0 },
            '#2196F3',
            { x: 50, y: 50 },
            {
                a: { pressed: false },
                d: { pressed: false },
                w: { pressed: false },
                s: { pressed: false },
                space: { pressed: false }
            }
        );
        
        player2 = new Fighter(
            'Player 2',
            { x: 650, y: 0 },
            { x: 0, y: 0 },
            '#F44336',
            { x: -100, y: 50 },
            {
                ArrowLeft: { pressed: false },
                ArrowRight: { pressed: false },
                ArrowUp: { pressed: false },
                ArrowDown: { pressed: false },
                Enter: { pressed: false }
            },
            false
        );
        
        gameRunning = true;
        gameOverModal.style.display = 'none';
        backdrop.style.display = 'none';
    }
    
    // Game animation loop
    function animate() {
        animationId = window.requestAnimationFrame(animate);
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw background
        drawBackground();
        
        // Update players
        player1.update();
        player2.update();
        
        // Reset player velocity
        player1.velocity.x = 0;
        player2.velocity.x = 0;
        
        // Player 1 movement
        if (player1.keys.a.pressed && ['a', 'd'].includes(lastKey)) {
            player1.velocity.x = -5;
            player1.lastDirection = 'left';
        } else if (player1.keys.d.pressed && ['a', 'd'].includes(lastKey)) {
            player1.velocity.x = 5;
            player1.lastDirection = 'right';
        }
        
        // Player 2 manual movement (if not AI)
        if (player2.isPlayer) {
            if (player2.keys.ArrowLeft.pressed) {
                player2.velocity.x = -5;
                player2.lastDirection = 'left';
            } else if (player2.keys.ArrowRight.pressed) {
                player2.velocity.x = 5;
                player2.lastDirection = 'right';
            }
        }
        
        // Detect collisions
        detectCollisions();
        
        // Check for game over
        if (player1.health <= 0 || player2.health <= 0) {
            gameOver();
        }
    }
    
    // Draw background with platforms
    function drawBackground() {
        // Draw sky
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#0c1445');
        gradient.addColorStop(1, '#30336b');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw stars
        ctx.fillStyle = 'white';
        for (let i = 0; i < 50; i++) {
            ctx.beginPath();
            ctx.arc(
                Math.random() * canvas.width,
                Math.random() * canvas.height / 2,
                Math.random() * 2,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
        
        // Draw ground
        ctx.fillStyle = '#4b6584';
        ctx.fillRect(0, canvas.height - 96, canvas.width, 96);
        
        // Draw ground details
        ctx.fillStyle = '#3c6382';
        for (let i = 0; i < canvas.width; i += 30) {
            ctx.fillRect(i, canvas.height - 96, 15, 15);
        }
    }
    
    // Detect collisions between players
    function detectCollisions() {
        // Player 1 attacks Player 2
        if (
            player1.attacking && 
            player1.attackBox.position.x + player1.attackBox.width >= player2.position.x && 
            player1.attackBox.position.x <= player2.position.x + player2.width &&
            player1.attackBox.position.y + player1.attackBox.height >= player2.position.y &&
            player1.attackBox.position.y <= player2.position.y + player2.height
        ) {
            player1.attacking = false;
            
            // Determine damage based on attack type
            const damage = player1.attackBox.width > 100 ? 20 : 10;
            player2.takeHit(damage);
        }
        
        // Player 2 attacks Player 1
        if (
            player2.attacking && 
            player2.attackBox.position.x + player2.attackBox.width >= player1.position.x && 
            player2.attackBox.position.x <= player1.position.x + player1.width &&
            player2.attackBox.position.y + player2.attackBox.height >= player1.position.y &&
            player2.attackBox.position.y <= player1.position.y + player1.height
        ) {
            player2.attacking = false;
            
            // Determine damage based on attack type
            const damage = player2.attackBox.width > 100 ? 20 : 10;
            player1.takeHit(damage);
        }
    }
    
    // Game over
    function gameOver() {
        gameRunning = false;
        window.cancelAnimationFrame(animationId);
        
        // Set winner text
        if (player1.health <= 0 && player2.health <= 0) {
            winnerText.textContent = "It's a Draw!";
        } else if (player1.health <= 0) {
            winnerText.textContent = "Player 2 Wins!";
        } else {
            winnerText.textContent = "Player 1 Wins!";
        }
        
        // Show game over modal
        gameOverModal.style.display = 'block';
        backdrop.style.display = 'block';
    }
    
    // Key down event
    window.addEventListener('keydown', (event) => {
        if (!gameRunning) return;
        
        // Player 1 keys
        switch (event.key) {
            case 'w':
                if (player1.position.y + player1.height >= canvas.height - 96) {
                    player1.velocity.y = -15;
                }
                break;
            case 'a':
                player1.keys.a.pressed = true;
                lastKey = 'a';
                break;
            case 'd':
                player1.keys.d.pressed = true;
                lastKey = 'd';
                break;
            case 's':
                player1.specialAttack();
                break;
            case ' ':
                player1.attack();
                break;
        }
        
        // Player 2 keys (if not AI)
        if (player2.isPlayer) {
            switch (event.key) {
                case 'ArrowUp':
                    if (player2.position.y + player2.height >= canvas.height - 96) {
                        player2.velocity.y = -15;
                    }
                    break;
                case 'ArrowLeft':
                    player2.keys.ArrowLeft.pressed = true;
                    break;
                case 'ArrowRight':
                    player2.keys.ArrowRight.pressed = true;
                    break;
                case 'ArrowDown':
                    player2.specialAttack();
                    break;
                case 'Enter':
                    player2.attack();
                    break;
            }
        }
    });
    
    // Key up event
    window.addEventListener('keyup', (event) => {
        // Player 1 keys
        switch (event.key) {
            case 'a':
                player1.keys.a.pressed = false;
                break;
            case 'd':
                player1.keys.d.pressed = false;
                break;
        }
        
        // Player 2 keys (if not AI)
        if (player2.isPlayer) {
            switch (event.key) {
                case 'ArrowLeft':
                    player2.keys.ArrowLeft.pressed = false;
                    break;
                case 'ArrowRight':
                    player2.keys.ArrowRight.pressed = false;
                    break;
            }
        }
    });
    
    // Start game
    startBtn.addEventListener('click', () => {
        initGame();
        animate();
    });
    
    // Restart game
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
    
    // Initialize the game
    initGame();
    animate();
});