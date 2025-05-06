document.addEventListener('DOMContentLoaded', function() {
    const puzzleBoard = document.getElementById('puzzle-board');
    const movesCount = document.getElementById('moves-count');
    const newGameBtn = document.getElementById('new-game-btn');
    const solveBtn = document.getElementById('solve-btn');
    
    let tiles = [];
    let emptyPosition = { row: 3, col: 3 }; // Bottom right
    let moves = 0;
    let solved = false;
    let solving = false;
    let size = 4; // 4x4 grid
    
    /**
     * Initialize the puzzle board
     */
    function initializeBoard() {
        // Clear the board
        puzzleBoard.innerHTML = '';
        tiles = [];
        moves = 0;
        solved = false;
        movesCount.textContent = '0';
        
        // Create the solved state first
        for (let i = 0; i < size; i++) {
            tiles[i] = [];
            for (let j = 0; j < size; j++) {
                const value = i * size + j + 1;
                if (value < size * size) {
                    tiles[i][j] = value;
                } else {
                    tiles[i][j] = 0; // Empty space
                }
            }
        }
        
        // Shuffle the board (ensure it's solvable)
        shuffleBoard();
        
        // Render the board
        renderBoard();
    }
    
    /**
     * Shuffle the board (ensuring it's solvable)
     */
    function shuffleBoard() {
        // Make random moves from solved state (ensures solvability)
        const numMoves = 200; // Make 200 random moves
        for (let i = 0; i < numMoves; i++) {
            // Find adjacent tiles to empty space
            const adjacentTiles = getAdjacentTiles(emptyPosition.row, emptyPosition.col);
            
            // Pick a random adjacent tile
            if (adjacentTiles.length > 0) {
                const randomIndex = Math.floor(Math.random() * adjacentTiles.length);
                const randomTile = adjacentTiles[randomIndex];
                
                // Move the tile (without counting as a player move)
                moveTile(randomTile.row, randomTile.col, false);
            }
        }
    }
    
    /**
     * Get adjacent tiles to the empty space
     * @param {number} row - Row of the empty space
     * @param {number} col - Column of the empty space
     * @returns {Array} - Array of adjacent tile positions
     */
    function getAdjacentTiles(row, col) {
        const adjacent = [];
        
        // Check above
        if (row > 0) {
            adjacent.push({ row: row - 1, col: col });
        }
        
        // Check below
        if (row < size - 1) {
            adjacent.push({ row: row + 1, col: col });
        }
        
        // Check left
        if (col > 0) {
            adjacent.push({ row: row, col: col - 1 });
        }
        
        // Check right
        if (col < size - 1) {
            adjacent.push({ row: row, col: col + 1 });
        }
        
        return adjacent;
    }
    
    /**
     * Render the puzzle board
     */
    function renderBoard() {
        puzzleBoard.innerHTML = '';
        
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                const value = tiles[i][j];
                const tile = document.createElement('div');
                tile.className = 'puzzle-tile';
                
                if (value === 0) {
                    tile.classList.add('empty');
                    tile.textContent = '';
                } else {
                    tile.textContent = value;
                    tile.addEventListener('click', function() {
                        if (!solving && !solved) {
                            // Check if this tile is adjacent to the empty space
                            if (isAdjacent(i, j, emptyPosition.row, emptyPosition.col)) {
                                moveTile(i, j, true);
                            }
                        }
                    });
                }
                
                puzzleBoard.appendChild(tile);
            }
        }
    }
    
    /**
     * Check if a tile is adjacent to the empty space
     * @param {number} row1 - Row of the tile
     * @param {number} col1 - Column of the tile
     * @param {number} row2 - Row of the empty space
     * @param {number} col2 - Column of the empty space
     * @returns {boolean} - True if the tile is adjacent to the empty space
     */
    function isAdjacent(row1, col1, row2, col2) {
        return (
            (row1 === row2 && Math.abs(col1 - col2) === 1) ||
            (col1 === col2 && Math.abs(row1 - row2) === 1)
        );
    }
    
    /**
     * Move a tile to the empty space
     * @param {number} row - Row of the tile to move
     * @param {number} col - Column of the tile to move
     * @param {boolean} countMove - Whether to count this as a player move
     */
    function moveTile(row, col, countMove) {
        // Swap the tile with the empty space
        const value = tiles[row][col];
        tiles[row][col] = 0;
        tiles[emptyPosition.row][emptyPosition.col] = value;
        
        // Update the empty position
        emptyPosition = { row, col };
        
        // Increment move counter if this is a player move
        if (countMove) {
            moves++;
            movesCount.textContent = moves;
            
            // Check if the puzzle is solved
            checkIfSolved();
        }
        
        // Re-render the board
        renderBoard();
    }
    
    /**
     * Check if the puzzle is solved
     */
    function checkIfSolved() {
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                const expectedValue = i * size + j + 1;
                // Skip the last position (empty space)
                if (expectedValue === size * size) {
                    continue;
                }
                
                if (tiles[i][j] !== expectedValue) {
                    return;
                }
            }
        }
        
        // If we got here, the puzzle is solved
        solved = true;
        alert('Congratulations! You solved the puzzle in ' + moves + ' moves!');
        
        // Add the game to history
        if (typeof saveToolToHistory === 'function') {
            saveToolToHistory({
                name: 'Sliding Puzzle',
                url: 'games/sliding-puzzle.html',
                icon: 'puzzle-piece'
            });
        }
    }
    
    /**
     * Solve the puzzle automatically
     */
    function solvePuzzle() {
        if (solving || solved) return;
        
        solving = true;
        
        // Reset to solved state
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                const value = i * size + j + 1;
                if (value < size * size) {
                    tiles[i][j] = value;
                } else {
                    tiles[i][j] = 0; // Empty space
                }
            }
        }
        
        emptyPosition = { row: size - 1, col: size - 1 };
        solved = true;
        
        // Re-render the board
        renderBoard();
        
        setTimeout(() => {
            alert('Puzzle solved!');
            solving = false;
        }, 300);
    }
    
    // Initialize the board when the page loads
    initializeBoard();
    
    // Add event listeners
    newGameBtn.addEventListener('click', initializeBoard);
    solveBtn.addEventListener('click', solvePuzzle);
    
    // Add the game to history
    if (typeof saveToolToHistory === 'function') {
        saveToolToHistory({
            name: 'Sliding Puzzle',
            url: 'games/sliding-puzzle.html',
            icon: 'puzzle-piece'
        });
    }
});