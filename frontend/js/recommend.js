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

// 添加用户选择处理
document.addEventListener('DOMContentLoaded', () => {
    // 获取DOM元素
    const userSelection = document.getElementById('user-selection');
    const newUserBtn = document.getElementById('new-user-btn');
    const returningUserBtn = document.getElementById('returning-user-btn');
    const newUserSection = document.getElementById('new-user-section');
    const returningUserSection = document.getElementById('returning-user-section');

    // 新用户选择
    newUserBtn.addEventListener('click', () => {
        userSelection.style.display = 'none';
        newUserSection.style.display = 'block';
        // 可以在这里添加新用户初始化逻辑
        localStorage.setItem('userType', 'new');
    });

    // 老用户选择
    returningUserBtn.addEventListener('click', () => {
        userSelection.style.display = 'none';
        returningUserSection.style.display = 'block';
        // 可以在这里加载老用户数据
        localStorage.setItem('userType', 'returning');
        loadLastOrder();
    });

    // 保持原有的推荐和评价功能不变
    document.getElementById('recommend-btn').addEventListener('click', getRecommend);
    document.getElementById('submit-btn').addEventListener('click', submitRating);
    document.getElementById('chat-send').addEventListener('click', chatWithBarista);
});

// 加载老用户上次订单
function loadLastOrder() {
    // 这里应该从后端API获取用户历史数据
    // 示例代码：
    fetch('http://localhost:3000/api/user/last-order')
        .then(res => res.json())
        .then(data => {
            document.getElementById('last-order-name').textContent = data.lastOrder || '暂无记录';
        })
        .catch(console.error);
}


// 新增引导流程处理
function setupOnboarding() {
    const steps = [
        document.getElementById('onboarding-step1'),
        document.getElementById('onboarding-step2'),
        document.getElementById('onboarding-step3')
    ];
    let currentStep = 0;
    let selectedPreferences = [];
    const userId = 'user-' + Math.random().toString(36).substr(2, 9);

    // 加载口味偏好选项
    fetch('http://localhost:3000/api/preference-options')
        .then(res => res.json())
        .then(options => {
            const container = document.getElementById('preference-options');
            options.forEach(opt => {
                const el = document.createElement('div');
                el.className = 'preference-option';
                el.textContent = opt.name;
                el.dataset.id = opt.id;
                el.addEventListener('click', () => {
                    el.classList.toggle('selected');
                    if(el.classList.contains('selected')) {
                        selectedPreferences.push(opt.id);
                    } else {
                        selectedPreferences = selectedPreferences.filter(id => id !== opt.id);
                    }
                });
                container.appendChild(el);
            });
        });

    // 下一步按钮处理
    document.querySelectorAll('.next-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // 验证当前步骤
            if(currentStep === 0 && !document.getElementById('user-name').value) {
                alert('请输入您的称呼');
                return;
            }

            steps[currentStep].style.display = 'none';
            currentStep++;
            
            if(currentStep === 2) { // 最后一步获取推荐
                const userName = document.getElementById('user-name').value;
                fetch('http://localhost:3000/api/user/onboarding', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId,
                        name: userName,
                        preferences: selectedPreferences
                    })
                }).then(() => {
                    // 获取首次推荐
                    return fetch('http://localhost:3000/recommend/new');
                }).then(res => res.json())
                .then(coffee => {
                    document.getElementById('first-recommendation').innerHTML = `
                        <h3>${coffee.name}</h3>
                        <p>类型：${coffee.type}</p>
                        <p>推荐理由：根据您的口味偏好精心挑选</p>
                    `;
                    steps[currentStep].style.display = 'block';
                });
            } else {
                steps[currentStep].style.display = 'block';
            }
        });
    });

    // 完成引导
    document.getElementById('start-exploring').addEventListener('click', () => {
        document.getElementById('new-user-section').style.display = 'none';
        document.getElementById('returning-user-section').style.display = 'block';
    });
}

// 在DOMContentLoaded中调用
document.addEventListener('DOMContentLoaded', () => {
    setupOnboarding();
});