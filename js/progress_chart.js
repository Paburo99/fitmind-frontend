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
    }    // Nutrition chart controls
    const nutritionTimeframe = document.getElementById('nutritionTimeframe');
    const refreshNutritionChart = document.getElementById('refreshNutritionChart');
    
    if (nutritionTimeframe) {
        nutritionTimeframe.addEventListener('change', loadNutritionChartData);
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
    
    // Calculate target weight zone (if available)
    const weights = data.map(item => item.weight_kg);
    const minWeight = Math.min(...weights);
    const maxWeight = Math.max(...weights);
    const weightRange = maxWeight - minWeight;

    const chartData = {
        labels: data.map(item => new Date(item.date)),
        datasets: [
            {
                label: 'Weight Progress',
                data: data.map(item => item.weight_kg),
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: (ctx) => {
                    const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 400);
                    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.3)');
                    gradient.addColorStop(0.5, 'rgba(99, 102, 241, 0.15)');
                    gradient.addColorStop(1, 'rgba(99, 102, 241, 0.05)');
                    return gradient;
                },
                borderWidth: 4,
                tension: 0.4,
                fill: true,
                pointRadius: 8,
                pointHoverRadius: 12,
                pointBackgroundColor: (context) => {
                    const currentWeight = context.parsed.y;
                    const trendValue = trendData[context.dataIndex];
                    
                    // Color based on progress relative to trend
                    if (currentWeight < trendValue) return 'rgb(34, 197, 94)'; // Green for weight loss
                    if (currentWeight > trendValue + 0.5) return 'rgb(239, 68, 68)'; // Red for weight gain
                    return 'rgb(99, 102, 241)'; // Purple for stable
                },
                pointBorderColor: '#ffffff',
                pointBorderWidth: 3,
                pointHoverBackgroundColor: 'rgb(79, 70, 229)',
                pointStyle: 'circle',
                shadowOffsetX: 2,
                shadowOffsetY: 2,
                shadowBlur: 8,
                shadowColor: 'rgba(99, 102, 241, 0.3)'
            },
            {
                label: 'Trend Line',
                data: trendData,
                borderColor: 'rgba(34, 197, 94, 0.8)',
                backgroundColor: 'transparent',
                borderWidth: 3,
                borderDash: [10, 5],
                tension: 0.2,
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
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 14,
                            weight: '500'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: 'rgba(99, 102, 241, 0.8)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    padding: 12,
                    displayColors: true,
                    callbacks: {
                        title: function(context) {
                            return `⚖️ ${new Date(context[0].parsed.x).toLocaleDateString()}`;
                        },
                        label: function(context) {
                            if (context.datasetIndex === 0) {
                                const weight = context.parsed.y;
                                const trendValue = trendData[context.dataIndex];
                                const difference = weight - trendValue;
                                const status = difference < -0.1 ? '📉 Below trend' : 
                                             difference > 0.1 ? '📈 Above trend' : '🎯 On track';
                                return [`⚖️ Weight: ${weight.toFixed(1)} kg`, `📊 Trend: ${trendValue.toFixed(1)} kg`, status];
                            } else {
                                return `📈 Trend: ${context.parsed.y.toFixed(1)} kg`;
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
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)',
                        lineWidth: 1
                    },
                    ticks: {
                        color: '#6b7280',
                        font: {
                            size: 12,
                            weight: '500'
                        }
                    },
                    title: {
                        display: true,
                        text: '📅 Date',
                        color: '#374151',
                        font: {
                            size: 14,
                            weight: '600'
                        }
                    }
                },
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(99, 102, 241, 0.1)',
                        lineWidth: 1
                    },
                    ticks: {
                        color: '#6b7280',
                        font: {
                            size: 12,
                            weight: '500'
                        },
                        callback: function(value) {
                            return value.toFixed(1) + ' kg';
                        }
                    },
                    title: {
                        display: true,
                        text: '⚖️ Weight (kg)',
                        color: 'rgb(99, 102, 241)',
                        font: {
                            size: 14,
                            weight: '600'
                        }
                    }
                }
            },
            elements: {
                point: {
                    hoverBorderWidth: 4
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
                label: 'Workout Sessions',
                data: groupedData.map(item => item.count),
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: (ctx) => {
                    const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 400);
                    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.3)');
                    gradient.addColorStop(1, 'rgba(99, 102, 241, 0.05)');
                    return gradient;
                },
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBackgroundColor: 'rgb(99, 102, 241)',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointHoverBackgroundColor: 'rgb(79, 70, 229)',
                shadowOffsetX: 3,
                shadowOffsetY: 3,
                shadowBlur: 10,
                shadowColor: 'rgba(99, 102, 241, 0.3)'
            },
            {
                label: 'Duration (hours)',
                data: groupedData.map(item => item.totalDuration / 60), // Convert minutes to hours
                borderColor: 'rgb(16, 185, 129)',
                backgroundColor: (ctx) => {
                    const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 400);
                    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.2)');
                    gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
                    return gradient;
                },
                borderWidth: 3,
                tension: 0.4,
                fill: false,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBackgroundColor: 'rgb(16, 185, 129)',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointHoverBackgroundColor: 'rgb(5, 150, 105)',
                yAxisID: 'y1',
                borderDash: [0],
                pointStyle: 'rectRot'
            }
        ]
    };    workoutChartInstance = new Chart(ctx, {
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
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 14,
                            weight: '500'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: 'rgba(99, 102, 241, 0.8)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    padding: 12,
                    displayColors: true,
                    callbacks: {
                        title: function(context) {
                            return `📅 ${context[0].label}`;
                        },
                        label: function(context) {
                            if (context.datasetIndex === 0) {
                                return `💪 Sessions: ${context.parsed.y}`;
                            } else {
                                return `⏱️ Duration: ${context.parsed.y.toFixed(1)} hours`;
                            }
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)',
                        lineWidth: 1
                    },
                    ticks: {
                        color: '#6b7280',
                        font: {
                            size: 12,
                            weight: '500'
                        }
                    },
                    title: {
                        display: true,
                        text: timeframe === '7' ? '📅 Days' : timeframe === '30' ? '📅 Weeks' : '📅 Months',
                        color: '#374151',
                        font: {
                            size: 14,
                            weight: '600'
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(99, 102, 241, 0.1)',
                        lineWidth: 1
                    },
                    ticks: {
                        color: '#6b7280',
                        font: {
                            size: 12,
                            weight: '500'
                        }
                    },
                    title: {
                        display: true,
                        text: '💪 Workout Sessions',
                        color: 'rgb(99, 102, 241)',
                        font: {
                            size: 14,
                            weight: '600'
                        }
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    beginAtZero: true,
                    grid: {
                        drawOnChartArea: false,
                        color: 'rgba(16, 185, 129, 0.1)'
                    },
                    ticks: {
                        color: '#6b7280',
                        font: {
                            size: 12,
                            weight: '500'
                        }
                    },
                    title: {
                        display: true,
                        text: '⏱️ Duration (hours)',
                        color: 'rgb(16, 185, 129)',
                        font: {
                            size: 14,
                            weight: '600'
                        }
                    }
                }
            },
            elements: {
                point: {
                    hoverBorderWidth: 4
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
    
    // Calculate daily goal (2000ml recommended)
    const dailyGoal = 2000;
    const goalData = groupedData.map(() => dailyGoal);

    const chartData = {
        labels: groupedData.map(item => item.date),
        datasets: [
            {
                label: 'Daily Water Intake',
                data: groupedData.map(item => item.totalAmount),
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: (ctx) => {
                    const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 400);
                    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
                    gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.2)');
                    gradient.addColorStop(1, 'rgba(59, 130, 246, 0.05)');
                    return gradient;
                },
                borderWidth: 4,
                tension: 0.4,
                fill: true,
                pointRadius: 8,
                pointHoverRadius: 12,
                pointBackgroundColor: (context) => {
                    const value = context.parsed.y;
                    if (value >= dailyGoal) return 'rgb(34, 197, 94)'; // Green for goal reached
                    if (value >= dailyGoal * 0.8) return 'rgb(245, 158, 11)'; // Yellow for close to goal
                    return 'rgb(239, 68, 68)'; // Red for below goal
                },
                pointBorderColor: '#ffffff',
                pointBorderWidth: 3,
                pointHoverBackgroundColor: 'rgb(29, 78, 216)',
                pointStyle: 'circle'
            },
            {
                label: 'Daily Goal (2L)',
                data: goalData,
                borderColor: 'rgba(34, 197, 94, 0.8)',
                backgroundColor: 'transparent',
                borderWidth: 3,
                borderDash: [10, 5],
                tension: 0,
                fill: false,
                pointRadius: 0,
                pointHoverRadius: 0
            }
        ]
    };    waterChartInstance = new Chart(ctx, {
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
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 14,
                            weight: '500'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: 'rgba(59, 130, 246, 0.8)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    padding: 12,
                    displayColors: true,
                    callbacks: {
                        title: function(context) {
                            return `💧 ${context[0].label}`;
                        },
                        label: function(context) {
                            if (context.datasetIndex === 0) {
                                const value = context.parsed.y;
                                const percentage = ((value / 2000) * 100).toFixed(0);
                                const status = value >= 2000 ? '🎯 Goal Reached!' : 
                                             value >= 1600 ? '👍 Close to goal' : '📈 Keep going!';
                                return [`💧 Water: ${value} ml`, `📊 ${percentage}% of goal`, status];
                            } else {
                                return `🎯 Daily Goal: ${context.parsed.y} ml`;
                            }
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)',
                        lineWidth: 1
                    },
                    ticks: {
                        color: '#6b7280',
                        font: {
                            size: 12,
                            weight: '500'
                        }
                    },
                    title: {
                        display: true,
                        text: '📅 Date',
                        color: '#374151',
                        font: {
                            size: 14,
                            weight: '600'
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    max: 3000, // Set a reasonable max for water intake
                    grid: {
                        color: 'rgba(59, 130, 246, 0.1)',
                        lineWidth: 1
                    },
                    ticks: {
                        color: '#6b7280',
                        font: {
                            size: 12,
                            weight: '500'
                        },
                        callback: function(value) {
                            if (value >= 1000) {
                                return (value / 1000).toFixed(1) + 'L';
                            }
                            return value + 'ml';
                        }
                    },
                    title: {
                        display: true,
                        text: '💧 Water Intake',
                        color: 'rgb(59, 130, 246)',
                        font: {
                            size: 14,
                            weight: '600'
                        }
                    }
                }
            },
            elements: {
                point: {
                    hoverBorderWidth: 4
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

    // Enhanced color palette with gradients
    const colorPalette = [
        {
            bg: 'rgba(139, 69, 19, 0.8)',     // Strength - Brown
            border: 'rgb(139, 69, 19)',
            emoji: '💪'
        },
        {
            bg: 'rgba(220, 38, 127, 0.8)',    // Cardio - Pink
            border: 'rgb(220, 38, 127)',
            emoji: '🏃'
        },
        {
            bg: 'rgba(251, 146, 60, 0.8)',    // HIIT - Orange
            border: 'rgb(251, 146, 60)',
            emoji: '⚡'
        },
        {
            bg: 'rgba(34, 197, 94, 0.8)',     // Flexibility - Green
            border: 'rgb(34, 197, 94)',
            emoji: '🧘'
        },
        {
            bg: 'rgba(99, 102, 241, 0.8)',    // Sports - Indigo
            border: 'rgb(99, 102, 241)',
            emoji: '⚽'
        },
        {
            bg: 'rgba(156, 163, 175, 0.8)',   // Other - Gray
            border: 'rgb(156, 163, 175)',
            emoji: '🔄'
        }
    ];

    const labels = Object.keys(activityTypes);
    const chartData = {
        labels: labels.map((label, index) => {
            const color = colorPalette[index % colorPalette.length];
            return `${color.emoji} ${label.charAt(0).toUpperCase() + label.slice(1)}`;
        }),
        datasets: [{
            label: 'Workout Distribution',
            data: Object.values(activityTypes),
            backgroundColor: labels.map((_, index) => {
                const color = colorPalette[index % colorPalette.length];
                return color.bg;
            }),
            borderColor: labels.map((_, index) => {
                const color = colorPalette[index % colorPalette.length];
                return color.border;
            }),
            borderWidth: 3,
            hoverBorderWidth: 5,
            hoverOffset: 15
        }]
    };    activityChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: {
                            size: 13,
                            weight: '500'
                        },
                        generateLabels: function(chart) {
                            const data = chart.data;
                            if (data.labels.length && data.datasets.length) {
                                return data.labels.map((label, index) => {
                                    return {
                                        text: label,
                                        fillStyle: data.datasets[0].backgroundColor[index],
                                        strokeStyle: data.datasets[0].borderColor[index],
                                        lineWidth: 2,
                                        pointStyle: 'circle'
                                    };
                                });
                            }
                            return [];
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: 'rgba(99, 102, 241, 0.8)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    padding: 12,
                    displayColors: true,
                    callbacks: {
                        title: function(context) {
                            return `🏋️ Activity Breakdown`;
                        },
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            const sessions = context.parsed;
                            const sessionText = sessions === 1 ? 'session' : 'sessions';
                            return [
                                `${context.label}`,
                                `📊 ${sessions} ${sessionText} (${percentage}%)`,
                                `🎯 ${((context.parsed / total) * 100).toFixed(0)}% of total workouts`
                            ];
                        }
                    }
                }
            },
            elements: {
                arc: {
                    borderWidth: 3,
                    hoverBorderWidth: 5
                }
            },
            animation: {
                animateRotate: true,
                animateScale: true,
                duration: 1000
            },
            hover: {
                mode: 'nearest',
                intersect: true
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

    // Calculate average calories for reference line
    const totalCalories = groupedData.reduce((sum, item) => sum + item.totalCalories, 0);
    const averageCalories = totalCalories / groupedData.length || 0;
    const averageData = groupedData.map(() => averageCalories);

    const chartData = {
        labels: groupedData.map(item => item.period),
        datasets: [
            {
                label: 'Calories Burned',
                data: groupedData.map(item => item.totalCalories),
                borderColor: 'rgb(239, 68, 68)',
                backgroundColor: (ctx) => {
                    const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 400);
                    gradient.addColorStop(0, 'rgba(239, 68, 68, 0.4)');
                    gradient.addColorStop(0.6, 'rgba(239, 68, 68, 0.2)');
                    gradient.addColorStop(1, 'rgba(239, 68, 68, 0.05)');
                    return gradient;
                },
                borderWidth: 4,
                tension: 0.4,
                fill: true,
                pointRadius: 8,
                pointHoverRadius: 12,
                pointBackgroundColor: (context) => {
                    const value = context.parsed.y;
                    if (value >= averageCalories * 1.2) return 'rgb(34, 197, 94)'; // Green for high burn
                    if (value >= averageCalories * 0.8) return 'rgb(239, 68, 68)'; // Red for normal
                    return 'rgb(245, 158, 11)'; // Yellow for low burn
                },
                pointBorderColor: '#ffffff',
                pointBorderWidth: 3,
                pointHoverBackgroundColor: 'rgb(220, 38, 38)',
                pointStyle: 'circle',
                shadowOffsetX: 2,
                shadowOffsetY: 2,
                shadowBlur: 8,
                shadowColor: 'rgba(239, 68, 68, 0.3)'
            },
            {
                label: 'Average Burn',
                data: averageData,
                borderColor: 'rgba(156, 163, 175, 0.8)',
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderDash: [8, 4],
                tension: 0,
                fill: false,
                pointRadius: 0,
                pointHoverRadius: 0
            }
        ]
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
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 14,
                            weight: '500'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: 'rgba(239, 68, 68, 0.8)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    padding: 12,
                    displayColors: true,
                    callbacks: {
                        title: function(context) {
                            return `🔥 ${context[0].label}`;
                        },
                        label: function(context) {
                            if (context.datasetIndex === 0) {
                                const value = context.parsed.y;
                                const percentOfAvg = ((value / averageCalories) * 100).toFixed(0);
                                const performance = value >= averageCalories * 1.2 ? '🔥 High Burn!' : 
                                                  value >= averageCalories * 0.8 ? '💪 Good Workout' : '📈 Room to grow';
                                return [`🔥 Burned: ${value} kcal`, `📊 ${percentOfAvg}% of average`, performance];
                            } else {
                                return `📈 Average: ${context.parsed.y.toFixed(0)} kcal`;
                            }
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)',
                        lineWidth: 1
                    },
                    ticks: {
                        color: '#6b7280',
                        font: {
                            size: 12,
                            weight: '500'
                        }
                    },
                    title: {
                        display: true,
                        text: timeframe === '7' ? '📅 Days' : timeframe === '30' ? '📅 Weeks' : '📅 Months',
                        color: '#374151',
                        font: {
                            size: 14,
                            weight: '600'
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(239, 68, 68, 0.1)',
                        lineWidth: 1
                    },
                    ticks: {
                        color: '#6b7280',
                        font: {
                            size: 12,
                            weight: '500'
                        },
                        callback: function(value) {
                            return value + ' kcal';
                        }
                    },
                    title: {
                        display: true,
                        text: '🔥 Calories Burned',
                        color: 'rgb(239, 68, 68)',
                        font: {
                            size: 14,
                            weight: '600'
                        }
                    }
                }
            },
            elements: {
                point: {
                    hoverBorderWidth: 4
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
    const timeframe = document.getElementById('nutritionTimeframe')?.value || '30';
    
    try {
        const nutritionData = await makeApiRequest(`/progress/nutrition?days=${timeframe}`, 'GET');
        
        if (nutritionData && nutritionData.length > 0) {
            if(noNutritionDataMsg) noNutritionDataMsg.style.display = 'none';
            renderNutritionChart(nutritionData);
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

function renderNutritionChart(data) {
    const ctx = document.getElementById('nutritionChart').getContext('2d');
    
    if (nutritionChartInstance) {
        nutritionChartInstance.destroy();
    }

    // Calculate daily goal (2000 calories recommended)
    const calorieGoal = 2000;
    const goalData = data.map(() => calorieGoal);

    const chartData = {
        labels: data.map(item => new Date(item.date).toLocaleDateString()),
        datasets: [
            {
                label: 'Daily Calories',
                data: data.map(item => item.total_calories),
                borderColor: 'rgb(168, 85, 247)',
                backgroundColor: (ctx) => {
                    const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 400);
                    gradient.addColorStop(0, 'rgba(168, 85, 247, 0.3)');
                    gradient.addColorStop(1, 'rgba(168, 85, 247, 0.05)');
                    return gradient;
                },
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBackgroundColor: (context) => {
                    const value = context.parsed.y;
                    if (Math.abs(value - calorieGoal) <= 100) return 'rgb(34, 197, 94)'; // Green for on target
                    if (value < calorieGoal * 0.8) return 'rgb(239, 68, 68)'; // Red for too low
                    return 'rgb(168, 85, 247)'; // Purple for normal
                },
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2
            },
            {
                label: 'Daily Goal (2000 kcal)',
                data: goalData,
                borderColor: 'rgba(34, 197, 94, 0.8)',
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderDash: [8, 4],
                tension: 0,
                fill: false,
                pointRadius: 0,
                pointHoverRadius: 0
            }
        ]
    };

    nutritionChartInstance = new Chart(ctx, {
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
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: {
                            size: 14,
                            weight: '500'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: 'rgba(168, 85, 247, 0.8)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    padding: 12,
                    displayColors: true,
                    callbacks: {
                        title: function(context) {
                            return `🍽️ ${context[0].label}`;
                        },
                        label: function(context) {
                            if (context.datasetIndex === 0) {
                                const value = context.parsed.y;
                                const goal = 2000;
                                const percentage = ((value / goal) * 100).toFixed(0);
                                const status = Math.abs(value - goal) <= 100 ? '🎯 On target!' :
                                             value < goal * 0.8 ? '📈 Below goal' : '⚠️ Above goal';
                                return [`🍽️ Calories: ${value} kcal`, `📊 ${percentage}% of goal`, status];
                            } else {
                                return `🎯 Goal: ${context.parsed.y} kcal`;
                            }
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)',
                        lineWidth: 1
                    },
                    ticks: {
                        color: '#6b7280',
                        font: {
                            size: 12,
                            weight: '500'
                        }
                    },
                    title: {
                        display: true,
                        text: '📅 Date',
                        color: '#374151',
                        font: {
                            size: 14,
                            weight: '600'
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(168, 85, 247, 0.1)',
                        lineWidth: 1
                    },
                    ticks: {
                        color: '#6b7280',
                        font: {
                            size: 12,
                            weight: '500'
                        }
                    },
                    title: {
                        display: true,
                        text: '🍽️ Daily Calories',
                        color: 'rgb(168, 85, 247)',
                        font: {
                            size: 14,
                            weight: '600'
                        }
                    }
                }
            },
            elements: {
                point: {
                    hoverBorderWidth: 4
                }
            },
            animation: {
                duration: 1000
            }
        }
    });
}