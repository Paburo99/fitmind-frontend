import { makeApiRequest } from './apiService.js'; // If using modules
import { displayMessage } from './utils.js'; // If using modules

document.addEventListener('DOMContentLoaded', async () => {
    const dashboardSummaryEl = document.getElementById('dashboardSummary');
    const dashboardMessageEl = document.getElementById('dashboardMessage');

    try {
        const summary = await makeApiRequest('/dashboard/summary', 'GET');
        if (summary) {
            dashboardSummaryEl.innerHTML = `
                <h2>Today's Overview (${new Date().toLocaleDateString()}):</h2>
                <p><strong>Calories Consumed:</strong> ${summary.calories_today || 0} kcal</p>
                <p><strong>Protein Intake:</strong> ${summary.protein_today || 0} g</p>
                <p><strong>Workouts Logged:</strong> ${summary.workouts_today_count || 0}</p>
                <p><strong>Current Weight:</strong> ${summary.current_weight_kg ? summary.current_weight_kg + ' kg' : 'Not logged recently'}</p>
                <p><strong>Water Intake:</strong> ${summary.water_intake_today_ml || 0} ml</p>
            `;
        } else {
            dashboardSummaryEl.innerHTML = "<p>Could not load summary data.</p>";
        }
    } catch (error) {
        console.error('Error loading dashboard summary:', error);
        dashboardSummaryEl.innerHTML = `<p class="error-message">Error loading summary: ${error.message}</p>`;
        displayMessage('dashboardMessage', `Failed to load dashboard: ${error.message}`, true);
    }
});