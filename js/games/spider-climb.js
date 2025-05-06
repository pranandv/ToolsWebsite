document.addEventListener('DOMContentLoaded', function() {
    // Game elements
    const gameArea = document.getElementById('game-area');
    const spider = document.getElementById('spider');
    const startBtn = document.getElementById('start-game-btn');
    const restartBtn = document.getElementById('restart-btn');
    const jumpBtn = document.getElementById('jump-btn');
    const playAgainBtn = document.getElementById('play-again-btn');
    const gameOverModal = document.getElementById('game-over-modal');
    const backdrop = document.getElementById('backdrop');
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('high-score');
    const levelElement = document.getElementById('level');
    const finalScoreElement = document.getElementById('final-score');
    const finalLevelElement = document.getElementById('final-level');
    
    // Game variables
    let gameRunning = false;
    let score = 0;
    let highScore = localStorage.getItem('spiderHighScore') || 0;
    let level = 1;
    let spiderPosition = 'left'; // 'left' or 'right'
    let spiderTop = 540; // Initial position from top
    let lasers = [];
    let laserSpeed = 2;
    let climbSpeed = 1;
    let laserInterval;
    let gameInterval;
    let gameTickInterval = 20; // milliseconds per tick
    
    // Initialize high score
    highScoreElement.textContent = highScore;
    
    // Create spider body parts
    function createSpiderDetails() {
        // Spider body
        const body = document.createElement('div');
        body.style.width = '30px';
        body.style.height = '30px';
        body.style.backgroundColor = '#673AB7';
        body.style.borderRadius = '50%';
        body.style.position = 'absolute';
        body.style.top = '5px';
        body.style.left = '5px';
        
        // Spider eyes
        const leftEye = document.createElement('div');
        leftEye.style.width = '8px';
        leftEye.style.height = '8px';
        leftEye.style.backgroundColor = 'white';
        leftEye.style.borderRadius = '50%';
        leftEye.style.position = 'absolute';
        leftEye.style.top = '8px';
        leftEye.style.left = '8px';
        
        const rightEye = document.createElement('div');
        rightEye.style.width = '8px';
        rightEye.style.height = '8px';
        rightEye.style.backgroundColor = 'white';
        rightEye.style.borderRadius = '50%';
        rightEye.style.position = 'absolute';
        rightEye.style.top = '8px';
        rightEye.style.left = '18px';
        
        // Spider pupils
        const leftPupil = document.createElement('div');
        leftPupil.style.width = '4px';
        leftPupil.style.height = '4px';
        leftPupil.style.backgroundColor = 'black';
        leftPupil.style.borderRadius = '50%';
        leftPupil.style.position = 'absolute';
        leftPupil.style.top = '2px';
        leftPupil.style.left = '2px';
        
        const rightPupil = document.createElement('div');
        rightPupil.style.width = '4px';
        rightPupil.style.height = '4px';
        rightPupil.style.backgroundColor = 'black';
        rightPupil.style.borderRadius = '50%';
        rightPupil.style.position = 'absolute';
        rightPupil.style.top = '2px';
        rightPupil.style.left = '2px';
        
        // Spider legs
        const legs = [];
        for (let i = 0; i < 8; i++) {
            const leg = document.createElement('div');
            leg.style.width = '15px';
            leg.style.height = '2px';
            leg.style.backgroundColor = '#673AB7';
            leg.style.position = 'absolute';
            
            // Position legs around the body
            const angle = (i * Math.PI / 4) + Math.PI / 8;
            const x = 15 + 15 * Math.cos(angle);
            const y = 15 + 15 * Math.sin(angle);
            
            leg.style.top = `${y}px`;
            leg.style.left = `${x}px`;
            leg.style.transformOrigin = 'left center';
            leg.style.transform = `rotate(${angle}rad)`;
            
            legs.push(leg);
        }
        
        // Add all parts to spider
        leftEye.appendChild(leftPupil);
        rightEye.appendChild(rightPupil);
        body.appendChild(leftEye);
        body.appendChild(rightEye);
        spider.appendChild(body);
        
        legs.forEach(leg => {
            spider.appendChild(leg);
        });
    }
    
    // Initialize game
    function initGame() {
        // Reset game state
        gameRunning = true;
        score = 0;
        level = 1;
        spiderPosition = 'left';
        spiderTop = 540;
        lasers = [];
        laserSpeed = 2;
        climbSpeed = 1;
        
        // Update UI
        scoreElement.textContent = '0';
        levelElement.textContent = '1';
        
        // Reset game area
        clearLasers();
        
        // Position spider
        spider.style.left = '0px';
        spider.style.top = `${spiderTop}px`;
        spider.style.transform = 'rotateY(0deg)'; // Face right
        
        // Create spider details if not already created
        if (spider.children.length === 0) {
            createSpiderDetails();
        }
        
        // Hide modals
        gameOverModal.style.display = 'none';
        backdrop.style.display = 'none';
        
        // Start generating lasers
        if (laserInterval) clearInterval(laserInterval);
        laserInterval = setInterval(createLaser, 1800);
        
        // Start game loop
        if (gameInterval) clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, gameTickInterval);
    }
    
    // Game loop
    function gameLoop() {
        if (!gameRunning) return;
        
        // Move spider up
        spiderTop -= climbSpeed;
        spider.style.top = `${spiderTop}px`;
        
        // Move lasers up
        moveLasers();
        
        // Check for collisions
        checkCollisions();
        
        // Update score
        score += 1;
        if (score % 100 === 0) {
            scoreElement.textContent = Math.floor(score / 100);
        }
        
        // Increase level and difficulty
        if (score % 1000 === 0) {
            level++;
            levelElement.textContent = level;
            laserSpeed += 0.5;
            climbSpeed += 0.2;
            
            // Increase laser spawn rate
            clearInterval(laserInterval);
            laserInterval = setInterval(createLaser, Math.max(1800 - (level * 150), 600));
        }
        
        // Check if spider reached the top (win condition)
        if (spiderTop <= 0) {
            score += 500; // Bonus for reaching the top
            scoreElement.textContent = Math.floor(score / 100);
            
            // Reset position but keep going (endless mode)
            spiderTop = 540;
        }
    }
    
    // Create a new laser
    function createLaser() {
        if (!gameRunning) return;
        
        const laser = document.createElement('div');
        laser.className = 'laser';
        
        // Random vertical position
        const laserTop = Math.random() * 400 + 100;
        laser.style.top = `${laserTop}px`;
        
        // Random colors for visual variety
        const colors = ['#E74C3C', '#FF5722', '#F39C12', '#FF4081'];
        laser.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        // Add to game area and lasers array
        gameArea.appendChild(laser);
        lasers.push({ element: laser, top: laserTop });
    }
    
    // Move all lasers down
    function moveLasers() {
        lasers.forEach(laser => {
            // Move laser down
            laser.top += laserSpeed;
            laser.element.style.top = `${laser.top}px`;
            
            // Remove lasers that are off-screen
            if (laser.top > 600) {
                gameArea.removeChild(laser.element);
                lasers = lasers.filter(l => l !== laser);
            }
        });
    }
    
    // Clear all lasers
    function clearLasers() {
        lasers.forEach(laser => {
            gameArea.removeChild(laser.element);
        });
        lasers = [];
    }
    
    // Jump to the opposite wall
    function jump() {
        if (!gameRunning) return;
        
        if (spiderPosition === 'left') {
            spider.style.left = 'auto';
            spider.style.right = '0px';
            spider.style.transform = 'rotateY(180deg)'; // Face left
            spiderPosition = 'right';
        } else {
            spider.style.right = 'auto';
            spider.style.left = '0px';
            spider.style.transform = 'rotateY(0deg)'; // Face right
            spiderPosition = 'left';
        }
    }
    
    // Check for collisions with lasers
    function checkCollisions() {
        const spiderRect = {
            top: spiderTop,
            bottom: spiderTop + 40,
            left: spiderPosition === 'left' ? 0 : gameArea.offsetWidth - 40,
            right: spiderPosition === 'left' ? 40 : gameArea.offsetWidth
        };
        
        for (const laser of lasers) {
            const laserRect = {
                top: laser.top,
                bottom: laser.top + 10,
                left: 40,
                right: gameArea.offsetWidth - 40
            };
            
            // Check for intersection
            if (spiderRect.bottom > laserRect.top && 
                spiderRect.top < laserRect.bottom && 
                spiderRect.right > laserRect.left && 
                spiderRect.left < laserRect.right) {
                gameOver();
                return;
            }
        }
    }
    
    // Game over
    function gameOver() {
        gameRunning = false;
        
        // Stop all intervals
        clearInterval(gameInterval);
        clearInterval(laserInterval);
        
        // Convert score to something more readable
        const finalScore = Math.floor(score / 100);
        
        // Update high score if needed
        if (finalScore > highScore) {
            highScore = finalScore;
            localStorage.setItem('spiderHighScore', highScore);
            highScoreElement.textContent = highScore;
        }
        
        // Update final score display
        finalScoreElement.textContent = finalScore;
        finalLevelElement.textContent = level;
        
        // Show game over modal
        gameOverModal.style.display = 'block';
        backdrop.style.display = 'block';
    }
    
    // Event listeners
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            jump();
            e.preventDefault(); // Prevent space from scrolling the page
        }
    });
    
    // Click event for jumping
    gameArea.addEventListener('click', () => {
        jump();
    });
    
    // Touch button for mobile
    jumpBtn.addEventListener('click', () => {
        jump();
    });
    
    // Touch button for mobile
    jumpBtn.addEventListener('touchstart', () => {
        jump();
    });
    
    // Start game button
    startBtn.addEventListener('click', () => {
        initGame();
    });
    
    // Restart game button
    restartBtn.addEventListener('click', () => {
        initGame();
    });
    
    // Play again button
    playAgainBtn.addEventListener('click', () => {
        initGame();
    });
    
    // Initialize UI
    highScoreElement.textContent = highScore;
});