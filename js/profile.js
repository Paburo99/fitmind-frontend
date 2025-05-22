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
    const profileTitle = document.getElementById('profileTitle');
    // isSetup is determined outside this function, before it's called.
    // This function is only called if !isSetup.

    try {
        const profileApiResponse = await makeApiRequest('/profile', 'GET');

        if (profileApiResponse) { // Check if profileApiResponse is not null/undefined
            // Populate form with data from the /profile endpoint
            document.getElementById('username').value = profileApiResponse.username || '';
            document.getElementById('date_of_birth').value = profileApiResponse.date_of_birth || '';
            document.getElementById('gender').value = profileApiResponse.gender || '';
            document.getElementById('height_cm').value = profileApiResponse.height_cm || '';
            
            // Initially set the weight field with initial_weight_kg from the profile
            document.getElementById('initial_weight_kg').value = profileApiResponse.initial_weight_kg || ''; 
            
            document.getElementById('fitness_level').value = profileApiResponse.fitness_level || '';
            document.getElementById('primary_goal').value = profileApiResponse.primary_goal || '';
            document.getElementById('dietary_preferences').value = profileApiResponse.dietary_preferences || '';
            document.getElementById('allergies_intolerances').value = profileApiResponse.allergies_intolerances || '';
            document.getElementById('activity_level').value = profileApiResponse.activity_level || '';
            
            // Since loadProfileData is only called when !isSetup, the title is already 'Edit Your Profile'.
            // No need to set it again here.

            // Now, try to fetch and display the most recent weight from weight_tracker
            try {
                const weightHistory = await makeApiRequest('/progress/weight', 'GET');
                if (weightHistory && weightHistory.length > 0) {
                    // Assuming /progress/weight returns data sorted by date ascending,
                    // so the last entry is the most recent.
                    const latestWeightEntry = weightHistory[weightHistory.length - 1];
                    if (latestWeightEntry && typeof latestWeightEntry.weight_kg !== 'undefined') {
                        document.getElementById('initial_weight_kg').value = latestWeightEntry.weight_kg;
                        
                        // OPTIONAL: Dynamically change the label for the weight field in edit mode for clarity
                        // const weightLabel = document.querySelector('label[for="initial_weight_kg"]');
                        // if (weightLabel) {
                        //     weightLabel.textContent = 'Current Weight (kg):';
                        // }
                    }
                }
            } catch (weightError) {
                console.warn('Could not load current weight data:', weightError);
                // Silently fail or display a non-critical message.
                // The initial_weight_kg from the profile will remain in the field.
            }

        } else {
            // This block is hit if makeApiRequest('/profile', 'GET') returns a falsy value 
            // (e.g., null, undefined) without throwing an error that would be caught by the outer catch.
            // This could happen if your makeApiRequest handles 404s by returning null.
            console.log("No existing profile data found (API returned no data for /profile).");
            // Since this function is only called when !isSetup, this means an edit attempt failed to find a profile.
            profileTitle.textContent = 'Profile Not Found';
            displayMessage('profileMessage', 'Profile not found. You may need to complete the setup.', true);
        }
    } catch (error) {
        console.error('Error loading profile data:', error);
        // This catch block is for errors explicitly thrown by makeApiRequest 
        // (e.g., network error, or if it's configured to throw on HTTP errors like 404).
        if (error.message.includes('404') || error.message.toLowerCase().includes('not found')) {
            // We are in edit mode (since loadProfileData is only called when !isSetup) and profile was not found.
            profileTitle.textContent = 'Profile Not Found';
            displayMessage('profileMessage', 'Profile not found. Please complete the setup process first.', true);
        } else {
            displayMessage('profileMessage', `Error loading profile: ${error.message}`, true);
        }
    }
}
