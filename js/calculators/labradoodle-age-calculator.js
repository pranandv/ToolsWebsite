document.addEventListener('DOMContentLoaded', function() {
    const labradoodleAgeCalculatorForm = document.getElementById('labradoodle-age-calculator-form');
    const labradoodleAgeInput = document.getElementById('labradoodle-age');
    const labradoodleSizeInput = document.getElementById('labradoodle-size');
    const labradoodleAgeResult = document.getElementById('labradoodle-age-result');
    const labradoodleAgeValue = document.getElementById('labradoodle-age-value');
    const labradoodleAgeDescription = document.getElementById('labradoodle-age-description');
    
    /**
     * Calculate Labradoodle's human age
     * @param {Number} dogAge - Labradoodle's age in years
     * @param {String} dogSize - Labradoodle's size (miniature, medium, standard)
     * @returns {Number} Labradoodle's human age
     */
    function calculateLabradoodleHumanAge(dogAge, dogSize) {
        // Labradoodles are a mix of Labrador and Poodle
        // Their aging is somewhat between the two breeds
        
        let humanAge = 0;
        
        if (dogAge <= 1) {
            // First year
            humanAge = dogAge * 15;
        } else if (dogAge <= 2) {
            // Up to second year
            humanAge = 15 + (dogAge - 1) * 9;
        } else {
            // First two years
            humanAge = 24;
            
            // Additional years based on size
            const remainingYears = dogAge - 2;
            
            switch (dogSize) {
                case 'miniature':
                    // Miniature Labradoodles age similar to small dogs
                    humanAge += remainingYears * 4;
                    break;
                case 'medium':
                    humanAge += remainingYears * 4.5;
                    break;
                case 'standard':
                    // Standard Labradoodles age similar to large dogs
                    humanAge += remainingYears * 5;
                    break;
                default:
                    humanAge += remainingYears * 4.5;
            }
        }
        
        return humanAge;
    }
    
    /**
     * Generate Labradoodle age description
     * @param {Number} dogAge - Labradoodle's age in years
     * @param {Number} humanAge - Calculated human age
     * @param {String} dogSize - Labradoodle's size
     * @returns {String} Description of Labradoodle's age
     */
    function generateLabradoodleAgeDescription(dogAge, humanAge, dogSize) {
        const sizeText = {
            'miniature': 'miniature',
            'medium': 'medium',
            'standard': 'standard'
        }[dogSize];
        
        const dogAgeText = dogAge === 1 ? '1 year' : `${dogAge} years`;
        
        return `A ${dogAgeText} old ${sizeText} Labradoodle is equivalent to a human who is approximately ${Math.round(humanAge)} years old.`;
    }
    
    /**
     * Handle form submission
     * @param {Event} e - Form submission event
     */
    function handleFormSubmit(e) {
        e.preventDefault();
        
        // Get input values
        const dogAge = parseFloat(labradoodleAgeInput.value);
        const dogSize = labradoodleSizeInput.value;
        
        // Validate inputs
        if (!dogSize) {
            alert('Please select your Labradoodle\'s size.');
            return;
        }
        
        // Calculate human age
        const humanAge = calculateLabradoodleHumanAge(dogAge, dogSize);
        
        // Display result
        labradoodleAgeValue.textContent = `${Math.round(humanAge)} human years`;
        labradoodleAgeDescription.textContent = generateLabradoodleAgeDescription(dogAge, humanAge, dogSize);
        labradoodleAgeResult.style.display = 'block';
    }
    
    // Add event listener to form
    if (labradoodleAgeCalculatorForm) {
        labradoodleAgeCalculatorForm.addEventListener('submit', handleFormSubmit);
    }
});
