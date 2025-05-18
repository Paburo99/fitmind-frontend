// Base URL for your Flask API (Update in production to your Render URL)
const API_BASE_URL = 'https://fitmind-backend-7pc1.onrender.com/api'; // e.g., https://your-app-name.onrender.com/api
// For local development: const API_BASE_URL = 'http://127.0.0.1:10000/api';

import { supabase } from './supabaseClient.js';

async function makeApiRequest(endpoint, method = 'GET', body = null, requiresAuth = true) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
    };

    if (requiresAuth) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session || !session.access_token) {
            console.error('No active session or access token for authenticated request.');
            // Redirect to login or show error
            window.location.href = '/index.html'; // Or appropriate login page
            throw new Error('Authentication required.');
        }
        headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    const config = {
        method: method,
        headers: headers,
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, config);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            console.error(`API Error ${response.status}: ${errorData.message || errorData.error}`, errorData);
            throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
        }
        // For 204 No Content or similar, response.json() will fail
        if (response.status === 204) {
            return null; 
        }
        return await response.json();
    } catch (error) {
        console.error('Error in makeApiRequest:', error);
        throw error; // Re-throw to be caught by caller
    }
}

export { makeApiRequest }