document.addEventListener('DOMContentLoaded', function() {
    const emiCalculatorForm = document.getElementById('emi-calculator-form');
    const loanAmountInput = document.getElementById('loan-amount');
    const interestRateInput = document.getElementById('interest-rate');
    const loanTenureInput = document.getElementById('loan-tenure');
    const tenureTypeSelect = document.getElementById('tenure-type');
    const emiResult = document.getElementById('emi-result');
    const emiValue = document.getElementById('emi-value');
    const emiLoanAmount = document.getElementById('emi-loan-amount');
    const emiTotalInterest = document.getElementById('emi-total-interest');
    const emiTotalAmount = document.getElementById('emi-total-amount');
    
    /**
     * Calculate EMI (Equated Monthly Installment)
     * @param {Number} principal - Loan amount
     * @param {Number} interestRate - Annual interest rate in percentage
     * @param {Number} tenureMonths - Loan tenure in months
     * @returns {Object} EMI calculation results
     */
    function calculateEMI(principal, interestRate, tenureMonths) {
        // Convert annual interest rate to monthly rate
        const monthlyInterestRate = interestRate / 12 / 100;
        
        // Calculate EMI using formula: P * r * (1+r)^n / ((1+r)^n - 1)
        const emi = principal * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, tenureMonths) / 
                    (Math.pow(1 + monthlyInterestRate, tenureMonths) - 1);
        
        // Calculate total amount and interest
        const totalAmount = emi * tenureMonths;
        const totalInterest = totalAmount - principal;
        
        return {
            emi: emi,
            totalAmount: totalAmount,
            totalInterest: totalInterest
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
     * Handle tenure type change
     */
    function handleTenureTypeChange() {
        tenureTypeSelect.addEventListener('change', function() {
            if (this.value === 'years' && loanTenureInput.value) {
                // Convert from years to months
                const yearsValue = parseInt(loanTenureInput.value);
                if (!isNaN(yearsValue)) {
                    loanTenureInput.placeholder = 'Ex: 5 for 5 years';
                    loanTenureInput.max = 30; // Max 30 years
                }
            } else if (this.value === 'months' && loanTenureInput.value) {
                // Convert from months to years
                const monthsValue = parseInt(loanTenureInput.value);
                if (!isNaN(monthsValue)) {
                    loanTenureInput.placeholder = 'Ex: 60 for 5 years';
                    loanTenureInput.max = 360; // Max 30 years in months
                }
            }
        });
    }
    
    /**
     * Handle form submission
     * @param {Event} e - Form submission event
     */
    function handleFormSubmit(e) {
        e.preventDefault();
        
        // Get input values
        const loanAmount = parseFloat(loanAmountInput.value);
        const interestRate = parseFloat(interestRateInput.value);
        let loanTenure = parseInt(loanTenureInput.value);
        const tenureType = tenureTypeSelect.value;
        
        // Convert tenure to months if needed
        if (tenureType === 'years') {
            loanTenure = loanTenure * 12;
        }
        
        // Calculate EMI
        const result = calculateEMI(loanAmount, interestRate, loanTenure);
        
        // Display result
        emiValue.textContent = formatCurrency(result.emi);
        emiLoanAmount.textContent = formatCurrency(loanAmount);
        emiTotalInterest.textContent = formatCurrency(result.totalInterest);
        emiTotalAmount.textContent = formatCurrency(result.totalAmount);
        
        emiResult.style.display = 'block';
    }
    
    // Initialize tenure type handler
    handleTenureTypeChange();
    
    // Add event listener to form
    if (emiCalculatorForm) {
        emiCalculatorForm.addEventListener('submit', handleFormSubmit);
    }
});
