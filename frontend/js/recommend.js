async function getRecommend() {
    const recommendBtn = document.getElementById('recommend-btn');
    const resultDiv = document.getElementById('new-recommend'); // 确保这行存在
    
    try {
        console.log('[前端] 开始推荐流程');
        recommendBtn.disabled = true;
        resultDiv.innerHTML = '<div class="loading">正在为您挑选咖啡...</div>';
        
        const res = await fetch('http://localhost:3000/recommend/new');
        console.log('[前端] 收到响应:', res);
        
        const data = await res.json();
        console.log('[前端] 解析数据:', data);
        
        let html = '<h3>今日推荐</h3>';
        data.forEach(coffee => {
            console.log('处理咖啡:', coffee.name);
            html += `
            <div class="coffee-card">
                <h4>${coffee.name}</h4>
                <p>类型：${coffee.type}</p>
                <p>推荐糖度：${coffee.sugar}份</p>
            </div>`;
        });
        
        resultDiv.innerHTML = html;
        console.log('界面更新完成');
        
    } catch (error) {
        console.error('[前端] 完整错误:', error);
        if(resultDiv) {  // 添加安全判断
            resultDiv.innerHTML = `<div class="error">请求失败: ${error.message}</div>`;
        }
    } finally {
        recommendBtn.disabled = false;
    }
}

async function submitRating() {
    const coffeeId = document.getElementById('coffee-select').value;
    const rating = document.getElementById('rating').value;
    
    try {
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
    } catch (error) {
        alert('提交失败: ' + error.message);
    }
}

// 新增聊天功能
async function chatWithBarista() {
    try {
        const chatHistory = document.getElementById('chat-history'); // 新增这行
        const response = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                message: document.getElementById('chat-input').value 
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || '请求失败');
        }

        const data = await response.json();
        chatHistory.innerHTML += `<div class="bot-msg">${data.reply}</div>`;
        
    } catch (error) {
        console.error('聊天错误:', error);
        // 显示错误提示给用户
    }
}

// 在DOMContentLoaded中添加事件监听
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('recommend-btn').addEventListener('click', getRecommend);
    document.getElementById('submit-btn').addEventListener('click', submitRating);
    document.getElementById('chat-send').addEventListener('click', chatWithBarista);
});