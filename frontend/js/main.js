// 在DOM加载完成后添加用户状态检查
document.addEventListener('DOMContentLoaded', async () => {
    // 检查用户状态
    const isNewUser = await checkUserStatus();
    
    // 根据用户状态设置界面
    setupUI(isNewUser);
    
    // 事件监听
    document.getElementById('recommend-btn').addEventListener('click', getRecommend);
    document.getElementById('submit-btn').addEventListener('click', submitRating);
});

// 检查用户状态
async function checkUserStatus() {
    try {
        const response = await fetch('http://localhost:3000/api/user/status');
        const data = await response.json();
        return data.isNewUser;
    } catch {
        return true; // 默认视为新用户
    }
}

// 设置界面显示
function setupUI(isNewUser) {
    const newUserSection = document.getElementById('new-user-section');
    const returningUserSection = document.getElementById('returning-user-section');
    
    if(isNewUser) {
        newUserSection.style.display = 'block';
        returningUserSection.style.display = 'none';
    } else {
        newUserSection.style.display = 'none';
        returningUserSection.style.display = 'block';
    }
}

async function getRecommend() {
    const recommendBtn = document.getElementById('recommend-btn');
    const resultDiv = document.getElementById('new-recommend');
    
    try {
        recommendBtn.disabled = true;
        resultDiv.innerHTML = '<div class="loading">正在为您挑选咖啡...</div>';
        
        const res = await fetch('http://localhost:3000/recommend/new');
        const coffee = await res.json(); // 直接获取单个咖啡对象
        
        let html = '<h3>今日推荐</h3>';
        html += `
        <div class="coffee-card">
            <h4>${coffee.name}</h4>
            <p>类型：${coffee.type}</p>
            <p>推荐糖度：${coffee.sugar}份</p>
        </div>`;
        
        resultDiv.innerHTML = html;
        
    } catch (error) {
        console.error('完整错误详情:', error);
        if(resultDiv) {
            resultDiv.innerHTML = `<div class="error">请求失败: ${error.message}</div>`;
        }
    } finally {
        recommendBtn.disabled = false;
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