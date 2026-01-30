document.addEventListener('DOMContentLoaded', () => {
    const behaviorContainer = document.getElementById('behavior-list');
    const ratingDisplay = document.getElementById('rating-display');

    // 1. BUILD THE UI
    // We loop through the behaviors in your config.js to create the HTML elements
    AppConfig.behaviors.forEach((behaviorName, index) => {
        
        // Create a wrapper div
        const wrapper = document.createElement('div');
        wrapper.className = 'behavior-item';

        // Create the Label (Behavior Name)
        const label = document.createElement('label');
        label.innerText = behaviorName;
        label.setAttribute('for', `select-${index}`);

        // Create the Dropdown (Select)
        const select = document.createElement('select');
        select.id = `select-${index}`;
        select.classList.add('punishment-selector'); // For easy grabbing later

        // Add options to the dropdown based on config.js
        AppConfig.punishments.forEach(punishment => {
            const option = document.createElement('option');
            option.value = punishment.id; // We store the ID (e.g., 'detention')
            option.textContent = punishment.text;
            select.appendChild(option);
        });

        // Append to DOM
        wrapper.appendChild(label);
        wrapper.appendChild(select);
        behaviorContainer.appendChild(wrapper);

        // Add 'change' listener to update score instantly
        select.addEventListener('change', calculateHarshness);
    });

    // 2. CALCULATION LOGIC
    function calculateHarshness() {
        let totalScore = 0;
        
        // Get all dropdowns
        const allSelects = document.querySelectorAll('.punishment-selector');

        allSelects.forEach(select => {
            const selectedId = select.value;
            
            // Find the punishment object in Config that matches this ID
            const punishmentData = AppConfig.punishments.find(p => p.id === selectedId);
            
            if (punishmentData) {
                totalScore += punishmentData.score;
            }
        });

        // Update the display
        ratingDisplay.innerText = totalScore;
    }
});
