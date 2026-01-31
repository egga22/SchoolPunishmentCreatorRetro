document.addEventListener('DOMContentLoaded', () => {
    const behaviorContainer = document.getElementById('behavior-list');
    const ratingDisplay = document.getElementById('rating-display');

    // 1. INITIALIZE UI
    AppConfig.behaviors.forEach((behaviorName, index) => {
        const itemHTML = createBehaviorItemHTML(behaviorName, index);
        behaviorContainer.insertAdjacentHTML('beforeend', itemHTML);
        const row = document.getElementById(`row-${index}`);
        initializeDetentionRow(row);
    });

    // 2. ATTACH EVENTS
    // We attach one big listener to the container (Event Delegation) for performance
    behaviorContainer.addEventListener('input', (e) => {
        const target = e.target;
        
        // If the main dropdown changed, toggle the visibility of the settings panel
        if (target.classList.contains('main-selector')) {
            const rowId = target.dataset.id;
            updatePanelVisibility(rowId, target.value);
        }

        if (target.classList.contains('det-type')) {
            const row = target.closest('.behavior-item');
            initializeDetentionRow(row);
        }

        if (target.classList.contains('det-duration')) {
            const row = target.closest('.behavior-item');
            updateDurationLabel(row);
        }

        // Whenever ANY input changes, recalculate the total score
        calculateTotalHarshness();
    });

    // ---------------------------------------------------------
    // HELPER FUNCTIONS
    // ---------------------------------------------------------

    function createBehaviorItemHTML(name, id) {
        return `
        <div class="behavior-item" id="row-${id}">
            <div class="behavior-header">
                <label>${name}</label>
                <select class="main-selector" data-id="${id}">
                    <option value="none">No Punishment</option>
                    <option value="simple_lunch">Lunch Detention</option>
                    <option value="custom_homework">Extra Homework</option>
                    <option value="custom_detention">Detention</option>
                </select>
            </div>

            <div class="settings-panel panel-homework" id="panel-homework-${id}">
                <div class="control-group">
                    <label>Minutes per unit: <span id="hw-val-${id}">30</span></label>
                    <input type="range" class="hw-slider" min="5" max="180" step="5" value="30" 
                        oninput="document.getElementById('hw-val-${id}').innerText = this.value">
                </div>
                <div class="control-group">
                    <label>Equation</label>
                    <input type="text" class="hw-equation" value="base" placeholder="e.g. base * a * b">
                </div>
                <div class="control-group">
                    <label>Variables</label>
                    <input type="text" class="hw-variables" value="a=1, b=1" placeholder="a=2, b=3">
                </div>
            </div>

            <div class="settings-panel panel-detention" id="panel-detention-${id}">
                
                <div class="control-group">
                    <label>Type</label>
                    <select class="det-type">
                        <option value="after">After School</option>
                        <option value="lunch">Lunch</option>
                        <option value="saturday">Saturday</option>
                    </select>
                </div>

                <div class="control-group">
                    <label>Duration: <span id="dur-val-${id}">1.0</span></label>
                    <input type="range" class="det-duration" min="0.5" max="5.0" step="0.5" value="1.0">
                </div>

                <div class="control-group">
                    <label>Equation</label>
                    <input type="text" class="det-equation" value="base" placeholder="e.g. base * a * b">
                </div>
                <div class="control-group">
                    <label>Variables</label>
                    <input type="text" class="det-variables" value="a=1, b=1" placeholder="a=2, b=3">
                </div>

                <div class="control-group">
                    <label>Days: <span id="rec-val-${id}">1</span></label>
                    <input type="range" class="det-recurring" min="1" max="10" step="1" value="1"
                        oninput="document.getElementById('rec-val-${id}').innerText = this.value">
                </div>

                <div class="control-group">
                    <label class="friday-option" style="color: #c0392b;">
                        <input type="checkbox" class="det-friday"> Friday only
                    </label>
                </div>

            </div>
        </div>
        `;
    }

    function updatePanelVisibility(id, value) {
        const homeworkPanel = document.getElementById(`panel-homework-${id}`);
        const detentionPanel = document.getElementById(`panel-detention-${id}`);

        // Reset both
        homeworkPanel.classList.remove('active');
        detentionPanel.classList.remove('active');

        // Open specific panel if selected
        if (value === 'custom_homework') homeworkPanel.classList.add('active');
        if (value === 'custom_detention') detentionPanel.classList.add('active');
    }

    function parseVariables(raw) {
        if (!raw) return {};
        return raw.split(',').reduce((vars, entry) => {
            const [key, value] = entry.split('=').map(part => part && part.trim());
            if (!key) return vars;
            if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)) return vars;
            const parsedValue = parseFloat(value);
            vars[key] = Number.isNaN(parsedValue) ? 0 : parsedValue;
            return vars;
        }, {});
    }

    function evaluateExpression(expression, variables) {
        const sanitized = (expression || '').trim() || '1';
        if (!/^[0-9+\-*/().\s_a-zA-Z]*$/.test(sanitized)) {
            return 1;
        }
        const names = Object.keys(variables);
        const values = Object.values(variables);
        try {
            const fn = new Function(...names, `return (${sanitized});`);
            const result = fn(...values);
            return Number.isFinite(result) ? result : 1;
        } catch (error) {
            return 1;
        }
    }

    function updateDurationLabel(row) {
        const type = row.querySelector('.det-type').value;
        const durationInput = row.querySelector('.det-duration');
        const display = row.querySelector('[id^="dur-val-"]');
        const value = parseFloat(durationInput.value);
        if (type === 'lunch') {
            const minutes = Math.round(value * 60);
            display.innerText = `${minutes} min`;
        } else {
            display.innerText = `${value.toFixed(1)} hrs`;
        }
    }

    function initializeDetentionRow(row) {
        const typeSelect = row.querySelector('.det-type');
        const durationInput = row.querySelector('.det-duration');
        const fridayOption = row.querySelector('.det-friday');
        const fridayLabel = row.querySelector('.friday-option');

        if (typeSelect.value === 'lunch') {
            durationInput.min = '0.25';
            durationInput.max = '0.75';
            durationInput.step = '0.25';
            if (parseFloat(durationInput.value) > 0.75) {
                durationInput.value = '0.75';
            }
        } else {
            durationInput.min = '0.5';
            durationInput.max = '5.0';
            durationInput.step = '0.5';
            if (parseFloat(durationInput.value) < 0.5) {
                durationInput.value = '0.5';
            }
        }

        if (typeSelect.value === 'saturday') {
            fridayOption.checked = false;
            fridayOption.disabled = true;
            fridayLabel.classList.add('disabled');
        } else {
            fridayOption.disabled = false;
            fridayLabel.classList.remove('disabled');
        }

        updateDurationLabel(row);
    }

    function calculateTotalHarshness() {
        let totalScore = 0;
        const rows = document.querySelectorAll('.behavior-item');

        rows.forEach(row => {
            const selector = row.querySelector('.main-selector');
            const selection = selector.value;

            if (selection === 'simple_lunch') {
                totalScore += AppConfig.math.lunchDetention;
            } 
            else if (selection === 'custom_homework') {
                // Get slider value
                const minutesPerUnit = parseInt(row.querySelector('.hw-slider').value);
                const equation = row.querySelector('.hw-equation').value;
                const variables = parseVariables(row.querySelector('.hw-variables').value);
                variables.base = minutesPerUnit;
                const scaledMinutes = Math.max(0, evaluateExpression(equation, variables));
                totalScore += (scaledMinutes * AppConfig.math.homework.pointsPerMinute);
            } 
            else if (selection === 'custom_detention') {
                // 1. Base Duration & Recurrence
                const baseDuration = parseFloat(row.querySelector('.det-duration').value);
                const equation = row.querySelector('.det-equation').value;
                const variables = parseVariables(row.querySelector('.det-variables').value);
                variables.base = baseDuration;
                let duration = Math.max(0, evaluateExpression(equation, variables));
                const recurringDays = parseInt(row.querySelector('.det-recurring').value);
                let rowScore = 0;

                // 2. Type Multiplier
                const type = row.querySelector('.det-type').value;
                let typeMultiplier = 1;
                if (type === 'lunch') typeMultiplier = AppConfig.math.detention.lunchMultiplier;
                if (type === 'saturday') typeMultiplier = AppConfig.math.detention.saturdayMultiplier;

                if (type === 'lunch') {
                    duration = Math.min(duration, 0.75);
                }

                // 3. Calculate Base Score
                // (Hours * BaseRate * Multipliers) * Days
                rowScore = (duration * AppConfig.math.detention.basePerHour * typeMultiplier) * recurringDays;

                // 4. Friday Evil Bonus
                if (row.querySelector('.det-friday').checked) {
                    rowScore += AppConfig.math.detention.fridayBonus;
                }

                totalScore += rowScore;
            }
        });

        ratingDisplay.innerText = Math.round(totalScore);
    }
});
