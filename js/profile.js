import { makeApiRequest } from './apiService.js'; // If using modules
import { supabase } from './supabaseClient.js';  // If using modules
import { displayMessage } from './utils.js'; // If using modules

document.addEventListener('DOMContentLoaded', async () => {
    const profileForm = document.getElementById('profileForm');
    const profileTitle = document.getElementById('profileTitle');
    const profileMessage = document.getElementById('profileMessage');

    // Check if it's initial setup
    const urlParams = new URLSearchParams(window.location.search);
    const isSetup = urlParams.get('setup') === 'true';
    if (isSetup) {
        profileTitle.textContent = 'Complete Your Profile Setup';
    } else {
        profileTitle.textContent = 'Edit Your Profile';
    }

    // Load existing profile data if not setup mode
    if (!isSetup) {
        await loadProfileData();
    }


    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(profileForm);
        const profileData = {};
        for (let [key, value] of formData.entries()) {
            // Convert numbers where appropriate
            if (key === 'height_cm' || key === 'initial_weight_kg') {
                profileData[key] = parseFloat(value) || null;
            } else {
                profileData[key] = value;
            }
        }

        // Basic validation example (add more)
        if (!profileData.date_of_birth || !profileData.fitness_level || !profileData.primary_goal) {
            displayMessage('profileMessage', 'Please fill in all required fields.', true);
            return;
        }

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                displayMessage('profileMessage', 'You are not logged in.', true);
                window.location.href = '/index.html';
                return;
            }
            // Add user_id to profile data (Flask API will also get it from token, but good for consistency)
            // profileData.user_id = session.user.id; // Backend uses token for user_id

            // API call to Flask backend
            const response = await makeApiRequest('/profile', 'POST', profileData); // POST handles upsert in backend logic
            console.log('Profile saved:', response);
            displayMessage('profileMessage', 'Profile saved successfully!', false);
            if(isSetup) {
                // If it was setup, also log current weight to weight_tracker
                await makeApiRequest('/log/weight', 'POST', { weight_kg: profileData.initial_weight_kg, date: new Date().toISOString().split('T')[0] });
                console.log("Initial weight logged.");
            }
            // Optionally redirect or update UI
            setTimeout(() => {
                window.location.href = '/dashboard.html';
            }, 1500);

        } catch (error) {
            console.error('Error saving profile:', error);
            displayMessage('profileMessage', `Error: ${error.message}`, true);
        }
    });
});

async function loadProfileData() {
    try {
        const data = await makeApiRequest('/profile', 'GET');
        if (data) {
            document.getElementById('username').value = data.username || '';
            document.getElementById('date_of_birth').value = data.date_of_birth || '';
            document.getElementById('gender').value = data.gender || '';
            document.getElementById('height_cm').value = data.height_cm || '';
            // For profile edit, 'initial_weight_kg' might be better named 'current_weight_kg' on the form
            // Or, if profile holds initial_weight, fetch current weight from weight_tracker
            document.getElementById('initial_weight_kg').value = data.initial_weight_kg || ''; // This field might represent current weight for edit
            document.getElementById('fitness_level').value = data.fitness_level || '';
            document.getElementById('primary_goal').value = data.primary_goal || '';
            document.getElementById('dietary_preferences').value = data.dietary_preferences || '';
            document.getElementById('allergies_intolerances').value = data.allergies_intolerances || '';
            document.getElementById('activity_level').value = data.activity_level || '';
             document.getElementById('profileTitle').textContent = 'Edit Your Profile';
        } else {
            console.log("No existing profile data found. User might need to set up.");
            // This case should ideally be handled by the redirect in main.js if profile is missing
        }
    } catch (error) {
        console.error('Error loading profile data:', error);
        // If profile is not found (404), it might be initial setup.
        if (error.message.includes('404') || error.message.toLowerCase().includes('not found')) {
             document.getElementById('profileTitle').textContent = 'Complete Your Profile Setup';
        } else {
            displayMessage('profileMessage', `Error loading profile: ${error.message}`, true);
        }
    }
}
