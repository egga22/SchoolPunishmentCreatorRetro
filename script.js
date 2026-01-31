document.addEventListener('DOMContentLoaded', () => {
    const behaviorContainer = document.getElementById('behavior-list');
    const ratingDisplay = document.getElementById('rating-display');

    // 1. INITIALIZE UI
    AppConfig.behaviors.forEach((behaviorName, index) => {
        const itemHTML = createBehaviorItemHTML(behaviorName, index);
        behaviorContainer.insertAdjacentHTML('beforeend', itemHTML);
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
                    <option value="simple_lunch">Simple Lunch Detention (Legacy)</option>
                    <option value="custom_homework">📝 Extra Homework (Custom)</option>
                    <option value="custom_detention">🔒 Detention (Custom)</option>
                </select>
            </div>

            <div class="settings-panel panel-homework" id="panel-homework-${id}">
                <div class="control-group">
                    <label>⏱ Minutes per unit: <span id="hw-val-${id}">30</span> mins</label>
                    <input type="range" class="hw-slider" min="5" max="180" step="5" value="30" 
                        oninput="document.getElementById('hw-val-${id}').innerText = this.value">
                </div>
                <div class="control-group">
                    <label>🧮 Variables (scale the minutes)</label>
                    <div class="variable-controls">
                        <label>
                            Multiplier: <span id="hw-mult-val-${id}">1.00</span>
                            <input type="number" class="hw-var-multiplier" min="0" step="0.05" value="1"
                                oninput="document.getElementById('hw-mult-val-${id}').innerText = Number(this.value || 0).toFixed(2)">
                        </label>
                        <label>
                            Variable value: <span id="hw-var-val-${id}">1</span>
                            <input type="number" class="hw-var-value" min="0" step="1" value="1"
                                oninput="document.getElementById('hw-var-val-${id}').innerText = this.value || 0">
                        </label>
                    </div>
                    <small>Example: set multiplier to 1.25 and variable value to missed minutes.</small>
                </div>
            </div>

            <div class="settings-panel panel-detention" id="panel-detention-${id}">
                
                <div class="control-group">
                    <label>📍 Type (Mix & Match):</label>
                    <div class="checkbox-group">
                        <label><input type="checkbox" class="det-type" value="lunch"> Lunch</label>
                        <label><input type="checkbox" class="det-type" value="after"> After School</label>
                        <label><input type="checkbox" class="det-type" value="saturday"> Saturday</label>
                    </div>
                </div>

                <div class="control-group">
                    <label>⏳ Duration per session: <span id="dur-val-${id}">1.0</span> hours</label>
                    <input type="range" class="det-duration" min="0.5" max="5.0" step="0.5" value="1.0"
                        oninput="document.getElementById('dur-val-${id}').innerText = this.value">
                </div>

                <div class="control-group">
                    <label>🧮 Variables (scale the hours)</label>
                    <div class="variable-controls">
                        <label>
                            Multiplier: <span id="det-mult-val-${id}">1.00</span>
                            <input type="number" class="det-var-multiplier" min="0" step="0.05" value="1"
                                oninput="document.getElementById('det-mult-val-${id}').innerText = Number(this.value || 0).toFixed(2)">
                        </label>
                        <label>
                            Variable value: <span id="det-var-val-${id}">1</span>
                            <input type="number" class="det-var-value" min="0" step="1" value="1"
                                oninput="document.getElementById('det-var-val-${id}').innerText = this.value || 0">
                        </label>
                    </div>
                    <small>Scale the session length based on the situation.</small>
                </div>

                <div class="control-group">
                    <label>🔁 Recurring? (Days in a row): <span id="rec-val-${id}">1</span> day(s)</label>
                    <input type="range" class="det-recurring" min="1" max="10" step="1" value="1"
                        oninput="document.getElementById('rec-val-${id}').innerText = this.value">
                </div>

                <div class="control-group">
                    <label style="color: #c0392b;">
                        <input type="checkbox" class="det-friday"> Force on Friday
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
                const variableMultiplierRaw = parseFloat(row.querySelector('.hw-var-multiplier').value);
                const variableValueRaw = parseFloat(row.querySelector('.hw-var-value').value);
                const variableMultiplier = Number.isNaN(variableMultiplierRaw) ? 1 : variableMultiplierRaw;
                const variableValue = Number.isNaN(variableValueRaw) ? 1 : variableValueRaw;
                const scaledMinutes = minutesPerUnit * variableMultiplier * variableValue;
                totalScore += (scaledMinutes * AppConfig.math.homework.pointsPerMinute);
            } 
            else if (selection === 'custom_detention') {
                // 1. Base Duration & Recurrence
                const baseDuration = parseFloat(row.querySelector('.det-duration').value);
                const variableMultiplierRaw = parseFloat(row.querySelector('.det-var-multiplier').value);
                const variableValueRaw = parseFloat(row.querySelector('.det-var-value').value);
                const variableMultiplier = Number.isNaN(variableMultiplierRaw) ? 1 : variableMultiplierRaw;
                const variableValue = Number.isNaN(variableValueRaw) ? 1 : variableValueRaw;
                const duration = baseDuration * variableMultiplier * variableValue;
                const recurringDays = parseInt(row.querySelector('.det-recurring').value);
                let rowScore = 0;

                // 2. Types Multipliers
                const types = row.querySelectorAll('.det-type:checked');
                let typeMultiplier = 0;
                
                if (types.length === 0) {
                    // If they selected Custom Detention but checked NO boxes, 
                    // we assume standard after school (multiplier 1) or 0? 
                    // Let's assume standard 1.0 to prevent confusion
                    typeMultiplier = 1; 
                } else {
                    types.forEach(chk => {
                        if (chk.value === 'lunch') typeMultiplier += AppConfig.math.detention.lunchMultiplier;
                        if (chk.value === 'after') typeMultiplier += 1.0; // Standard
                        if (chk.value === 'saturday') typeMultiplier += AppConfig.math.detention.saturdayMultiplier;
                    });
                    // Average the multipliers? Or Sum them? 
                    // User said "Mix and Match", implies doing BOTH. So we Sum.
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
