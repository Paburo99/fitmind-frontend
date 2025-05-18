// This assumes supabase client is initialized and available globally or imported
import { supabase } from './supabaseClient.js'; // If using modules and supabaseClient.js exports it
import { displayMessage } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = loginForm.email.value;
            const password = loginForm.password.value;
            const loginMessage = document.getElementById('loginMessage');

            try {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: email,
                    password: password,
                });

                if (error) {
                    console.error('Login error:', error.message);
                    displayMessage('loginMessage', `Login failed: ${error.message}`, true);
                    return;
                }

                console.log('Login successful:', data.user);
                // main.js onAuthStateChange will handle redirection to dashboard or profile setup
            } catch (err) {
                console.error('Unexpected login error:', err);
                displayMessage('loginMessage', 'An unexpected error occurred. Please try again.', true);
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = registerForm.email.value;
            const password = registerForm.password.value;
            const confirmPassword = registerForm.confirmPassword.value;
            const registerMessage = document.getElementById('registerMessage');

            if (password !== confirmPassword) {
                displayMessage('registerMessage', 'Passwords do not match!', true);
                return;
            }

            try {
                const { data, error } = await supabase.auth.signUp({
                    email: email,
                    password: password,
                    // options: { data: { username: 'initial_username_if_needed' } } // if you want to add custom data on signup
                });

                if (error) {
                    console.error('Registration error:', error.message);
                    displayMessage('registerMessage', `Registration failed: ${error.message}`, true);
                    return;
                }
                
                console.log('Registration successful:', data.user);
                displayMessage('registerMessage', 'Registration successful! Please check your email to confirm your account if email confirmation is enabled. You will be redirected shortly if auto-confirmed or already logged in.', false);
                // Supabase typically logs the user in automatically after signup if no email confirmation is required,
                // or if it is required and the user confirms.
                // The onAuthStateChange in main.js will then redirect to profile setup or dashboard.
                // If email confirmation is required, they will need to confirm before onAuthStateChange fully logs them in.
                // You might want to redirect to a "please confirm your email page" here.
                // For now, we rely on onAuthStateChange.
                
            } catch (err) {
                console.error('Unexpected registration error:', err);
                displayMessage('registerMessage', 'An unexpected error occurred during registration.', true);
            }
        });
    }
});