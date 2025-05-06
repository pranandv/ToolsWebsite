document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const menuToggle = document.getElementById('menu-toggle');
    const mainMenu = document.getElementById('main-menu');
    
    if (menuToggle && mainMenu) {
        menuToggle.addEventListener('click', function() {
            mainMenu.classList.toggle('active');
        });
    }
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (mainMenu && mainMenu.classList.contains('active') && 
            !event.target.closest('#main-menu') && 
            !event.target.closest('#menu-toggle')) {
            mainMenu.classList.remove('active');
        }
    });

    // Active link highlighting
    const currentLocation = window.location.pathname;
    const menuLinks = document.querySelectorAll('#main-menu a');
    
    menuLinks.forEach(link => {
        // Remove active class from all links
        link.classList.remove('active');
        
        // Add active class to current page link
        if (link.getAttribute('href') === currentLocation || 
            (currentLocation.includes('calculators/') && link.getAttribute('href') === 'index.html')) {
            link.classList.add('active');
        }
    });

    // Back to top functionality
    const createBackToTopButton = () => {
        const backToTopBtn = document.createElement('button');
        backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
        backToTopBtn.setAttribute('aria-label', 'Back to top');
        backToTopBtn.classList.add('back-to-top');
        backToTopBtn.style.display = 'none';
        backToTopBtn.style.position = 'fixed';
        backToTopBtn.style.bottom = '20px';
        backToTopBtn.style.right = '20px';
        backToTopBtn.style.zIndex = '99';
        backToTopBtn.style.width = '40px';
        backToTopBtn.style.height = '40px';
        backToTopBtn.style.fontSize = '16px';
        backToTopBtn.style.backgroundColor = 'var(--primary-color)';
        backToTopBtn.style.color = 'white';
        backToTopBtn.style.border = 'none';
        backToTopBtn.style.borderRadius = '50%';
        backToTopBtn.style.cursor = 'pointer';
        backToTopBtn.style.opacity = '0.7';
        backToTopBtn.style.transition = 'opacity 0.3s ease';
        
        backToTopBtn.addEventListener('mouseenter', () => {
            backToTopBtn.style.opacity = '1';
        });
        
        backToTopBtn.addEventListener('mouseleave', () => {
            backToTopBtn.style.opacity = '0.7';
        });
        
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        
        document.body.appendChild(backToTopBtn);
        
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTopBtn.style.display = 'block';
            } else {
                backToTopBtn.style.display = 'none';
            }
        });
    };
    
    createBackToTopButton();
    

});
