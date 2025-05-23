import { makeApiRequest } from './apiService.js'; // If using modules
import { displayMessage } from './utils.js'; // If using modules

document.addEventListener('DOMContentLoaded', async () => {
    const dashboardMessageEl = document.getElementById('dashboardMessage');

    try {
        const summary = await makeApiRequest('/dashboard/summary', 'GET');
        if (summary) {
            updateDashboardCards(summary);
            updateProgressBar(summary);
            updateAchievements(summary);
        } else {
            displayMessage('dashboardMessage', "Could not load summary data.", true);
        }
    } catch (error) {
        console.error('Error loading dashboard summary:', error);
        displayMessage('dashboardMessage', `Failed to load dashboard: ${error.message}`, true);
    }
});

function updateDashboardCards(summary) {
    // Update Today's Workouts
    const todayWorkouts = document.getElementById('todayWorkouts');
    if (todayWorkouts) {
        todayWorkouts.textContent = summary.workouts_today_count || 0;
    }

    // Update Weekly Progress (calculate percentage based on goals)
    const weeklyProgress = document.getElementById('weeklyProgress');
    if (weeklyProgress) {
        const targetWorkouts = 5; // Example target
        const currentWorkouts = summary.workouts_this_week || 0;
        const percentage = Math.min(Math.round((currentWorkouts / targetWorkouts) * 100), 100);
        weeklyProgress.textContent = percentage + '%';
    }

    // Update Current Streak
    const currentStreak = document.getElementById('currentStreak');
    if (currentStreak) {
        currentStreak.textContent = summary.current_streak || 0;
    }

    // Update Total Calories
    const totalCalories = document.getElementById('totalCalories');
    if (totalCalories) {
        totalCalories.textContent = summary.calories_burned_this_week || 0;
    }
}

function updateProgressBar(summary) {
    const progressBar = document.getElementById('dailyProgressBar');
    const progressText = document.getElementById('progressText');
    
    if (progressBar && progressText) {
        const dailyGoal = 3; // Example: 3 activities per day
        const completed = (summary.workouts_today_count || 0) + 
                         (summary.nutrition_logs_today || 0) + 
                         (summary.water_logs_today || 0);
        
        const percentage = Math.min(Math.round((completed / dailyGoal) * 100), 100);
        
        progressBar.style.width = percentage + '%';
        
        if (percentage === 0) {
            progressText.textContent = "Get started with your first activity! 🚀";
        } else if (percentage < 50) {
            progressText.textContent = `Great start! ${percentage}% of daily goal completed 💪`;
        } else if (percentage < 100) {
            progressText.textContent = `Awesome progress! ${percentage}% completed - keep going! 🔥`;
        } else {
            progressText.textContent = "Daily goal achieved! You're crushing it! 🏆";
        }
    }
}

function updateAchievements(summary) {
    const achievementBadges = document.getElementById('achievementBadges');
    if (!achievementBadges) return;

    let badges = [];
    
    // Check for various achievements
    if (summary.workouts_today_count >= 1) {
        badges.push('Today\'s Warrior');
    }
    
    if (summary.current_streak >= 3) {
        badges.push(`${summary.current_streak}-Day Streak`);
    }
    
    if (summary.workouts_this_week >= 5) {
        badges.push('Weekly Champion');
    }
    
    if (summary.total_workouts >= 10) {
        badges.push('Fitness Enthusiast');
    }

    // Clear existing badges and add new ones
    achievementBadges.innerHTML = '';
    badges.forEach(badge => {
        const badgeEl = document.createElement('div');
        badgeEl.className = 'achievement-badge';
        badgeEl.textContent = badge;
        achievementBadges.appendChild(badgeEl);
    });
}