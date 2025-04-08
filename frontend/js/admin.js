// 初始化图表
let growthChart;

// 加载管理数据
async function loadAdminData() {
    try {
        const response = await fetch('http://localhost:3000/api/admin/dashboard');
        const data = await response.json();
        
        // 更新统计数据
        document.getElementById('total-users').textContent = data.totalUsers || 0;
        document.getElementById('total-orders').textContent = data.totalOrders || 0;
        
        // 添加防御性检查
        const popularCoffeeText = data.popularCoffee && data.popularCoffee.length >= 2 
            ? `#${data.popularCoffee[0]} (${data.popularCoffee[1]}次)` 
            : '暂无数据';
        document.getElementById('popular-coffee').textContent = popularCoffeeText;
        
        document.getElementById('avg-rating').textContent = data.averageRating || '0';
        
        // 更新最近订单表格
        const tbody = document.querySelector('#recent-orders tbody');
        tbody.innerHTML = '';
        data.recentOrders.forEach(order => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${order._id || 'N/A'}</td>
                <td>${getCoffeeName(order.coffeeId)}</td>
                <td>${order.rating || '-'}</td>
                <td>${new Date(order.timestamp || Date.now()).toLocaleString()}</td>
            `;
            tbody.appendChild(tr);
        });
        
        // 更新用户增长图表
        updateGrowthChart(data.userGrowth);
        
    } catch (error) {
        console.error('加载管理数据失败:', error);
        // 添加错误显示
        document.getElementById('popular-coffee').textContent = '加载失败';
        document.getElementById('avg-rating').textContent = '加载失败';
    }
}

// 更新用户增长图表
function updateGrowthChart(growthData) {
    const ctx = document.getElementById('user-growth-chart').getContext('2d');
    const labels = Object.keys(growthData);
    const data = Object.values(growthData);
    
    if (growthChart) {
        growthChart.destroy();
    }
    
    growthChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '用户增长',
                data: data,
                backgroundColor: 'rgba(111, 78, 55, 0.2)',
                borderColor: 'rgba(111, 78, 55, 1)',
                borderWidth: 2,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: '用户增长趋势'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// 辅助函数：获取咖啡名称
function getCoffeeName(coffeeId) {
    const coffeeMap = {
        '1': '美式咖啡',
        '2': '拿铁咖啡',
        '3': '冷萃咖啡'
    };
    return coffeeMap[coffeeId] || `咖啡#${coffeeId}`;
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
    loadAdminData();
    
    // 设置定时刷新数据
    setInterval(loadAdminData, 60000); // 每分钟刷新一次
});