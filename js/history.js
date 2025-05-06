document.addEventListener('DOMContentLoaded', function() {
    // Tool history functionality
    const historyContainer = document.getElementById('history-container');
    const emptyHistoryMessage = '<p class="empty-history">You haven\'t used any tools yet. Try one from above!</p>';
    
    /**
     * Get tool history from localStorage
     * @returns {Array} Array of tool history objects
     */
    function getToolHistory() {
        const history = localStorage.getItem('calculatorToolHistory');
        return history ? JSON.parse(history) : [];
    }
    
    /**
     * Save tool to history
     * @param {Object} tool - Tool object to save
     */
    function saveToolToHistory(tool) {
        const history = getToolHistory();
        
        // Check if tool already exists in history
        const existingToolIndex = history.findIndex(item => item.url === tool.url);
        
        if (existingToolIndex !== -1) {
            // Remove existing entry to add it to the top
            history.splice(existingToolIndex, 1);
        }
        
        // Add new tool to the beginning
        history.unshift(tool);
        
        // Keep only the last 5 tools
        const trimmedHistory = history.slice(0, 5);
        
        // Save to localStorage
        localStorage.setItem('calculatorToolHistory', JSON.stringify(trimmedHistory));
    }
    
    /**
     * Display tool history in the container
     */
    function displayToolHistory() {
        if (!historyContainer) return;
        
        const history = getToolHistory();
        
        if (history.length === 0) {
            historyContainer.innerHTML = emptyHistoryMessage;
            return;
        }
        
        let historyHTML = '';
        
        history.forEach(tool => {
            historyHTML += `
                <div class="history-item">
                    <div class="history-icon">
                        <i class="${tool.icon}"></i>
                    </div>
                    <div class="history-details">
                        <h3>${tool.name}</h3>
                        <p>Last used: ${tool.lastUsed}</p>
                    </div>
                    <a href="${tool.url}" class="btn" aria-label="Use ${tool.name} again">
                        <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            `;
        });
        
        historyContainer.innerHTML = historyHTML;
    }
    
    // Add current tool to history if we're on a calculator page
    function addCurrentToolToHistory() {
        const calculatorContainer = document.querySelector('.calculator-container');
        
        if (calculatorContainer) {
            const pageTitle = document.querySelector('.calculator-header h2')?.textContent || 'Calculator Tool';
            const toolIconClass = getToolIconClass(window.location.pathname);
            
            const tool = {
                name: pageTitle,
                url: window.location.pathname,
                icon: toolIconClass,
                lastUsed: new Date().toLocaleDateString()
            };
            
            saveToolToHistory(tool);
        }
    }
    
    /**
     * Get the icon class based on the tool URL
     * @param {string} url - The tool URL
     * @returns {string} Font Awesome icon class
     */
    function getToolIconClass(url) {
        if (url.includes('age-calculator')) return 'fas fa-calendar-alt';
        if (url.includes('retirement-calculator')) return 'fas fa-umbrella-beach';
        if (url.includes('baby-age-calculator')) return 'fas fa-baby';
        if (url.includes('pedigree-age-calculator')) return 'fas fa-paw';
        if (url.includes('labradoodle-age-calculator')) return 'fas fa-dog';
        if (url.includes('bmi-calculator')) return 'fas fa-weight';
        if (url.includes('emi-calculator')) return 'fas fa-money-bill-wave';
        return 'fas fa-calculator';
    }
    
    // Display tool history on homepage
    displayToolHistory();
    
    // Add current page to history if it's a calculator page
    addCurrentToolToHistory();
});
