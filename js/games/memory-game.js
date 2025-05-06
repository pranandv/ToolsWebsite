document.addEventListener('DOMContentLoaded', function() {
    // Game elements
    const board = document.getElementById('memory-board');
    const movesElement = document.getElementById('moves');
    const pairsElement = document.getElementById('pairs');
    const totalPairsElement = document.getElementById('total-pairs');
    const timerElement = document.getElementById('timer');
    const gameCompleteElement = document.getElementById('game-complete');
    const finalMovesElement = document.getElementById('final-moves');
    const finalTimeElement = document.getElementById('final-time');
    const starRatingElement = document.getElementById('star-rating');
    const newGameButton = document.getElementById('new-game-btn');
    const resetButton = document.getElementById('reset-btn');
    const difficultyButtons = document.querySelectorAll('.difficulty-btn');
    
    // Game variables
    let cards = [];
    let flippedCards = [];
    let matchedPairs = 0;
    let totalPairs = 8; // Default for easy mode
    let moves = 0;
    let timer;
    let seconds = 0;
    let isPlaying = false;
    let difficulty = 'easy'; // Default difficulty
    
    // Symbols and colors for cards (using Font Awesome icons with colors)
    const symbols = [
        { icon: 'fa-heart', color: '#ff5b5b' },      // Red
        { icon: 'fa-star', color: '#ffd700' },       // Gold
        { icon: 'fa-bell', color: '#ffa500' },       // Orange
        { icon: 'fa-moon', color: '#a0a0ff' },       // Light blue
        { icon: 'fa-sun', color: '#ffce00' },        // Yellow
        { icon: 'fa-tree', color: '#38b000' },       // Green
        { icon: 'fa-gift', color: '#9d4edd' },       // Purple
        { icon: 'fa-bolt', color: '#ffcc00' },       // Yellow
        { icon: 'fa-cloud', color: '#73c2fb' },      // Sky blue
        { icon: 'fa-fire', color: '#ff6d00' },       // Orange-red
        { icon: 'fa-gem', color: '#0077b6' },        // Blue
        { icon: 'fa-umbrella', color: '#e63946' },   // Red
        { icon: 'fa-snowflake', color: '#90e0ef' },  // Light blue
        { icon: 'fa-car', color: '#5f5f5f' },        // Dark gray
        { icon: 'fa-apple-alt', color: '#d90429' },  // Red
        { icon: 'fa-plane', color: '#3a86ff' },      // Blue
        { icon: 'fa-house', color: '#588157' },      // Green
        { icon: 'fa-music', color: '#7209b7' },      // Purple
        { icon: 'fa-key', color: '#bc6c25' },        // Brown
        { icon: 'fa-crown', color: '#ffc300' },      // Gold
        { icon: 'fa-globe', color: '#2a9d8f' },      // Teal
        { icon: 'fa-gamepad', color: '#6c757d' },    // Gray
        { icon: 'fa-fish', color: '#118ab2' },       // Blue
        { icon: 'fa-pizza-slice', color: '#e76f51' } // Orange-red
    ];
    
    /**
     * Initialize the game
     */
    function initGame() {
        // Reset game state
        flippedCards = [];
        matchedPairs = 0;
        moves = 0;
        seconds = 0;
        isPlaying = false;
        
        // Update UI
        movesElement.textContent = '0';
        pairsElement.textContent = '0';
        timerElement.textContent = '00:00';
        gameCompleteElement.style.display = 'none';
        
        // Clear the board
        board.innerHTML = '';
        
        // Set board grid based on difficulty
        if (difficulty === 'easy') {
            totalPairs = 8;
            board.style.gridTemplateColumns = 'repeat(4, 1fr)';
        } else if (difficulty === 'medium') {
            totalPairs = 10;
            board.style.gridTemplateColumns = 'repeat(5, 1fr)';
        } else if (difficulty === 'hard') {
            totalPairs = 12;
            board.style.gridTemplateColumns = 'repeat(6, 1fr)';
        }
        
        totalPairsElement.textContent = totalPairs;
        
        // Create card pairs
        createCards();
        
        // Shuffle and render cards
        shuffleCards();
        renderCards();
        
        // Clear any existing timer
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
    }
    
    /**
     * Create cards with pairs of symbols
     */
    function createCards() {
        cards = [];
        
        // Get a subset of symbols based on total pairs
        const selectedSymbols = symbols.slice(0, totalPairs);
        
        // Create pairs
        selectedSymbols.forEach(symbol => {
            // Create two cards with the same symbol (a pair)
            cards.push(
                { id: Math.random().toString(36).substr(2, 9), symbol: symbol, isFlipped: false, isMatched: false },
                { id: Math.random().toString(36).substr(2, 9), symbol: symbol, isFlipped: false, isMatched: false }
            );
        });
    }
    
    /**
     * Shuffle the cards
     */
    function shuffleCards() {
        for (let i = cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cards[i], cards[j]] = [cards[j], cards[i]];
        }
    }
    
    /**
     * Render the cards on the board
     */
    function renderCards() {
        board.innerHTML = '';
        
        cards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            cardElement.dataset.id = card.id;
            
            if (card.isFlipped || card.isMatched) {
                cardElement.classList.add('flipped');
            }
            
            cardElement.innerHTML = `
                <div class="card-inner">
                    <div class="card-front">
                        <i class="fas fa-question"></i>
                    </div>
                    <div class="card-back">
                        <i class="fas ${card.symbol.icon}" style="color: ${card.symbol.color};"></i>
                    </div>
                </div>
            `;
            
            cardElement.addEventListener('click', () => handleCardClick(card));
            board.appendChild(cardElement);
        });
    }
    
    /**
     * Handle card click
     * @param {Object} card - The clicked card
     */
    function handleCardClick(card) {
        // Ignore clicks if the card is already flipped or matched
        if (card.isFlipped || card.isMatched) {
            return;
        }
        
        // Ignore clicks if two cards are already flipped (waiting for check)
        if (flippedCards.length === 2) {
            return;
        }
        
        // Start timer on first card click
        if (!isPlaying) {
            startTimer();
            isPlaying = true;
        }
        
        // Flip the card
        card.isFlipped = true;
        flippedCards.push(card);
        
        // Update the UI
        renderCards();
        
        // Check for matches if two cards are flipped
        if (flippedCards.length === 2) {
            moves++;
            movesElement.textContent = moves;
            
            setTimeout(checkForMatch, 700);
        }
    }
    
    /**
     * Check if the two flipped cards match
     */
    function checkForMatch() {
        const [card1, card2] = flippedCards;
        
        if (card1.symbol.icon === card2.symbol.icon) {
            // Match found
            card1.isMatched = true;
            card2.isMatched = true;
            matchedPairs++;
            pairsElement.textContent = matchedPairs;
            
            // Check if all pairs are found
            if (matchedPairs === totalPairs) {
                gameComplete();
            }
        } else {
            // No match
            card1.isFlipped = false;
            card2.isFlipped = false;
        }
        
        // Clear flipped cards
        flippedCards = [];
        
        // Update the UI
        renderCards();
    }
    
    /**
     * Start the timer
     */
    function startTimer() {
        seconds = 0;
        timer = setInterval(() => {
            seconds++;
            timerElement.textContent = formatTime(seconds);
        }, 1000);
    }
    
    /**
     * Format time from seconds to MM:SS
     * @param {number} seconds - Time in seconds
     * @returns {string} - Formatted time string
     */
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    /**
     * Calculate the star rating based on moves and difficulty
     * @returns {number} - Star rating (1-3)
     */
    function calculateStarRating() {
        let threshold1, threshold2;
        
        if (difficulty === 'easy') {
            threshold1 = 14;
            threshold2 = 19;
        } else if (difficulty === 'medium') {
            threshold1 = 18;
            threshold2 = 25;
        } else { // hard
            threshold1 = 24;
            threshold2 = 32;
        }
        
        if (moves <= threshold1) {
            return 3; // 3 stars
        } else if (moves <= threshold2) {
            return 2; // 2 stars
        } else {
            return 1; // 1 star
        }
    }
    
    /**
     * Handle game completion
     */
    function gameComplete() {
        // Stop the timer
        clearInterval(timer);
        timer = null;
        isPlaying = false;
        
        // Update the UI
        finalMovesElement.textContent = moves;
        finalTimeElement.textContent = formatTime(seconds);
        
        // Calculate and display star rating
        const stars = calculateStarRating();
        starRatingElement.innerHTML = '';
        for (let i = 0; i < stars; i++) {
            starRatingElement.innerHTML += '<i class="fas fa-star" style="color: gold;"></i>';
        }
        for (let i = stars; i < 3; i++) {
            starRatingElement.innerHTML += '<i class="far fa-star" style="color: gold;"></i>';
        }
        
        // Show the game complete message
        gameCompleteElement.style.display = 'block';
        

    }
    
    /**
     * Handle difficulty button click
     * @param {Event} e - Click event
     */
    function handleDifficultyClick(e) {
        const button = e.target;
        const newDifficulty = button.dataset.difficulty;
        
        if (newDifficulty !== difficulty) {
            // Update active button
            difficultyButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Update difficulty and restart game
            difficulty = newDifficulty;
            initGame();
        }
    }
    
    // Add event listeners
    newGameButton.addEventListener('click', initGame);
    resetButton.addEventListener('click', initGame);
    difficultyButtons.forEach(button => {
        button.addEventListener('click', handleDifficultyClick);
    });
    
    // Initialize the game
    initGame();
});