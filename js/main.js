import { supabase } from './supabaseClient.js';

document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('logoutButton');
    const userEmailDisplay = document.getElementById('userEmailDisplay');
    const navLinks = document.getElementById('navLinks');
    const authLinks = document.getElementById('authLinks'); // For login/register links

    supabase.auth.onAuthStateChange((event, session) => {
        if (session && session.user) {
            console.log('User is logged in:', session.user.email);
            if (userEmailDisplay) userEmailDisplay.textContent = `Logged in as: ${session.user.email}`;
            if (navLinks) navLinks.style.display = 'flex'; // Show app navigation
            if (authLinks) authLinks.style.display = 'none'; // Hide login/register
            if (logoutButton) logoutButton.style.display = 'block';

            // Redirect to dashboard if on login/register page and logged in
            if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('register.html')) {
                 // Check if profile exists, if not, redirect to profile setup
                checkProfileAndRedirect(session.user.id);
            }
        } else {
            console.log('User is logged out.');
            if (userEmailDisplay) userEmailDisplay.textContent = '';
            if (navLinks) navLinks.style.display = 'none'; // Hide app navigation
            if (authLinks) authLinks.style.display = 'flex'; // Show login/register
            if (logoutButton) logoutButton.style.display = 'none';

            // If not on login/register page, redirect to login
            const currentPath = window.location.pathname;
            const isLoginPath = currentPath.endsWith('index.html') || currentPath === '/';
            const isRegisterPath = currentPath.endsWith('register.html') || currentPath === '/register';
            const isAboutPath = currentPath.endsWith('about.html') || currentPath === '/about';

            if (!(isLoginPath || isRegisterPath || isAboutPath)) {
                window.location.href = '/index.html'; // Or your login page path
            }
        }
    });

    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Error logging out:', error.message);
                alert(`Logout failed: ${error.message}`);
            } else {
                console.log('User logged out successfully.');
                window.location.href = '/index.html'; // Redirect to login page
            }
        });
    }
});

async function checkProfileAndRedirect(userId) {
    try {
        // We need to use the API service, as frontend JS cannot directly query Supabase with RLS
        // if the RLS policies require a validated user from the backend.
        // However, if profile is public or readable by authenticated user directly via Supabase JS:
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('user_id')
            .eq('user_id', userId)
            .maybeSingle();

        if (error && error.code !== 'PGRST116') { // PGRST116: 'Searched for a single row, but found no rows' (expected if no profile)
            console.error("Error checking profile:", error);
            // Handle error, maybe stay on current page or show generic error
            return;
        }
        
        if (!profile && (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('register.html'))) {
            console.log("Profile not found, redirecting to profile setup.");
            window.location.href = '/profile.html?setup=true';
        } else if (profile && (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('register.html'))) {
            console.log("Profile found, redirecting to dashboard.");
            window.location.href = '/dashboard.html';
        }
        // If on other pages and profile exists, do nothing, let the page load.
        // If on other pages and profile doesn't exist, they should be redirected to profile.html by that page's logic or a global check.
    } catch (apiError) {
        console.error("API Error checking profile status:", apiError);
        // Potentially redirect to an error page or show a message
    }
}