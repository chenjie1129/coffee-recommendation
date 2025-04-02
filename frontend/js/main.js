document.addEventListener('DOMContentLoaded', () => {
    // 获取推荐
    document.getElementById('recommend-btn').addEventListener('click', getRecommend);
    
    // 提交评价
    document.getElementById('submit-btn').addEventListener('click', submitRating);
});

async function getRecommend() {
    try {
        console.log('正在尝试连接到: http://localhost:3000/recommend/new');
        const res = await fetch('http://localhost:3000/recommend/new');
        
        if (!res.ok) {
            throw new Error(`HTTP错误! 状态码: ${res.status}`);
        }
        
        const data = await res.json();
    
        let html = '<h3>为您推荐：</h3>';
        data.forEach(coffee => {
            html += `
            <div class="coffee-card">
                <h4>${coffee.name}</h4>
                <p>类型：${coffee.type}</p>
                <p>推荐糖度：${coffee.sugar}份</p>
            </div>`;
        });
        
        document.getElementById('new-recommend').innerHTML = html;
    } catch (error) {
        console.error('完整错误详情:', error);
        if(resultDiv) {
            resultDiv.innerHTML = `
                <div class="error">
                    请求失败: ${error.message}<br>
                    请确保后端服务已启动<br>
                    <button onclick="location.reload()">重试</button>
                </div>`;
        }
    }
}

async function submitRating() {
    const coffeeId = document.getElementById('coffee-select').value;
    const rating = document.getElementById('rating').value;
    
    const response = await fetch('http://localhost:3000/order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            coffeeId,
            rating,
            customerId: 'test-user'
        })
    });
    
    alert('评价提交成功！');
}