document.addEventListener('DOMContentLoaded', function() {
    const retirementCalculatorForm = document.getElementById('retirement-calculator-form');
    const currentAgeInput = document.getElementById('current-age');
    const currentSavingsInput = document.getElementById('current-savings');
    const monthlyContributionInput = document.getElementById('monthly-contribution');
    const annualReturnInput = document.getElementById('annual-return');
    const retirementGoalInput = document.getElementById('retirement-goal');
    const retirementResult = document.getElementById('retirement-result');
    const retirementValue = document.getElementById('retirement-value');
    const retirementDescription = document.getElementById('retirement-description');
    
    /**
     * Calculate retirement age
     * @param {Number} currentAge - Current age
     * @param {Number} currentSavings - Current retirement savings
     * @param {Number} monthlyContribution - Monthly contribution
     * @param {Number} annualReturn - Expected annual return percentage
     * @param {Number} retirementGoal - Retirement savings goal
     * @returns {Object} Retirement projection
     */
    function calculateRetirement(currentAge, currentSavings, monthlyContribution, annualReturn, retirementGoal) {
        // Convert annual return to monthly
        const monthlyReturn = annualReturn / 100 / 12;
        
        let age = currentAge;
        let savings = currentSavings;
        let years = 0;
        let months = 0;
        
        // Calculate how long it will take to reach the goal
        while (savings < retirementGoal && age < 100) {
            // Add monthly contribution
            savings += monthlyContribution;
            
            // Apply monthly return
            savings *= (1 + monthlyReturn);
            
            // Increment month counter
            months++;
            
            // Convert months to years
            if (months === 12) {
                years++;
                months = 0;
                age++;
            }
        }
        
        const retirementAge = currentAge + years + (months / 12);
        const totalContributions = currentSavings + (monthlyContribution * (years * 12 + months));
        const interestEarned = savings - totalContributions;
        
        return {
            retirementAge: retirementAge,
            yearsToRetirement: years + (months / 12),
            finalSavings: savings,
            totalContributions: totalContributions,
            interestEarned: interestEarned,
            goalReached: savings >= retirementGoal
        };
    }
    
    /**
     * Format currency
     * @param {Number} amount - Amount to format
     * @returns {String} Formatted currency string
     */
    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }
    
    /**
     * Generate retirement description
     * @param {Object} projection - Retirement projection
     * @param {Number} currentAge - Current age
     * @returns {String} Retirement description
     */
    function generateRetirementDescription(projection, currentAge) {
        if (!projection.goalReached) {
            return `Based on your inputs, you won't reach your retirement goal by age 100. Consider increasing your monthly contributions or adjusting your retirement goal.`;
        }
        
        const yearsToRetirement = Math.floor(projection.yearsToRetirement);
        const monthsToRetirement = Math.round((projection.yearsToRetirement - yearsToRetirement) * 12);
        
        let timeToRetirement = '';
        if (yearsToRetirement > 0) {
            timeToRetirement += `${yearsToRetirement} year${yearsToRetirement !== 1 ? 's' : ''}`;
        }
        if (monthsToRetirement > 0) {
            timeToRetirement += `${timeToRetirement ? ' and ' : ''}${monthsToRetirement} month${monthsToRetirement !== 1 ? 's' : ''}`;
        }
        
        return `
            Starting with ${formatCurrency(currentSavingsInput.value)} and contributing ${formatCurrency(monthlyContributionInput.value)} monthly, 
            you'll reach your retirement goal of ${formatCurrency(retirementGoalInput.value)} in ${timeToRetirement}. 
            Your total contributions will be ${formatCurrency(projection.totalContributions)}, 
            with ${formatCurrency(projection.interestEarned)} earned from investment returns.
        `;
    }
    
    /**
     * Handle form submission
     * @param {Event} e - Form submission event
     */
    function handleFormSubmit(e) {
        e.preventDefault();
        
        // Get input values
        const currentAge = parseFloat(currentAgeInput.value);
        const currentSavings = parseFloat(currentSavingsInput.value);
        const monthlyContribution = parseFloat(monthlyContributionInput.value);
        const annualReturn = parseFloat(annualReturnInput.value);
        const retirementGoal = parseFloat(retirementGoalInput.value);
        
        // Calculate retirement
        const projection = calculateRetirement(
            currentAge,
            currentSavings,
            monthlyContribution,
            annualReturn,
            retirementGoal
        );
        
        // Display result
        if (projection.goalReached) {
            retirementValue.textContent = `Age ${projection.retirementAge.toFixed(1)}`;
        } else {
            retirementValue.textContent = 'Goal Not Reached';
        }
        
        retirementDescription.textContent = generateRetirementDescription(projection, currentAge);
        retirementResult.style.display = 'block';
    }
    
    // Add event listener to form
    if (retirementCalculatorForm) {
        retirementCalculatorForm.addEventListener('submit', handleFormSubmit);
    }
});
