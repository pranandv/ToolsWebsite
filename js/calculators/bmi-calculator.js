document.addEventListener('DOMContentLoaded', function() {
    const bmiCalculatorForm = document.getElementById('bmi-calculator-form');
    const unitRadios = document.querySelectorAll('input[name="unit"]');
    const metricInputs = document.getElementById('metric-inputs');
    const imperialInputs = document.getElementById('imperial-inputs');
    const weightKgInput = document.getElementById('weight-kg');
    const heightCmInput = document.getElementById('height-cm');
    const weightLbInput = document.getElementById('weight-lb');
    const heightFtInput = document.getElementById('height-ft');
    const heightInInput = document.getElementById('height-in');
    const bmiResult = document.getElementById('bmi-result');
    const bmiValue = document.getElementById('bmi-value');
    const bmiCategory = document.getElementById('bmi-category');
    
    /**
     * Calculate BMI using metric units
     * @param {Number} weightKg - Weight in kilograms
     * @param {Number} heightCm - Height in centimeters
     * @returns {Number} BMI value
     */
    function calculateMetricBMI(weightKg, heightCm) {
        // BMI = weight(kg) / height(m)²
        const heightM = heightCm / 100;
        return weightKg / (heightM * heightM);
    }
    
    /**
     * Calculate BMI using imperial units
     * @param {Number} weightLb - Weight in pounds
     * @param {Number} heightIn - Height in total inches
     * @returns {Number} BMI value
     */
    function calculateImperialBMI(weightLb, heightIn) {
        // BMI = (weight(lb) * 703) / height(in)²
        return (weightLb * 703) / (heightIn * heightIn);
    }
    
    /**
     * Get BMI category based on BMI value
     * @param {Number} bmi - BMI value
     * @param {Number} age - Age in years
     * @param {String} gender - 'male' or 'female'
     * @returns {Object} BMI category information
     */
    function getBMICategory(bmi, age, gender) {
        let category, description;
        
        // Standard BMI categories
        if (bmi < 18.5) {
            category = 'Underweight';
            description = 'You are underweight for your height. Consider consulting with a healthcare provider.';
        } else if (bmi >= 18.5 && bmi < 25) {
            category = 'Normal Weight';
            description = 'You have a healthy weight for your height. Maintain a balanced diet and regular exercise.';
        } else if (bmi >= 25 && bmi < 30) {
            category = 'Overweight';
            description = 'You are overweight for your height. Consider a balanced diet and increased physical activity.';
        } else if (bmi >= 30 && bmi < 35) {
            category = 'Obesity (Class 1)';
            description = 'You have Class 1 obesity. Consider consulting with a healthcare provider for weight management advice.';
        } else if (bmi >= 35 && bmi < 40) {
            category = 'Obesity (Class 2)';
            description = 'You have Class 2 obesity. Consulting with a healthcare provider is recommended.';
        } else {
            category = 'Obesity (Class 3)';
            description = 'You have Class 3 obesity. Consulting with a healthcare provider is strongly recommended.';
        }
        
        // Special considerations for children and elderly
        if (age < 18) {
            description += ' Note: BMI calculations for individuals under 18 may not be accurate. Consult with a pediatrician.';
        } else if (age > 65) {
            description += ' Note: For individuals over 65, BMI ranges may be slightly different. Consult with your healthcare provider.';
        }
        
        return { category, description };
    }
    
    /**
     * Toggle between metric and imperial inputs
     */
    function toggleUnitSystem() {
        unitRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.value === 'metric') {
                    metricInputs.style.display = 'block';
                    imperialInputs.style.display = 'none';
                    
                    // Convert imperial to metric if values exist
                    if (weightLbInput.value && heightFtInput.value) {
                        const weightLb = parseFloat(weightLbInput.value);
                        const heightFt = parseInt(heightFtInput.value) || 0;
                        const heightIn = parseInt(heightInInput.value) || 0;
                        
                        // Convert lb to kg
                        if (weightLb) {
                            weightKgInput.value = (weightLb * 0.453592).toFixed(1);
                        }
                        
                        // Convert ft/in to cm
                        if (heightFt || heightIn) {
                            const totalInches = (heightFt * 12) + heightIn;
                            heightCmInput.value = Math.round(totalInches * 2.54);
                        }
                    }
                } else {
                    metricInputs.style.display = 'none';
                    imperialInputs.style.display = 'block';
                    
                    // Convert metric to imperial if values exist
                    if (weightKgInput.value && heightCmInput.value) {
                        const weightKg = parseFloat(weightKgInput.value);
                        const heightCm = parseInt(heightCmInput.value);
                        
                        // Convert kg to lb
                        if (weightKg) {
                            weightLbInput.value = (weightKg * 2.20462).toFixed(1);
                        }
                        
                        // Convert cm to ft/in
                        if (heightCm) {
                            const totalInches = heightCm / 2.54;
                            heightFtInput.value = Math.floor(totalInches / 12);
                            heightInInput.value = Math.round(totalInches % 12);
                        }
                    }
                }
            });
        });
    }
    
    /**
     * Handle form submission
     * @param {Event} e - Form submission event
     */
    function handleFormSubmit(e) {
        e.preventDefault();
        
        let bmi;
        const unitSystem = document.querySelector('input[name="unit"]:checked').value;
        const age = parseInt(document.getElementById('age').value);
        const gender = document.querySelector('input[name="gender"]:checked').value;
        
        if (unitSystem === 'metric') {
            // Calculate using metric units
            const weightKg = parseFloat(weightKgInput.value);
            const heightCm = parseInt(heightCmInput.value);
            bmi = calculateMetricBMI(weightKg, heightCm);
        } else {
            // Calculate using imperial units
            const weightLb = parseFloat(weightLbInput.value);
            const heightFt = parseInt(heightFtInput.value) || 0;
            const heightIn = parseInt(heightInInput.value) || 0;
            const totalInches = (heightFt * 12) + heightIn;
            bmi = calculateImperialBMI(weightLb, totalInches);
        }
        
        // Get BMI category
        const { category, description } = getBMICategory(bmi, age, gender);
        
        // Display result
        bmiValue.textContent = bmi.toFixed(1);
        bmiCategory.innerHTML = `<strong>${category}</strong>: ${description}`;
        bmiResult.style.display = 'block';
    }
    
    // Initialize unit toggle
    toggleUnitSystem();
    
    // Add event listener to form
    if (bmiCalculatorForm) {
        bmiCalculatorForm.addEventListener('submit', handleFormSubmit);
    }
});
