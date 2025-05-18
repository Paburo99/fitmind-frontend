import { makeApiRequest } from './apiService.js'; // If using modules
import { displayMessage } from './utils.js'; // If using modules

let weightChartInstance = null; // To store the chart instance for updates/destruction

document.addEventListener('DOMContentLoaded', async () => {
    await loadWeightChartData();

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

async function loadWeightChartData() {
    const noWeightDataMsg = document.getElementById('noWeightDataMessage');
    try {
        const weightData = await makeApiRequest('/progress/weight', 'GET');
        
        if (weightData && weightData.length > 0) {
            if(noWeightDataMsg) noWeightDataMsg.style.display = 'none';
            renderWeightChart(weightData);
        } else {
            console.log('No weight data to display.');
            if(noWeightDataMsg) noWeightDataMsg.style.display = 'block';
            if (weightChartInstance) { // Clear previous chart if exists
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
        weightChartInstance.destroy(); // Destroy existing chart before rendering new one
    }

    const chartData = {
        labels: data.map(item => new Date(item.date)), // Chart.js will format this
        datasets: [{
            label: 'Weight (kg)',
            data: data.map(item => item.weight_kg),
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
            fill: false
        }]
    };

    weightChartInstance = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day', // Adjust unit based on data density (day, week, month)
                         tooltipFormat: 'MMM dd, yyyy', // e.g., Jan 01, 2023
                        displayFormats: {
                           day: 'MMM dd' // e.g. Jan 01
                        }
                    },
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    beginAtZero: false, // Adjust based on your data range
                    title: {
                        display: true,
                        text: 'Weight (kg)'
                    }
                }
            }
        }
    });
}