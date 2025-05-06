document.addEventListener('DOMContentLoaded', function() {
    // Game elements
    const canvas = document.getElementById('climbing-canvas');
    const ctx = canvas.getContext('2d');
    const startBtn = document.getElementById('start-game-btn');
    const restartBtn = document.getElementById('restart-btn');
    const leftBtn = document.getElementById('left-btn');
    const rightBtn = document.getElementById('right-btn');
    const playAgainBtn = document.getElementById('play-again-btn');
    const gameOverModal = document.getElementById('game-over-modal');
    const backdrop = document.getElementById('backdrop');
    const heightElement = document.getElementById('height');
    const highScoreElement = document.getElementById('high-score');
    const finalHeightElement = document.getElementById('final-height');
    
    // Game variables
    let gameRunning = false;
    let animationId;
    let height = 0;
    let highScore = localStorage.getItem('climbingHighScore') || 0;
    let fallSpeed = 1;
    let climbTime = 0;
    let climber;
    let platforms = [];
    let keys = {
        left: false,
        right: false
    };
    
    // Initialize high score
    highScoreElement.textContent = highScore + 'm';
    
    // Climber class
    class Climber {
        constructor() {
            this.width = 30;
            this.height = 40;
            this.position = {
                x: canvas.width / 2 - this.width / 2,
                y: canvas.height - 200
            };
            this.velocity = {
                x: 0,
                y: 0
            };
            this.jumping = false;
            this.onPlatform = null;
            this.falling = false;
            this.jumpStrength = 10;
        }
        
        draw() {
            // Draw climber body
            ctx.fillStyle = '#E53935'; // Red body
            ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
            
            // Draw head
            ctx.fillStyle = '#FFCCBC'; // Skin color
            ctx.beginPath();
            ctx.arc(this.position.x + this.width / 2, this.position.y - 10, 10, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw helmet
            ctx.fillStyle = '#FFC107'; // Yellow helmet
            ctx.beginPath();
            ctx.arc(this.position.x + this.width / 2, this.position.y - 12, 8, 0, Math.PI, true);
            ctx.fill();
            
            // Draw arms while jumping
            if (this.jumping) {
                ctx.fillStyle = '#D32F2F';
                
                // Left arm raised
                ctx.fillRect(this.position.x - 5, this.position.y + 5, 5, 20);
                
                // Right arm raised
                ctx.fillRect(this.position.x + this.width, this.position.y + 5, 5, 20);
            }
        }
        
        update() {
            this.draw();
            
            // Apply gravity
            this.velocity.y += 0.5;
            
            // Update position
            this.position.x += this.velocity.x;
            this.position.y += this.velocity.y;
            
            // Boundary check
            if (this.position.x < 0) {
                this.position.x = 0;
                this.velocity.x = 0;
            }
            
            if (this.position.x + this.width > canvas.width) {
                this.position.x = canvas.width - this.width;
                this.velocity.x = 0;
            }
            
            // Check if climber fell off bottom
            if (this.position.y > canvas.height) {
                gameOver();
            }
            
            // Update jump state
            if (this.velocity.y === 0) {
                this.jumping = false;
            }
        }
        
        jump(direction) {
            if (!this.jumping && this.onPlatform) {
                // Horizontal and vertical jump velocity
                this.velocity.x = direction === 'left' ? -6 : 6;
                this.velocity.y = -this.jumpStrength;
                this.jumping = true;
                this.onPlatform = null;
            }
        }
    }
    
    // Platform class
    class Platform {
        constructor(x, y, width, type = 'normal') {
            this.width = width;
            this.height = 15;
            this.position = {
                x: x,
                y: y
            };
            this.markedForDeletion = false;
            this.type = type; // 'normal', 'fragile', 'moving', 'bounce'
            
            // Platform-specific properties
            switch(type) {
                case 'fragile':
                    this.durability = 1; // breaks after one landing
                    this.color = '#FFCDD2'; // Light red
                    break;
                case 'moving':
                    this.speed = 2;
                    this.direction = Math.random() > 0.5 ? 1 : -1;
                    this.color = '#BBDEFB'; // Light blue
                    break;
                case 'bounce':
                    this.color = '#E1BEE7'; // Light purple
                    break;
                default:
                    this.color = '#A5D6A7'; // Light green
            }
        }
        
        draw() {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
            
            // Add some visual detail to the platforms
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.fillRect(this.position.x, this.position.y, this.width, 5);
            
            // Add cracks to fragile platforms
            if (this.type === 'fragile') {
                ctx.strokeStyle = '#D32F2F';
                ctx.beginPath();
                ctx.moveTo(this.position.x + this.width / 4, this.position.y);
                ctx.lineTo(this.position.x + this.width / 2, this.position.y + this.height);
                ctx.moveTo(this.position.x + this.width * 3/4, this.position.y);
                ctx.lineTo(this.position.x + this.width / 2, this.position.y + this.height);
                ctx.stroke();
            }
        }
        
        update() {
            this.draw();
            
            // Handle moving platforms
            if (this.type === 'moving') {
                this.position.x += this.speed * this.direction;
                
                // Reverse direction at edges
                if (this.position.x <= 0 || this.position.x + this.width >= canvas.width) {
                    this.direction *= -1;
                }
            }
            
            // Apply fall speed to make platforms "fall"
            this.position.y += fallSpeed;
            
            // Mark off-screen platforms for deletion
            if (this.position.y > canvas.height) {
                this.markedForDeletion = true;
            }
        }
    }
    
    // Initialize game
    function initGame() {
        // Reset game state
        gameRunning = true;
        height = 0;
        fallSpeed = 1;
        climbTime = 0;
        
        // Reset UI
        heightElement.textContent = '0m';
        
        // Hide modals
        gameOverModal.style.display = 'none';
        backdrop.style.display = 'none';
        
        // Create climber
        climber = new Climber();
        
        // Create initial platforms
        platforms = [];
        
        // Starting platform
        platforms.push(new Platform(canvas.width / 2 - 50, canvas.height - 150, 100));
        
        // Generate some initial platforms
        for (let i = 0; i < 10; i++) {
            generatePlatform(canvas.height - 200 - i * 80);
        }
    }
    
    // Generate a new platform
    function generatePlatform(y) {
        const width = 50 + Math.random() * 80;
        const x = Math.random() * (canvas.width - width);
        
        // Determine platform type (weighted probabilities)
        let type = 'normal';
        const rand = Math.random();
        
        // Platform types get more varied and difficult with height
        const difficultyFactor = Math.min(height / 500, 1);
        
        if (rand < 0.1 + difficultyFactor * 0.2) { // 10-30% chance for fragile
            type = 'fragile';
        } else if (rand < 0.2 + difficultyFactor * 0.3) { // 10-30% chance for moving
            type = 'moving';
        } else if (rand < 0.25 + difficultyFactor * 0.2) { // 5-25% chance for bounce
            type = 'bounce';
        }
        
        platforms.push(new Platform(x, y, width, type));
    }
    
    // Game animation loop
    function animate() {
        animationId = window.requestAnimationFrame(animate);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw mountain background
        drawBackground();
        
        // Update climber
        climber.update();
        
        // Check platform collisions and update platforms
        handlePlatforms();
        
        // Update fall speed over time
        climbTime++;
        if (climbTime % 500 === 0) {
            fallSpeed += 0.1;
        }
        
        // Process keyboard input
        if (keys.left) {
            climber.jump('left');
        } else if (keys.right) {
            climber.jump('right');
        }
        
        // Update height score
        height = Math.max(height, Math.floor((canvas.height - climber.position.y) / 10));
        heightElement.textContent = height + 'm';
        
        // Generate new platforms as needed
        const highestPlatform = platforms.reduce((highest, platform) => 
            platform.position.y < highest ? platform.position.y : highest, canvas.height);
            
        if (highestPlatform > 100) {
            generatePlatform(highestPlatform - 80);
        }
    }
    
    // Draw background
    function drawBackground() {
        // Sky gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#1A237E');
        gradient.addColorStop(1, '#3949AB');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw stars
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        for (let i = 0; i < 50; i++) {
            ctx.beginPath();
            ctx.arc(
                Math.random() * canvas.width,
                Math.random() * canvas.height / 2,
                Math.random() * 1.5,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
        
        // Draw distant mountains
        ctx.fillStyle = '#3F51B5';
        ctx.beginPath();
        ctx.moveTo(0, canvas.height);
        ctx.lineTo(0, canvas.height - 150);
        ctx.lineTo(canvas.width / 3, canvas.height - 250);
        ctx.lineTo(canvas.width * 2/3, canvas.height - 180);
        ctx.lineTo(canvas.width, canvas.height - 220);
        ctx.lineTo(canvas.width, canvas.height);
        ctx.fill();
        
        // Draw height indicator lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.setLineDash([5, 5]);
        
        for (let i = 1; i <= 10; i++) {
            const y = canvas.height - (i * 100);
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
            
            // Height labels
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.font = '12px Arial';
            ctx.fillText(`${i * 10}m`, 10, y - 5);
        }
        
        ctx.setLineDash([]);
    }
    
    // Handle platform collision and updates
    function handlePlatforms() {
        let onPlatform = false;
        
        platforms.forEach((platform, index) => {
            platform.update();
            
            // Check collision with climber
            if (climber.velocity.y >= 0 && // Only check when falling
                climber.position.x + climber.width > platform.position.x &&
                climber.position.x < platform.position.x + platform.width &&
                climber.position.y + climber.height >= platform.position.y &&
                climber.position.y + climber.height <= platform.position.y + platform.height
            ) {
                // Handle different platform types
                switch(platform.type) {
                    case 'fragile':
                        climber.velocity.y = 0;
                        climber.position.y = platform.position.y - climber.height;
                        climber.onPlatform = platform;
                        onPlatform = true;
                        platform.markedForDeletion = true; // Break after landing
                        break;
                    case 'bounce':
                        climber.velocity.y = -climber.jumpStrength * 1.5; // Extra bounce
                        break;
                    default:
                        climber.velocity.y = 0;
                        climber.position.y = platform.position.y - climber.height;
                        climber.onPlatform = platform;
                        onPlatform = true;
                        break;
                }
            }
            
            // Remove marked platforms
            if (platform.markedForDeletion) {
                platforms.splice(index, 1);
            }
        });
        
        // Update climber's platform state
        if (!onPlatform && !climber.jumping) {
            climber.onPlatform = null;
        }
    }
    
    // Game over
    function gameOver() {
        gameRunning = false;
        window.cancelAnimationFrame(animationId);
        
        // Update high score if needed
        if (height > highScore) {
            highScore = height;
            localStorage.setItem('climbingHighScore', highScore);
            highScoreElement.textContent = highScore + 'm';
        }
        
        // Update final score
        finalHeightElement.textContent = height + 'm';
        
        // Show game over modal
        gameOverModal.style.display = 'block';
        backdrop.style.display = 'block';
    }
    
    // Event listeners for keyboard controls
    window.addEventListener('keydown', (e) => {
        if (!gameRunning) return;
        
        switch (e.key) {
            case 'ArrowLeft':
            case 'a':
            case 'A':
                keys.left = true;
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                keys.right = true;
                break;
        }
    });
    
    window.addEventListener('keyup', (e) => {
        switch (e.key) {
            case 'ArrowLeft':
            case 'a':
            case 'A':
                keys.left = false;
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                keys.right = false;
                break;
        }
    });
    
    // Mobile touch controls
    leftBtn.addEventListener('touchstart', () => {
        if (gameRunning) keys.left = true;
    });
    
    leftBtn.addEventListener('touchend', () => {
        keys.left = false;
    });
    
    rightBtn.addEventListener('touchstart', () => {
        if (gameRunning) keys.right = true;
    });
    
    rightBtn.addEventListener('touchend', () => {
        keys.right = false;
    });
    
    // Button event listeners
    startBtn.addEventListener('click', () => {
        initGame();
        animate();
    });
    
    restartBtn.addEventListener('click', () => {
        initGame();
        if (!animationId) {
            animate();
        }
    });
    
    playAgainBtn.addEventListener('click', () => {
        initGame();
        animate();
    });
    
    // Initialize the game
    initGame();
    animate();
});