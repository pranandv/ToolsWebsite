document.addEventListener('DOMContentLoaded', function() {
    const pedigreeAgeCalculatorForm = document.getElementById('pedigree-age-calculator-form');
    const dogAgeInput = document.getElementById('dog-age');
    const dogSizeInput = document.getElementById('dog-size');
    const pedigreeAgeResult = document.getElementById('pedigree-age-result');
    const pedigreeAgeValue = document.getElementById('pedigree-age-value');
    const pedigreeAgeDescription = document.getElementById('pedigree-age-description');
    
    /**
     * Calculate dog's human age based on more accurate method
     * @param {Number} dogAge - Dog's age in years
     * @param {String} dogSize - Dog's size (small, medium, large, giant)
     * @returns {Number} Dog's human age
     */
    function calculateDogHumanAge(dogAge, dogSize) {
        // First year of a dog's life equals about 15 human years
        // Second year adds about 9 human years
        // Each additional year adds about 4-5 human years depending on size
        
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
                case 'small':
                    // Small dogs age slower after 2 years
                    humanAge += remainingYears * 4;
                    break;
                case 'medium':
                    humanAge += remainingYears * 4.5;
                    break;
                case 'large':
                    humanAge += remainingYears * 5;
                    break;
                case 'giant':
                    // Giant dogs age faster after 2 years
                    humanAge += remainingYears * 5.5;
                    break;
                default:
                    humanAge += remainingYears * 4.5;
            }
        }
        
        return humanAge;
    }
    
    /**
     * Generate dog age description
     * @param {Number} dogAge - Dog's age in years
     * @param {Number} humanAge - Calculated human age
     * @param {String} dogSize - Dog's size
     * @returns {String} Description of dog's age
     */
    function generateDogAgeDescription(dogAge, humanAge, dogSize) {
        const sizeText = {
            'small': 'small',
            'medium': 'medium-sized',
            'large': 'large',
            'giant': 'giant'
        }[dogSize];
        
        const dogAgeText = dogAge === 1 ? '1 year' : `${dogAge} years`;
        
        return `A ${dogAgeText} old ${sizeText} dog is equivalent to a human who is approximately ${Math.round(humanAge)} years old.`;
    }
    
    /**
     * Handle form submission
     * @param {Event} e - Form submission event
     */
    function handleFormSubmit(e) {
        e.preventDefault();
        
        // Get input values
        const dogAge = parseFloat(dogAgeInput.value);
        const dogSize = dogSizeInput.value;
        
        // Validate inputs
        if (!dogSize) {
            alert('Please select your dog\'s size.');
            return;
        }
        
        // Calculate human age
        const humanAge = calculateDogHumanAge(dogAge, dogSize);
        
        // Display result
        pedigreeAgeValue.textContent = `${Math.round(humanAge)} human years`;
        pedigreeAgeDescription.textContent = generateDogAgeDescription(dogAge, humanAge, dogSize);
        pedigreeAgeResult.style.display = 'block';
    }
    
    // Add event listener to form
    if (pedigreeAgeCalculatorForm) {
        pedigreeAgeCalculatorForm.addEventListener('submit', handleFormSubmit);
    }
});
