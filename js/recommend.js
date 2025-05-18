import { makeApiRequest } from './apiService.js'; // If using modules
import { displayMessage } from './utils.js'; // If using modules

document.addEventListener('DOMContentLoaded', () => {
    const getWorkoutRecButton = document.getElementById('getWorkoutRecButton');
    const workoutRecommendationDiv = document.getElementById('workoutRecommendation');
    const getMealRecButton = document.getElementById('getMealRecButton');
    const mealRecommendationDiv = document.getElementById('mealRecommendation');
    const mealTypeSelect = document.getElementById('mealTypeSelect');

    if (getWorkoutRecButton) {
        getWorkoutRecButton.addEventListener('click', async () => {
            workoutRecommendationDiv.textContent = 'Fetching workout idea...';
            try {
                const data = await makeApiRequest('/recommend/workout', 'GET');
                workoutRecommendationDiv.textContent = data.recommendation || 'No recommendation received.';
            } catch (error) {
                workoutRecommendationDiv.textContent = `Error: ${error.message}`;
                displayMessage('recommendationMessage', `Error fetching workout: ${error.message}`, true);
            }
        });
    }

    if (getMealRecButton) {
        getMealRecButton.addEventListener('click', async () => {
            const mealType = mealTypeSelect.value;
            mealRecommendationDiv.textContent = `Fetching ${mealType} idea...`;
            try {
                const data = await makeApiRequest(`/recommend/meal?type=${mealType}`, 'GET');
                mealRecommendationDiv.textContent = data.recommendation || 'No recommendation received.';
            } catch (error) {
                mealRecommendationDiv.textContent = `Error: ${error.message}`;
                 displayMessage('recommendationMessage', `Error fetching meal: ${error.message}`, true);
            }
        });
    }
});
