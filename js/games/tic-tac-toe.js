document.addEventListener('DOMContentLoaded', function() {
    // Game elements
    const gameBoard = document.getElementById('game-board');
    const cells = Array.from(document.querySelectorAll('.cell'));
    const gameInfo = document.getElementById('game-info');
    const newGameButton = document.getElementById('new-game-btn');
    const resetScoreButton = document.getElementById('reset-score-btn');
    const modeButtons = document.querySelectorAll('.mode-btn');
    const xScoreElement = document.getElementById('x-score');
    const oScoreElement = document.getElementById('o-score');
    const tiesElement = document.getElementById('ties');
    
    // Game variables
    let board = ['', '', '', '', '', '', '', '', ''];
    let currentPlayer = 'X';
    let isGameActive = true;
    let gameMode = 'easy'; // 'easy', 'hard', or 'two-player'
    let scores = {
        X: 0,
        O: 0,
        ties: 0
    };
    
    // Winning combinations
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6]             // diagonals
    ];
    
    /**
     * Start a new game
     */
    function startNewGame() {
        board = ['', '', '', '', '', '', '', '', ''];
        currentPlayer = 'X';
        isGameActive = true;
        gameInfo.textContent = "X's turn";
        
        // Clear the board
        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('x', 'o');
        });
        
        // If playing against AI and O goes first (AI), make the first move
        if (gameMode !== 'two-player' && currentPlayer === 'O') {
            makeAIMove();
        }
    }
    
    /**
     * Handle cell click
     * @param {number} index - Index of the clicked cell
     */
    function handleCellClick(index) {
        // Ignore clicks if the cell is already filled or the game is over
        if (board[index] !== '' || !isGameActive) {
            return;
        }
        
        // Update the board and UI
        board[index] = currentPlayer;
        cells[index].textContent = currentPlayer;
        cells[index].classList.add(currentPlayer.toLowerCase());
        
        // Check for win or draw
        if (checkWin()) {
            gameInfo.textContent = `${currentPlayer} wins!`;
            isGameActive = false;
            updateScore(currentPlayer);
            return;
        }
        
        if (checkDraw()) {
            gameInfo.textContent = "It's a draw!";
            isGameActive = false;
            updateScore('ties');
            return;
        }
        
        // Switch player
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        gameInfo.textContent = `${currentPlayer}'s turn`;
        
        // If playing against AI and it's O's turn (AI), make the AI move
        if (gameMode !== 'two-player' && currentPlayer === 'O' && isGameActive) {
            // Add a small delay to make it seem like the AI is thinking
            setTimeout(makeAIMove, 600);
        }
    }
    
    /**
     * Make an AI move based on the current game mode
     */
    function makeAIMove() {
        if (!isGameActive) return;
        
        let moveIndex;
        
        if (gameMode === 'easy') {
            moveIndex = makeRandomMove();
        } else if (gameMode === 'hard') {
            moveIndex = makeBestMove();
        }
        
        if (moveIndex !== undefined) {
            handleCellClick(moveIndex);
        }
    }
    
    /**
     * Make a random move (easy AI)
     * @returns {number} - Index of the random move
     */
    function makeRandomMove() {
        // Find all available (empty) cells
        const availableMoves = board.reduce((acc, cell, index) => {
            if (cell === '') {
                acc.push(index);
            }
            return acc;
        }, []);
        
        // Pick a random empty cell
        if (availableMoves.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableMoves.length);
            return availableMoves[randomIndex];
        }
        
        return undefined;
    }
    
    /**
     * Make the best move (hard AI) using the minimax algorithm
     * @returns {number} - Index of the best move
     */
    function makeBestMove() {
        let bestScore = -Infinity;
        let bestMove;
        
        for (let i = 0; i < board.length; i++) {
            // Check if the cell is empty
            if (board[i] === '') {
                // Make the move
                board[i] = 'O';
                
                // Calculate score for this move
                const score = minimax(board, 0, false);
                
                // Undo the move
                board[i] = '';
                
                // Update best score and move
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
        
        return bestMove;
    }
    
    /**
     * Minimax algorithm for AI decision making
     * @param {Array} board - Current board state
     * @param {number} depth - Current depth in the game tree
     * @param {boolean} isMaximizing - Whether to maximize or minimize the score
     * @returns {number} - Score for the move
     */
    function minimax(board, depth, isMaximizing) {
        // Check for terminal states (win/draw)
        if (checkWinForMinimax('O')) {
            return 10 - depth;  // AI wins
        }
        
        if (checkWinForMinimax('X')) {
            return depth - 10;  // Human wins
        }
        
        if (checkDrawForMinimax()) {
            return 0;  // Draw
        }
        
        if (isMaximizing) {
            // Maximizing player (AI - O)
            let bestScore = -Infinity;
            
            for (let i = 0; i < board.length; i++) {
                if (board[i] === '') {
                    board[i] = 'O';
                    const score = minimax(board, depth + 1, false);
                    board[i] = '';
                    bestScore = Math.max(score, bestScore);
                }
            }
            
            return bestScore;
        } else {
            // Minimizing player (Human - X)
            let bestScore = Infinity;
            
            for (let i = 0; i < board.length; i++) {
                if (board[i] === '') {
                    board[i] = 'X';
                    const score = minimax(board, depth + 1, true);
                    board[i] = '';
                    bestScore = Math.min(score, bestScore);
                }
            }
            
            return bestScore;
        }
    }
    
    /**
     * Check for a win
     * @returns {boolean} - True if the current player has won
     */
    function checkWin() {
        for (const pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                // Highlight the winning cells
                cells[a].style.backgroundColor = 'rgba(46, 204, 113, 0.3)';
                cells[b].style.backgroundColor = 'rgba(46, 204, 113, 0.3)';
                cells[c].style.backgroundColor = 'rgba(46, 204, 113, 0.3)';
                return true;
            }
        }
        return false;
    }
    
    /**
     * Check for a win (minimax version without UI updates)
     * @param {string} player - Player to check for ('X' or 'O')
     * @returns {boolean} - True if the specified player has won
     */
    function checkWinForMinimax(player) {
        for (const pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (board[a] === player && board[b] === player && board[c] === player) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Check for a draw
     * @returns {boolean} - True if the game is a draw
     */
    function checkDraw() {
        return board.every(cell => cell !== '');
    }
    
    /**
     * Check for a draw (minimax version)
     * @returns {boolean} - True if the game is a draw
     */
    function checkDrawForMinimax() {
        return board.every(cell => cell !== '') && 
               !checkWinForMinimax('X') && 
               !checkWinForMinimax('O');
    }
    
    /**
     * Update the score
     * @param {string} winner - Winner ('X', 'O', or 'ties')
     */
    function updateScore(winner) {
        if (winner === 'X') {
            scores.X++;
            xScoreElement.textContent = scores.X;
        } else if (winner === 'O') {
            scores.O++;
            oScoreElement.textContent = scores.O;
        } else {
            scores.ties++;
            tiesElement.textContent = scores.ties;
        }
    }
    
    /**
     * Reset the score
     */
    function resetScore() {
        scores.X = 0;
        scores.O = 0;
        scores.ties = 0;
        
        xScoreElement.textContent = '0';
        oScoreElement.textContent = '0';
        tiesElement.textContent = '0';
    }
    
    /**
     * Change the game mode
     * @param {string} mode - New game mode ('easy', 'hard', or 'two-player')
     */
    function changeGameMode(mode) {
        gameMode = mode;
        startNewGame();
    }
    
    // Add event listeners to cells
    cells.forEach(cell => {
        cell.addEventListener('click', () => {
            const index = parseInt(cell.dataset.index);
            handleCellClick(index);
        });
    });
    
    // Add event listeners to buttons
    newGameButton.addEventListener('click', startNewGame);
    resetScoreButton.addEventListener('click', resetScore);
    
    // Add event listeners to mode buttons
    modeButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active button
            modeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Change game mode
            changeGameMode(button.dataset.mode);
        });
    });
    
    // Initialize the game
    startNewGame();
    
    // Add to tool history
    if (typeof saveToolToHistory === 'function') {
        saveToolToHistory({
            name: 'Tic Tac Toe',
            url: 'games/tic-tac-toe.html',
            icon: 'times'
        });
    }
});