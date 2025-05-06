document.addEventListener('DOMContentLoaded', function() {
    const babyAgeCalculatorForm = document.getElementById('baby-age-calculator-form');
    const babyBirthdateInput = document.getElementById('baby-birthdate');
    const calculationDateInput = document.getElementById('calculation-date');
    const babyAgeResult = document.getElementById('baby-age-result');
    const babyAgeValue = document.getElementById('baby-age-value');
    const babyAgeDescription = document.getElementById('baby-age-description');
    const babyMonths = document.getElementById('baby-months');
    const babyWeeks = document.getElementById('baby-weeks');
    const babyDays = document.getElementById('baby-days');
    
    /**
     * Calculate baby age in different units
     * @param {Date} birthDate - Baby's date of birth
     * @param {Date} calculationDate - Date to calculate age as of
     * @returns {Object} Baby's age in different units
     */
    function calculateBabyAge(birthDate, calculationDate) {
        // Calculate difference in milliseconds
        const diffTime = Math.abs(calculationDate - birthDate);
        
        // Calculate total days
        const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        // Calculate years, months, weeks and days
        const years = Math.floor(totalDays / 365.25);
        const months = Math.floor(totalDays / 30.44);
        const weeks = Math.floor(totalDays / 7);
        const days = totalDays;
        
        // Calculate remaining days after complete weeks
        const remainingDays = totalDays % 7;
        
        return {
            years: years,
            months: months,
            weeks: weeks,
            days: days,
            remainingDays: remainingDays
        };
    }
    
    /**
     * Format baby age for display
     * @param {Object} age - Baby's age object
     * @returns {String} Formatted age string
     */
    function formatBabyAge(age) {
        // If baby is less than 2 years old, show months
        if (age.years < 2) {
            return `${age.months} month${age.months !== 1 ? 's' : ''}`;
        } else {
            // For older babies/toddlers, show years and months
            const remainingMonths = age.months - (age.years * 12);
            let result = `${age.years} year${age.years !== 1 ? 's' : ''}`;
            
            if (remainingMonths > 0) {
                result += ` and ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
            }
            
            return result;
        }
    }
    
    /**
     * Generate baby age description
     * @param {Object} age - Baby's age object
     * @param {Date} birthDate - Baby's date of birth
     * @param {Date} calculationDate - Date to calculate age as of
     * @returns {String} Age description
     */
    function generateBabyAgeDescription(age, birthDate, calculationDate) {
        const formattedBirthDate = birthDate.toLocaleDateString('en-US', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        });
        
        const formattedCalcDate = calculationDate.toLocaleDateString('en-US', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        });
        
        return `Born on ${formattedBirthDate}, as of ${formattedCalcDate}, your baby is ${formatBabyAge(age)} old.`;
    }
    
    /**
     * Handle form submission
     * @param {Event} e - Form submission event
     */
    function handleFormSubmit(e) {
        e.preventDefault();
        
        // Get input values
        const birthDate = new Date(babyBirthdateInput.value);
        const calculationDate = calculationDateInput.value ? new Date(calculationDateInput.value) : new Date();
        
        // Validate dates
        if (birthDate > calculationDate) {
            alert('Birth date cannot be in the future of the calculation date.');
            return;
        }
        
        // Calculate baby age
        const age = calculateBabyAge(birthDate, calculationDate);
        
        // Display result
        babyAgeValue.textContent = formatBabyAge(age);
        babyAgeDescription.textContent = generateBabyAgeDescription(age, birthDate, calculationDate);
        
        // Display detailed breakdown
        babyMonths.textContent = age.months;
        babyWeeks.textContent = age.weeks;
        babyDays.textContent = age.days;
        
        babyAgeResult.style.display = 'block';
    }
    
    // Set today as the max date and default for calculation date
    const today = new Date().toISOString().split('T')[0];
    babyBirthdateInput.max = today;
    calculationDateInput.max = today;
    calculationDateInput.value = today; // Set today as the default calculation date
    
    // Add event listener to form
    if (babyAgeCalculatorForm) {
        babyAgeCalculatorForm.addEventListener('submit', handleFormSubmit);
    }
});
