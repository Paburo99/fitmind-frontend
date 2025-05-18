// IMPORTANT: Replace with your actual Supabase URL and Anon Key
const SUPABASE_URL = 'https://tchcbhzbnrqwsutslirr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjaGNiaHpibnJxd3N1dHNsaXJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MTYxNzcsImV4cCI6MjA2MzA5MjE3N30.e5FaC_mXBQCGpYAO3_dyQQKee2D1sGNfLfeNnkRJt3I';

// Ensure you've included the Supabase JS library in your HTML files
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
// Or install via npm: npm install @supabase/supabase-js and import it

let supabase = null;
try {
    if (window.supabase && window.supabase.createClient) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log("Supabase client initialized.");
    } else {
        console.error("Supabase library not found. Make sure it's loaded before this script.");
    }
} catch (error) {
    console.error("Error initializing Supabase client:", error);
}

export { supabase }; // Export for use in other JS files (if using modules)
// If not using modules, supabase will be a global variable from the CDN script.
// This file then just serves as a central place for your keys.