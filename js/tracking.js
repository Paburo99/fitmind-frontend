import { makeApiRequest } from './apiService.js'; // If using modules
import { displayMessage } from './utils.js'; // If using modules

document.addEventListener('DOMContentLoaded', () => {
    // Set default date to today for all date inputs
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('workout_date').value = today;
    document.getElementById('nutrition_date').value = today;
    document.getElementById('weight_date').value = today;
    document.getElementById('water_date').value = today;


    // Workout Log
    const workoutLogForm = document.getElementById('workoutLogForm');
    const addExerciseButton = document.getElementById('addExerciseButton');
    const exerciseEntriesContainer = document.getElementById('exerciseEntries');
    const exerciseEntryTemplate = document.getElementById('exerciseEntryTemplate');

    addExerciseButton.addEventListener('click', () => {
        const templateContent = exerciseEntryTemplate.content.cloneNode(true);
        const removeButton = templateContent.querySelector('.removeExerciseButton');
        removeButton.addEventListener('click', (e) => e.target.closest('div').remove());
        exerciseEntriesContainer.appendChild(templateContent);
    });

    workoutLogForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(workoutLogForm);
        const workoutData = {
            exercises: []
        };

        // Collect main workout data
        workoutData.date = formData.get('date');
        workoutData.type = formData.get('type');
        workoutData.duration_minutes = parseInt(formData.get('duration_minutes'));
        workoutData.calories_burned = formData.get('calories_burned') ? parseInt(formData.get('calories_burned')) : null;
        workoutData.notes = formData.get('notes') ? formData.get('notes') : null;

        // Collect dynamic exercise entries
        const exerciseNameInputs = workoutLogForm.querySelectorAll('input[name="exercise_name[]"]');
        exerciseNameInputs.forEach((nameInput, index) => {
            const entryDiv = nameInput.closest('div');
            const exercise = {
                exercise_name: nameInput.value,
                sets: entryDiv.querySelector('input[name="sets[]"]').value ? parseInt(entryDiv.querySelector('input[name="sets[]"]').value) : null,
                reps: entryDiv.querySelector('input[name="reps[]"]').value ? parseInt(entryDiv.querySelector('input[name="reps[]"]').value) : null,
                weight_kg: entryDiv.querySelector('input[name="weight_kg[]"]').value ? parseFloat(entryDiv.querySelector('input[name="weight_kg[]"]').value) : null,
                distance_km: entryDiv.querySelector('input[name="distance_km[]"]').value ? parseFloat(entryDiv.querySelector('input[name="distance_km[]"]').value) : null,
                time_seconds: entryDiv.querySelector('input[name="time_seconds[]"]').value ? parseInt(entryDiv.querySelector('input[name="time_seconds[]"]').value) : null,
            };
            // Only add if exercise_name is present
            if(exercise.exercise_name && exercise.exercise_name.trim() !== "") {
                 workoutData.exercises.push(exercise);
            }
        });
        
        if (!workoutData.type || !workoutData.duration_minutes) {
            displayMessage('trackingMessage', 'Workout type and duration are required.', true);
            return;
        }

        try {
            const response = await makeApiRequest('/log/workout', 'POST', workoutData);
            displayMessage('trackingMessage', `Workout logged successfully! Log ID: ${response.log_id}`, false);
            workoutLogForm.reset();
            exerciseEntriesContainer.innerHTML = ''; // Clear dynamic exercises
            document.getElementById('workout_date').value = today; // Reset date
        } catch (error) {
            displayMessage('trackingMessage', `Error logging workout: ${error.message}`, true);
        }
    });

    // Nutrition Log
    const nutritionLogForm = document.getElementById('nutritionLogForm');
    nutritionLogForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(nutritionLogForm);
        const nutritionData = {};
        for (let [key, value] of formData.entries()) {
            if (['calories', 'protein_g', 'carbs_g', 'fat_g'].includes(key)) {
                nutritionData[key] = value ? parseFloat(value) : null;
            } else {
                nutritionData[key] = value;
            }
        }
        if (!nutritionData.meal_type || !nutritionData.food_item_description || nutritionData.calories == null) {
             displayMessage('trackingMessage', 'Meal type, description, and calories are required for nutrition log.', true);
            return;
        }
        try {
            const response = await makeApiRequest('/log/nutrition', 'POST', nutritionData);
            displayMessage('trackingMessage', `Nutrition logged successfully! Log ID: ${response.log_id}`, false);
            nutritionLogForm.reset();
            document.getElementById('nutrition_date').value = today; // Reset date
        } catch (error) {
            displayMessage('trackingMessage', `Error logging nutrition: ${error.message}`, true);
        }
    });

    // Weight Log
    const weightLogForm = document.getElementById('weightLogForm');
    weightLogForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const weightData = {
            date: weightLogForm.date.value,
            weight_kg: parseFloat(weightLogForm.weight_kg.value)
        };
        if (!weightData.weight_kg) {
            displayMessage('trackingMessage', 'Weight is required.', true);
            return;
        }
        try {
            const response = await makeApiRequest('/log/weight', 'POST', weightData);
            displayMessage('trackingMessage', `Weight logged successfully! Log ID: ${response.log_id}`, false);
            weightLogForm.reset();
            document.getElementById('weight_date').value = today; // Reset date
        } catch (error) {
            displayMessage('trackingMessage', `Error logging weight: ${error.message}`, true);
        }
    });

    // Water Log
    const waterLogForm = document.getElementById('waterLogForm');
    waterLogForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const waterData = {
            date: waterLogForm.date.value,
            amount_ml: parseInt(waterLogForm.amount_ml.value)
        };
         if (!waterData.amount_ml) {
            displayMessage('trackingMessage', 'Water amount is required.', true);
            return;
        }
        try {
            const response = await makeApiRequest('/log/water', 'POST', waterData);
            displayMessage('trackingMessage', `Water intake logged successfully! Log ID: ${response.log_id}`, false);
            waterLogForm.reset();
            document.getElementById('water_date').value = today; // Reset date
        } catch (error) {
            displayMessage('trackingMessage', `Error logging water: ${error.message}`, true);
        }
    });

});