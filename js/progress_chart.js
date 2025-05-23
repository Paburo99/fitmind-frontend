import { makeApiRequest } from './apiService.js'; // If using modules
import { displayMessage } from './utils.js'; // If using modules

let weightChartInstance = null; // To store the chart instance for updates/destruction
// Chart instances for existing data tracking
let workoutChartInstance = null;
let nutritionChartInstance = null;
let waterChartInstance = null;
let activityChartInstance = null;
let caloriesChartInstance = null;

document.addEventListener('DOMContentLoaded', async () => {
    await loadProgressData();
    await loadWeightChartData();
    await loadWorkoutChartData();
    await loadNutritionChartData();
    await loadWaterIntakeChartData();
    await loadActivityTypeChartData();
    await loadCaloriesBurnedChartData();

    // Add event listeners for chart controls
    const weightDateRange = document.getElementById('weightDateRange');
    const refreshWeightChart = document.getElementById('refreshWeightChart');
    
    if (weightDateRange) {
        weightDateRange.addEventListener('change', loadWeightChartData);
    }
    
    if (refreshWeightChart) {
        refreshWeightChart.addEventListener('click', loadWeightChartData);
    }

    // Workout chart controls
    const workoutTimeframe = document.getElementById('workoutTimeframe');
    const refreshWorkoutChart = document.getElementById('refreshWorkoutChart');    
    if (workoutTimeframe) {
        workoutTimeframe.addEventListener('change', loadWorkoutChartData);
    }
    
    if (refreshWorkoutChart) {
        refreshWorkoutChart.addEventListener('click', loadWorkoutChartData);
    }

    // Nutrition chart controls
    const nutritionMetric = document.getElementById('nutritionMetric');
    const refreshNutritionChart = document.getElementById('refreshNutritionChart');
    
    if (nutritionMetric) {
        nutritionMetric.addEventListener('change', loadNutritionChartData);
    }
    
    if (refreshNutritionChart) {
        refreshNutritionChart.addEventListener('click', loadNutritionChartData);
    }

    // Water intake chart controls
    const waterTimeframe = document.getElementById('waterTimeframe');
    const refreshWaterChart = document.getElementById('refreshWaterChart');
    
    if (waterTimeframe) {
        waterTimeframe.addEventListener('change', loadWaterIntakeChartData);
    }
    
    if (refreshWaterChart) {
        refreshWaterChart.addEventListener('click', loadWaterIntakeChartData);
    }

    // Activity type chart controls
    const activityTimeframe = document.getElementById('activityTimeframe');
    const refreshActivityChart = document.getElementById('refreshActivityChart');
    
    if (activityTimeframe) {
        activityTimeframe.addEventListener('change', loadActivityTypeChartData);
    }
    
    if (refreshActivityChart) {
        refreshActivityChart.addEventListener('click', loadActivityTypeChartData);
    }

    // Calories burned chart controls
    const caloriesTimeframe = document.getElementById('caloriesTimeframe');
    const refreshCaloriesChart = document.getElementById('refreshCaloriesChart');
    
    if (caloriesTimeframe) {
        caloriesTimeframe.addEventListener('change', loadCaloriesBurnedChartData);
    }
    
    if (refreshCaloriesChart) {
        refreshCaloriesChart.addEventListener('click', loadCaloriesBurnedChartData);
    }

    const generateInsightsButton = document.getElementById('generateInsightsButton');
    const insightsArea = document.getElementById('insightsArea');

    if (generateInsightsButton) {
        generateInsightsButton.addEventListener('click', async () => {
            insightsArea.textContent = 'Generating insights...';
            try {
                const data = await makeApiRequest('/insights/generate', 'GET');
                if (data.insights && data.insights.length > 0) {
                    insightsArea.innerHTML = data.insights.map(insight => `<p>${insight}</p>`).join('');
                } else {
                    insightsArea.textContent = 'No new insights available at this time.';
                }
            } catch (error) {
                insightsArea.textContent = `Error generating insights: ${error.message}`;
                displayMessage('progressMessage', `Error generating insights: ${error.message}`, true);
            }
        });
    }
});

async function loadProgressData() {
    try {
        const summary = await makeApiRequest('/dashboard/summary', 'GET');
        if (summary) {
            updateStreakDisplay(summary);
            updateAchievementsDisplay(summary);
        }
    } catch (error) {
        console.error('Error loading progress summary:', error);
        displayMessage('progressMessage', `Error loading progress data: ${error.message}`, true);
    }
}

function updateStreakDisplay(summary) {
    const streakNumber = document.getElementById('streakNumber');
    const streakLabel = document.getElementById('streakLabel');
    
    if (streakNumber && streakLabel) {
        const currentStreak = summary.current_streak || 0;
        streakNumber.textContent = currentStreak;
        
        if (currentStreak === 0) {
            streakLabel.textContent = 'Start your streak!';
        } else if (currentStreak === 1) {
            streakLabel.textContent = 'Day Streak! Keep going!';
        } else {
            streakLabel.textContent = `Day Streak! Amazing!`;
        }
    }
}

function updateAchievementsDisplay(summary) {
    const achievementsDisplay = document.getElementById('achievementsDisplay');
    const noAchievementsMessage = document.getElementById('noAchievementsMessage');
    
    if (!achievementsDisplay) return;
    
    let badges = [];
    
    // Generate dynamic achievements based on actual data
    if (summary.workouts_today_count >= 1) {
        badges.push("Today's Warrior");
    }
    
    if (summary.current_streak >= 3) {
        badges.push(`${summary.current_streak}-Day Streak`);
    }
    
    if (summary.workouts_this_week >= 5) {
        badges.push('Weekly Champion');
    }
    
    if (summary.total_workouts >= 1) {
        badges.push('First Steps');
    }
    
    if (summary.total_workouts >= 10) {
        badges.push('Fitness Enthusiast');
    }
    
    if (summary.total_workouts >= 50) {
        badges.push('Dedicated Athlete');
    }
    
    // Clear existing content
    achievementsDisplay.innerHTML = '';
    
    if (badges.length > 0) {
        if (noAchievementsMessage) noAchievementsMessage.style.display = 'none';
        badges.forEach(badge => {
            const badgeEl = document.createElement('div');
            badgeEl.className = 'achievement-badge';
            badgeEl.textContent = badge;
            achievementsDisplay.appendChild(badgeEl);
        });
    } else {
        if (noAchievementsMessage) {
            noAchievementsMessage.style.display = 'block';
            achievementsDisplay.appendChild(noAchievementsMessage);
        }
    }
}

async function loadWeightChartData() {
    const noWeightDataMsg = document.getElementById('noWeightDataMessage');
    const dateRange = document.getElementById('weightDateRange')?.value || '30';
    
    try {
        const endpoint = dateRange === 'all' ? 
            '/progress/weight' : 
            `/progress/weight?days=${dateRange}`;
            
        const weightData = await makeApiRequest(endpoint, 'GET');
        
        if (weightData && weightData.length > 0) {
            if(noWeightDataMsg) noWeightDataMsg.style.display = 'none';
            renderWeightChart(weightData);
        } else {
            console.log('No weight data to display.');
            if(noWeightDataMsg) noWeightDataMsg.style.display = 'block';
            if (weightChartInstance) {
                weightChartInstance.destroy();
                weightChartInstance = null;
            }
        }
    } catch (error) {
        console.error('Error loading weight data for chart:', error);
        if(noWeightDataMsg) {
            noWeightDataMsg.textContent = `Error loading chart: ${error.message}`;
            noWeightDataMsg.style.display = 'block';
        }
         displayMessage('progressMessage', `Error loading weight chart: ${error.message}`, true);
    }
}

function renderWeightChart(data) {
    const ctx = document.getElementById('weightChart').getContext('2d');
    
    if (weightChartInstance) {
        weightChartInstance.destroy();
    }

    // Calculate trend line
    const trendData = calculateTrendLine(data);

    const chartData = {
        labels: data.map(item => new Date(item.date)),
        datasets: [
            {
                label: 'Weight (kg)',
                data: data.map(item => item.weight_kg),
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.1,
                fill: false,
                pointRadius: 4,
                pointHoverRadius: 6
            },
            {
                label: 'Trend',
                data: trendData,
                borderColor: 'rgba(239, 68, 68, 0.8)',
                borderDash: [5, 5],
                tension: 0,
                fill: false,
                pointRadius: 0,
                pointHoverRadius: 0
            }
        ]
    };

    weightChartInstance = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: true
                },
                tooltip: {
                    callbacks: {
                        title: function(context) {
                            return new Date(context[0].parsed.x).toLocaleDateString();
                        },
                        label: function(context) {
                            if (context.datasetIndex === 0) {
                                return `Weight: ${context.parsed.y.toFixed(1)} kg`;
                            } else {
                                return `Trend: ${context.parsed.y.toFixed(1)} kg`;
                            }
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day',
                        tooltipFormat: 'MMM dd, yyyy',
                        displayFormats: {
                           day: 'MMM dd'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Weight (kg)'
                    }
                }
            }
        }
    });
}

function calculateTrendLine(data) {
    if (data.length < 2) return [];
    
    const n = data.length;
    const sumX = data.reduce((sum, item, index) => sum + index, 0);
    const sumY = data.reduce((sum, item) => sum + item.weight_kg, 0);
    const sumXY = data.reduce((sum, item, index) => sum + (index * item.weight_kg), 0);
    const sumXX = data.reduce((sum, item, index) => sum + (index * index), 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return data.map((item, index) => slope * index + intercept);
}

async function loadWorkoutChartData() {
    const noWorkoutDataMsg = document.getElementById('noWorkoutDataMessage');
    const timeframe = document.getElementById('workoutTimeframe')?.value || '30';
    
    try {
        const workoutData = await makeApiRequest('/progress/workouts', 'GET');
        
        if (workoutData && workoutData.length > 0) {
            if(noWorkoutDataMsg) noWorkoutDataMsg.style.display = 'none';
            
            // Filter by timeframe if needed
            let filteredData = workoutData;
            if (timeframe !== 'all') {
                const cutoffDate = new Date();
                cutoffDate.setDate(cutoffDate.getDate() - parseInt(timeframe));
                filteredData = workoutData.filter(workout => 
                    new Date(workout.date) >= cutoffDate
                );
            }
            
            renderWorkoutChart(filteredData, timeframe);
        } else {
            console.log('No workout data to display.');
            if(noWorkoutDataMsg) noWorkoutDataMsg.style.display = 'block';
            if (workoutChartInstance) {
                workoutChartInstance.destroy();
                workoutChartInstance = null;
            }
        }
    } catch (error) {
        console.error('Error loading workout data for chart:', error);
        if(noWorkoutDataMsg) {
            noWorkoutDataMsg.textContent = `Error loading chart: ${error.message}`;
            noWorkoutDataMsg.style.display = 'block';
        }
    }
}

function renderWorkoutChart(data, timeframe) {
    const ctx = document.getElementById('workoutChart').getContext('2d');
    
    if (workoutChartInstance) {
        workoutChartInstance.destroy();
    }

    // Group workouts by week or month based on timeframe
    const groupedData = groupWorkoutsByPeriod(data, timeframe);

    const chartData = {
        labels: groupedData.map(item => item.period),
        datasets: [
            {
                label: 'Workouts Count',
                data: groupedData.map(item => item.count),
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.1,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6
            },
            {
                label: 'Total Duration (hours)',
                data: groupedData.map(item => item.totalDuration / 60), // Convert minutes to hours
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                tension: 0.1,
                fill: false,
                pointRadius: 4,
                pointHoverRadius: 6,
                yAxisID: 'y1'
            }
        ]
    };

    workoutChartInstance = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: true
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            if (context.datasetIndex === 0) {
                                return `Workouts: ${context.parsed.y}`;
                            } else {
                                return `Duration: ${context.parsed.y.toFixed(1)} hours`;
                            }
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: timeframe === '7' ? 'Days' : timeframe === '30' ? 'Weeks' : 'Months'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Workout Count'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Duration (hours)'
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                }
            }
        }
    });
}

function groupWorkoutsByPeriod(data, timeframe) {
    const grouped = {};
    
    data.forEach(workout => {
        const date = new Date(workout.date);
        let period;
        
        if (timeframe === '7') {
            // Group by day
            period = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        } else if (timeframe === '30') {
            // Group by week
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            period = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } else {
            // Group by month
            period = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        }
        
        if (!grouped[period]) {
            grouped[period] = {
                period,
                count: 0,
                totalDuration: 0
            };
        }
        
        grouped[period].count++;
        grouped[period].totalDuration += workout.duration_minutes || 0;
    });
    
    return Object.values(grouped).sort((a, b) => new Date(a.period) - new Date(b.period));
}

async function loadWaterIntakeChartData() {
    const noWaterDataMsg = document.getElementById('noWaterDataMessage');
    const timeframe = document.getElementById('waterTimeframe')?.value || '30';
    
    try {
        const waterData = await makeApiRequest('/logs/water', 'GET');
        
        if (waterData && waterData.length > 0) {
            if(noWaterDataMsg) noWaterDataMsg.style.display = 'none';
            
            // Filter by timeframe if needed
            let filteredData = waterData;
            if (timeframe !== 'all') {
                const cutoffDate = new Date();
                cutoffDate.setDate(cutoffDate.getDate() - parseInt(timeframe));
                filteredData = waterData.filter(water => 
                    new Date(water.date) >= cutoffDate
                );
            }
            
            renderWaterChart(filteredData, timeframe);
        } else {
            console.log('No water data to display.');
            if(noWaterDataMsg) noWaterDataMsg.style.display = 'block';
            if (waterChartInstance) {
                waterChartInstance.destroy();
                waterChartInstance = null;
            }
        }
    } catch (error) {
        console.error('Error loading water data for chart:', error);
        if(noWaterDataMsg) {
            noWaterDataMsg.textContent = `Error loading chart: ${error.message}`;
            noWaterDataMsg.style.display = 'block';
        }
    }
}

function renderWaterChart(data, timeframe) {
    const ctx = document.getElementById('waterChart').getContext('2d');
    
    if (waterChartInstance) {
        waterChartInstance.destroy();
    }

    // Group water intake by day
    const groupedData = groupWaterByDay(data);

    const chartData = {
        labels: groupedData.map(item => item.date),
        datasets: [{
            label: 'Daily Water Intake (ml)',
            data: groupedData.map(item => item.totalAmount),
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.1,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 6
        }]
    };

    waterChartInstance = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: true
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Water: ${context.parsed.y} ml`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Water Intake (ml)'
                    }
                }
            }
        }
    });
}

function groupWaterByDay(data) {
    const grouped = {};
    
    data.forEach(water => {
        const date = new Date(water.date).toLocaleDateString();
        
        if (!grouped[date]) {
            grouped[date] = {
                date,
                totalAmount: 0
            };
        }
        
        grouped[date].totalAmount += water.amount_ml || 0;
    });
    
    return Object.values(grouped).sort((a, b) => new Date(a.date) - new Date(b.date));
}

async function loadActivityTypeChartData() {
    const noActivityDataMsg = document.getElementById('noActivityDataMessage');
    const timeframe = document.getElementById('activityTimeframe')?.value || '30';
    
    try {
        const workoutData = await makeApiRequest('/progress/workouts', 'GET');
        
        if (workoutData && workoutData.length > 0) {
            if(noActivityDataMsg) noActivityDataMsg.style.display = 'none';
            
            // Filter by timeframe if needed
            let filteredData = workoutData;
            if (timeframe !== 'all') {
                const cutoffDate = new Date();
                cutoffDate.setDate(cutoffDate.getDate() - parseInt(timeframe));
                filteredData = workoutData.filter(workout => 
                    new Date(workout.date) >= cutoffDate
                );
            }
            
            renderActivityTypeChart(filteredData);
        } else {
            console.log('No activity data to display.');
            if(noActivityDataMsg) noActivityDataMsg.style.display = 'block';
            if (activityChartInstance) {
                activityChartInstance.destroy();
                activityChartInstance = null;
            }
        }
    } catch (error) {
        console.error('Error loading activity data for chart:', error);
        if(noActivityDataMsg) {
            noActivityDataMsg.textContent = `Error loading chart: ${error.message}`;
            noActivityDataMsg.style.display = 'block';
        }
    }
}

function renderActivityTypeChart(data) {
    const ctx = document.getElementById('activityChart').getContext('2d');
    
    if (activityChartInstance) {
        activityChartInstance.destroy();
    }

    // Group workouts by type
    const activityTypes = {};
    data.forEach(workout => {
        const type = workout.type || 'Other';
        if (!activityTypes[type]) {
            activityTypes[type] = 0;
        }
        activityTypes[type]++;
    });

    const chartData = {
        labels: Object.keys(activityTypes),
        datasets: [{
            label: 'Activity Frequency',
            data: Object.values(activityTypes),
            backgroundColor: [
                'rgba(59, 130, 246, 0.8)',
                'rgba(34, 197, 94, 0.8)',
                'rgba(168, 85, 247, 0.8)',
                'rgba(249, 115, 22, 0.8)',
                'rgba(239, 68, 68, 0.8)',
                'rgba(156, 163, 175, 0.8)'
            ],
            borderColor: [
                'rgb(59, 130, 246)',
                'rgb(34, 197, 94)',
                'rgb(168, 85, 247)',
                'rgb(249, 115, 22)',
                'rgb(239, 68, 68)',
                'rgb(156, 163, 175)'
            ],
            borderWidth: 2
        }]
    };

    activityChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom'
                },
                tooltip: {                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: ${context.parsed} sessions (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

async function loadCaloriesBurnedChartData() {
    const noCaloriesDataMsg = document.getElementById('noCaloriesDataMessage');
    const timeframe = document.getElementById('caloriesTimeframe')?.value || '30';
    
    try {
        const workoutData = await makeApiRequest('/progress/workouts', 'GET');
        
        if (workoutData && workoutData.length > 0) {
            if(noCaloriesDataMsg) noCaloriesDataMsg.style.display = 'none';
            
            // Filter by timeframe if needed
            let filteredData = workoutData;
            if (timeframe !== 'all') {
                const cutoffDate = new Date();
                cutoffDate.setDate(cutoffDate.getDate() - parseInt(timeframe));
                filteredData = workoutData.filter(workout => 
                    new Date(workout.date) >= cutoffDate
                );
            }
            
            renderCaloriesBurnedChart(filteredData, timeframe);
        } else {
            console.log('No calories data to display.');
            if(noCaloriesDataMsg) noCaloriesDataMsg.style.display = 'block';
            if (caloriesChartInstance) {
                caloriesChartInstance.destroy();
                caloriesChartInstance = null;
            }
        }
    } catch (error) {
        console.error('Error loading calories data for chart:', error);
        if(noCaloriesDataMsg) {
            noCaloriesDataMsg.textContent = `Error loading chart: ${error.message}`;
            noCaloriesDataMsg.style.display = 'block';
        }
    }
}

function renderCaloriesBurnedChart(data, timeframe) {
    const ctx = document.getElementById('caloriesChart').getContext('2d');
    
    if (caloriesChartInstance) {
        caloriesChartInstance.destroy();
    }

    // Group calories by period (day/week based on timeframe)
    const groupedData = groupCaloriesByPeriod(data, timeframe);

    const chartData = {
        labels: groupedData.map(item => item.period),
        datasets: [{
            label: 'Calories Burned',
            data: groupedData.map(item => item.totalCalories),
            borderColor: 'rgb(239, 68, 68)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            tension: 0.1,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 6
        }]
    };

    caloriesChartInstance = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: true
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Calories: ${context.parsed.y} kcal`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: timeframe === '7' ? 'Days' : timeframe === '30' ? 'Weeks' : 'Months'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Calories Burned (kcal)'
                    }
                }
            }
        }
    });
}

function groupCaloriesByPeriod(data, timeframe) {
    const grouped = {};
    
    data.forEach(workout => {
        const date = new Date(workout.date);
        let period;
        
        if (timeframe === '7') {
            // Group by day
            period = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        } else if (timeframe === '30') {
            // Group by week
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            period = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } else {
            // Group by month
            period = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        }
        
        if (!grouped[period]) {
            grouped[period] = {
                period,
                totalCalories: 0
            };
        }
        
        grouped[period].totalCalories += workout.calories_burned || 0;
    });
    
    return Object.values(grouped).sort((a, b) => new Date(a.period) - new Date(b.period));
}

async function loadNutritionChartData() {
    const noNutritionDataMsg = document.getElementById('noNutritionDataMessage');
    const metric = document.getElementById('nutritionMetric')?.value || 'calories';
    
    try {
        const nutritionData = await makeApiRequest(`/progress/nutrition?metric=${metric}`, 'GET');
        
        if (nutritionData && nutritionData.length > 0) {
            if(noNutritionDataMsg) noNutritionDataMsg.style.display = 'none';
            renderNutritionChart(nutritionData, metric);
        } else {
            console.log('No nutrition data to display.');
            if(noNutritionDataMsg) noNutritionDataMsg.style.display = 'block';
            if (nutritionChartInstance) {
                nutritionChartInstance.destroy();
                nutritionChartInstance = null;
            }
        }
    } catch (error) {
        console.error('Error loading nutrition data for chart:', error);
        if(noNutritionDataMsg) {
            noNutritionDataMsg.textContent = `Error loading chart: ${error.message}`;
            noNutritionDataMsg.style.display = 'block';
        }
    }
}

function renderNutritionChart(data, metric) {
    const ctx = document.getElementById('nutritionChart').getContext('2d');
    
    if (nutritionChartInstance) {
        nutritionChartInstance.destroy();
    }

    let chartData, chartType = 'line';

    switch(metric) {
        case 'calories':
            chartData = {
                labels: data.map(item => new Date(item.date).toLocaleDateString()),
                datasets: [{
                    label: 'Daily Calories',
                    data: data.map(item => item.total_calories),
                    borderColor: 'rgb(168, 85, 247)',
                    backgroundColor: 'rgba(168, 85, 247, 0.1)',
                    tension: 0.1,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            };
            break;
        case 'macros':
            // Use the most recent day's data for pie chart
            const latestData = data[data.length - 1] || {};
            chartData = {
                labels: ['Protein', 'Carbs', 'Fat'],
                datasets: [{
                    data: [
                        latestData.total_protein || 0,
                        latestData.total_carbs || 0,
                        latestData.total_fat || 0
                    ],
                    backgroundColor: [
                        'rgba(34, 197, 94, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(249, 115, 22, 0.8)'
                    ],
                    borderColor: [
                        'rgb(34, 197, 94)',
                        'rgb(59, 130, 246)',
                        'rgb(249, 115, 22)'
                    ],
                    borderWidth: 2
                }]
            };
            chartType = 'doughnut';
            break;
        case 'goals':
            chartData = {
                labels: data.map(item => new Date(item.date).toLocaleDateString()),
                datasets: [
                    {
                        label: 'Actual Calories',
                        data: data.map(item => item.total_calories),
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.1,
                        fill: false
                    },
                    {
                        label: 'Goal Calories',
                        data: data.map(item => item.calorie_goal || 2000), // Default goal
                        borderColor: 'rgb(239, 68, 68)',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        borderDash: [5, 5],
                        tension: 0,
                        fill: false
                    }
                ]
            };
            break;
        default:
            chartData = {
                labels: ['No Data'],
                datasets: [{ data: [0] }]
            };
    }

    nutritionChartInstance = new Chart(ctx, {
        type: chartType,
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true
                },
                tooltip: {
                    callbacks: metric === 'macros' ? {
                        label: function(context) {
                            return `${context.label}: ${context.parsed}g`;
                        }
                    } : undefined
                }
            },
            scales: chartType === 'doughnut' ? {} : {
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: metric === 'goals' ? 'Calories' : 'Daily Calories'
                    }
                }
            }
        }
    });
}