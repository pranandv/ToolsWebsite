document.addEventListener('DOMContentLoaded', function() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    /**
     * Initialize dark mode based on user preference or localStorage
     */
    function initDarkMode() {
        // Check localStorage first
        const savedMode = localStorage.getItem('darkMode');
        
        if (savedMode === 'enabled') {
            document.body.classList.add('dark-mode');
            updateDarkModeToggleIcon(true);
        } else if (savedMode === 'disabled') {
            document.body.classList.remove('dark-mode');
            updateDarkModeToggleIcon(false);
        } else {
            // If no saved preference, use system preference
            if (prefersDarkScheme.matches) {
                document.body.classList.add('dark-mode');
                updateDarkModeToggleIcon(true);
            }
        }
    }
    
    /**
     * Toggle dark mode and save preference
     */
    function toggleDarkMode() {
        if (document.body.classList.contains('dark-mode')) {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('darkMode', 'disabled');
            updateDarkModeToggleIcon(false);
        } else {
            document.body.classList.add('dark-mode');
            localStorage.setItem('darkMode', 'enabled');
            updateDarkModeToggleIcon(true);
        }
    }
    
    /**
     * Update the dark mode toggle icon
     * @param {boolean} isDarkMode - Whether dark mode is enabled
     */
    function updateDarkModeToggleIcon(isDarkMode) {
        if (!darkModeToggle) return;
        
        if (isDarkMode) {
            darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            darkModeToggle.setAttribute('aria-label', 'Switch to light mode');
        } else {
            darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            darkModeToggle.setAttribute('aria-label', 'Switch to dark mode');
        }
    }
    
    // Initialize dark mode
    initDarkMode();
    
    // Add event listener to dark mode toggle button
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', toggleDarkMode);
    }
    
    // Listen for system preference changes
    prefersDarkScheme.addEventListener('change', function(e) {
        // Only update if user hasn't set a preference
        if (!localStorage.getItem('darkMode')) {
            if (e.matches) {
                document.body.classList.add('dark-mode');
                updateDarkModeToggleIcon(true);
            } else {
                document.body.classList.remove('dark-mode');
                updateDarkModeToggleIcon(false);
            }
        }
    });
});
