// Analytics Charts Service
class AnalyticsCharts {
    constructor() {
        this.charts = {};
    }

    createRevenueChart(canvasId, data) {
        const ctx = document.getElementById(canvasId)?.getContext('2d');
        if (!ctx) return;

        this.charts[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Revenue',
                    data: data.revenue || [0, 0, 0, 0, 0, 0],
                    borderColor: '#6B46C1',
                    backgroundColor: 'rgba(107, 70, 193, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'Transactions',
                    data: data.transactions || [0, 0, 0, 0, 0, 0],
                    borderColor: '#4299E1',
                    backgroundColor: 'rgba(66, 153, 225, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    }
                }
            }
        });
    }

    createUserGrowthChart(canvasId, data) {
        const ctx = document.getElementById(canvasId)?.getContext('2d');
        if (!ctx) return;

        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'New Users',
                    data: data.users || [0, 0, 0, 0, 0, 0],
                    backgroundColor: 'rgba(107, 70, 193, 0.8)',
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    }
                }
            }
        });
    }

    createSpendingChart(canvasId, data) {
        const ctx = document.getElementById(canvasId)?.getContext('2d');
        if (!ctx) return;

        this.charts[canvasId] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.categories || ['Shopping', 'Food', 'Transport', 'Entertainment', 'Bills'],
                datasets: [{
                    data: data.amounts || [0, 0, 0, 0, 0],
                    backgroundColor: [
                        '#6B46C1',
                        '#4299E1',
                        '#48BB78',
                        '#ECC94B',
                        '#F56565'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
                cutout: '70%'
            }
        });
    }

    updateChart(chartId, newData) {
        const chart = this.charts[chartId];
        if (chart) {
            chart.data.datasets.forEach((dataset, index) => {
                if (newData.datasets && newData.datasets[index]) {
                    dataset.data = newData.datasets[index].data;
                }
            });
            
            if (newData.labels) {
                chart.data.labels = newData.labels;
            }
            
            chart.update();
        }
    }

    async loadUserAnalytics(userId, period = 'month') {
        try {
            const startDate = new Date();
            if (period === 'month') {
                startDate.setMonth(startDate.getMonth() - 1);
            } else if (period === 'year') {
                startDate.setFullYear(startDate.getFullYear() - 1);
            }

            const transactions = await db.collection(COLLECTIONS.USERS).doc(userId)
                .collection(COLLECTIONS.TRANSACTIONS)
                .where('createdAt', '>=', startDate)
                .orderBy('createdAt')
                .get();

            const spendingByCategory = {};
            const dailySpending = {};

            transactions.forEach(doc => {
                const tx = doc.data();
                const category = tx.category || 'Other';
                const date = tx.createdAt.toDate().toLocaleDateString();
                
                spendingByCategory[category] = (spendingByCategory[category] || 0) + tx.amount;
                dailySpending[date] = (dailySpending[date] || 0) + tx.amount;
            });

            return {
                categories: Object.keys(spendingByCategory),
                amounts: Object.values(spendingByCategory),
                dailyLabels: Object.keys(dailySpending),
                dailyAmounts: Object.values(dailySpending)
            };

        } catch (error) {
            console.error('Error loading analytics:', error);
            return null;
        }
    }
}

// Initialize charts
const analyticsCharts = new AnalyticsCharts();
