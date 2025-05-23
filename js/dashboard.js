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
    }    // Update Weekly Progress (calculate percentage based on goals)
    const weeklyProgress = document.getElementById('weeklyProgress');
    if (weeklyProgress) {
        const targetWorkouts = summary.target_workouts_weekly || 5; // Default to 5 if not provided by backend
        const currentWorkouts = summary.workouts_this_week || 0;
        if (targetWorkouts > 0) {
            const percentage = Math.min(Math.round((currentWorkouts / targetWorkouts) * 100), 100);
            weeklyProgress.textContent = `${percentage}%`;
            // Add helpful label showing progress
            const weeklyProgressLabel = weeklyProgress.parentElement.querySelector('.metric-label');
            if (weeklyProgressLabel) {
                weeklyProgressLabel.textContent = `${currentWorkouts} / ${targetWorkouts} workouts`;
            }
        } else {
            weeklyProgress.textContent = 'Set Goal';
            const weeklyProgressLabel = weeklyProgress.parentElement.querySelector('.metric-label');
            if (weeklyProgressLabel) {
                weeklyProgressLabel.textContent = 'No weekly goal set';
            }
        }
    }

    // Update Current Streak
    const currentStreak = document.getElementById('currentStreak');
    if (currentStreak) {
        const streakValue = summary.current_streak || 0;
        currentStreak.textContent = streakValue;
        // Update label for better UX
        const streakLabel = currentStreak.parentElement.querySelector('.metric-label');
        if (streakLabel) {
            if (streakValue === 0) {
                streakLabel.textContent = 'Start your streak!';
            } else {
                streakLabel.textContent = streakValue === 1 ? 'Day Active' : 'Days Active';
            }
        }
    }

    // Update Total Calories
    const totalCalories = document.getElementById('totalCalories');
    if (totalCalories) {
        const caloriesValue = summary.calories_burned_this_week || 0;
        totalCalories.textContent = caloriesValue.toLocaleString();
        // Add motivational messaging for zero state
        if (caloriesValue === 0) {
            const caloriesLabel = totalCalories.parentElement.querySelector('.metric-label');
            if (caloriesLabel) {
                caloriesLabel.textContent = 'Log workouts to track calories';
            }
        }
    }
}

function updateProgressBar(summary) {
    const progressBar = document.getElementById('dailyProgressBar');
    const progressText = document.getElementById('progressText');
    
    if (progressBar && progressText) {
        const dailyGoal = summary.target_activities_daily || 3; // Default to 3 if not provided by backend
        const completed = (summary.workouts_today_count || 0) + 
                         (summary.nutrition_logs_today || 0) + 
                         (summary.water_logs_today || 0);
        
        let percentage = 0;
        if (dailyGoal > 0) {
            percentage = Math.min(Math.round((completed / dailyGoal) * 100), 100);
        }
        
        progressBar.style.width = percentage + '%';
        
        if (dailyGoal === 0) {
            progressText.textContent = "Set daily goals in your profile! ✨";
        } else if (percentage === 0) {
            progressText.textContent = `Ready to start! 0/${dailyGoal} activities completed. Let's go! 🚀`;
        } else if (percentage < 50) {
            progressText.textContent = `Great start! ${completed}/${dailyGoal} activities (${percentage}%) 💪`;
        } else if (percentage < 100) {
            progressText.textContent = `Awesome progress! ${completed}/${dailyGoal} activities (${percentage}%) 🔥`;
        } else {
            progressText.textContent = `Daily goal crushed! ${completed}/${dailyGoal} activities completed! 🏆`;
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