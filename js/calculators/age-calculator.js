document.addEventListener('DOMContentLoaded', function() {
    const ageCalculatorForm = document.getElementById('age-calculator-form');
    const birthDateInput = document.getElementById('birth-date');
    const calculationDateInput = document.getElementById('calculation-date');
    const ageResult = document.getElementById('age-result');
    const ageValue = document.getElementById('age-value');
    const ageDescription = document.getElementById('age-description');
    
    /**
     * Calculate age based on birth date and calculation date
     * @param {Date} birthDate - Date of birth
     * @param {Date} calculationDate - Date to calculate age as of
     * @returns {Object} Age in years, months, and days
     */
    function calculateAge(birthDate, calculationDate) {
        const birthYear = birthDate.getFullYear();
        const birthMonth = birthDate.getMonth();
        const birthDay = birthDate.getDate();
        
        const calcYear = calculationDate.getFullYear();
        const calcMonth = calculationDate.getMonth();
        const calcDay = calculationDate.getDate();
        
        let years = calcYear - birthYear;
        let months = calcMonth - birthMonth;
        let days = calcDay - birthDay;
        
        // Adjust for negative days
        if (days < 0) {
            // Get the last day of the previous month
            const lastDayOfPrevMonth = new Date(calcYear, calcMonth, 0).getDate();
            days += lastDayOfPrevMonth;
            months--;
        }
        
        // Adjust for negative months
        if (months < 0) {
            months += 12;
            years--;
        }
        
        return {
            years: years,
            months: months,
            days: days
        };
    }
    
    /**
     * Format age as a string
     * @param {Object} age - Age object with years, months, and days
     * @returns {String} Formatted age string
     */
    function formatAge(age) {
        let result = '';
        
        if (age.years > 0) {
            result += `${age.years} year${age.years !== 1 ? 's' : ''}`;
        }
        
        if (age.months > 0) {
            result += `${result ? ', ' : ''}${age.months} month${age.months !== 1 ? 's' : ''}`;
        }
        
        if (age.days > 0 || (age.years === 0 && age.months === 0)) {
            result += `${result ? ', ' : ''}${age.days} day${age.days !== 1 ? 's' : ''}`;
        }
        
        return result;
    }
    
    /**
     * Generate age description
     * @param {Object} age - Age object with years, months, and days
     * @param {Date} birthDate - Date of birth
     * @param {Date} calculationDate - Date to calculate age as of
     * @returns {String} Age description
     */
    function generateAgeDescription(age, birthDate, calculationDate) {
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
        
        return `Born on ${formattedBirthDate}, as of ${formattedCalcDate}, you are ${formatAge(age)} old.`;
    }
    
    /**
     * Handle form submission
     * @param {Event} e - Form submission event
     */
    function handleFormSubmit(e) {
        e.preventDefault();
        
        // Get input values
        const birthDate = new Date(birthDateInput.value);
        const calculationDate = calculationDateInput.value ? new Date(calculationDateInput.value) : new Date();
        
        // Validate dates
        if (birthDate > calculationDate) {
            alert('Birth date cannot be in the future of the calculation date.');
            return;
        }
        
        // Calculate age
        const age = calculateAge(birthDate, calculationDate);
        
        // Display result
        ageValue.textContent = formatAge(age);
        ageDescription.textContent = generateAgeDescription(age, birthDate, calculationDate);
        ageResult.style.display = 'block';
    }
    
    // Set today as the max date for birth date and default for calculation date
    const today = new Date().toISOString().split('T')[0];
    birthDateInput.max = today;
    calculationDateInput.max = today;
    calculationDateInput.value = today; // Set today as the default calculation date
    
    // Add event listener to form
    if (ageCalculatorForm) {
        ageCalculatorForm.addEventListener('submit', handleFormSubmit);
    }
});
