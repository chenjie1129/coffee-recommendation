const express = require('express');
const { PythonShell } = require('python-shell');
const fs = require('fs'); // 文件系统模块
const path = require('path'); // 路径处理模块

// 创建Express应用实例
const app = express();

/**
 * 中间件配置
 * express.static: 托管前端静态文件
 * express.json: 解析JSON格式的请求体
 */
// 确保Express正确配置静态文件路径
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(express.json());

/**
 * 内存数据库结构
 * customers: 以customerId为键的客户数据
 * orders: 所有订单记录的数组
 */
let database = {
  customers: {},
  orders: []
};

/**
 * 新用户推荐接口
 * 路径: /recommend/new
 * 方法: GET
 * 输入: 无
 * 输出: JSON格式的推荐咖啡列表
 */
// 确保有/recommend/new路由
app.get('/recommend/new', async (req, res) => {
    console.log('收到推荐请求');
    
    const options = {
        mode: 'text',
        pythonPath: '/usr/bin/python3',
        scriptPath: __dirname,
        args: ['new', '--limit=1']  // 新增limit参数限制为1种
    };

    try {
        console.log('正在调用Python脚本...');
        const pyshell = new PythonShell('recommend.py', options);
        
        let output = '';
        pyshell.on('message', (message) => {
            console.log('Python输出:', message);
            output += message;
        });

        pyshell.end((err) => {
            if(err) {
                console.error('Python执行错误:', err);
                return res.status(500).json({error: err.message});
            }
            console.log('Python执行完成，输出:', output);
            try {
                const data = JSON.parse(output);
                // 确保只返回1种咖啡
                if(Array.isArray(data)) {
                    res.json(data[0]);  // 只返回数组第一个元素
                } else {
                    res.json(data);
                }
            } catch(e) {
                console.error('JSON解析错误:', e);
                res.status(500).json({error: '无效的JSON格式'});
            }
        });
    } catch(err) {
        console.error('捕获到异常:', err);
        res.status(500).json({error: err.message});
    }
});

/**
 * 订单提交接口
 * 路径: /order
 * 方法: POST
 * 输入: 
 *   - customerId: 客户ID
 *   - coffeeId: 咖啡ID
 *   - rating: 评分(1-5)
 * 输出: 
 *   - success: 操作是否成功
 */
app.post('/order', (req, res) => {
  const order = req.body;
  
  // 数据验证
  if(!order.customerId || !order.coffeeId) {
    return res.status(400).json({ error: '缺少必要参数' });
  }

  database.orders.push(order);
  
  // 初始化新客户记录
  if (!database.customers[order.customerId]) {
    database.customers[order.customerId] = { 
      preferences: [],
      lastOrder: null 
    };
  }
  
  // 更新客户最后订单
  database.customers[order.customerId].lastOrder = order;
  
  // 持久化到文件
  fs.writeFileSync('database.json', JSON.stringify(database));
  res.json({ success: true });
});

/**
 * 根路径路由
 * 返回前端页面入口文件
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// 启动服务器
app.listen(3000, () => console.log('服务已启动: http://localhost:3000'));

// 新增DeepSeek对话接口
app.post('/api/chat', express.json(), async (req, res) => {
    try {
        const { message } = req.body;
        
        // 打印用户发送的消息
        console.log('用户消息:', message);
        
        require('dotenv').config();
        const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
        
        const requestBody = {
            model: "deepseek-chat",
            messages: [{
                role: "system",
                content: "你是一个专业的咖啡师助手，帮助用户选择适合的咖啡。"
            }, {
                role: "user",
                content: message
            }]
        };

        // 打印请求体
        console.log('发送给DeepSeek的请求:', JSON.stringify(requestBody, null, 2));
        
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`API请求失败: ${response.status}`);
        }

        const data = await response.json();
        
        // 打印DeepSeek的完整响应
        console.log('DeepSeek API响应:', JSON.stringify(data, null, 2));
        
        res.json({ reply: data.choices[0].message.content });
        
    } catch (error) {
        console.error('聊天接口错误:', error);
        res.status(500).json({ error: error.message });
    }
});
// 修改文件末尾部分：
// 移除重复的path声明
require('dotenv').config({ 
    path: path.join(__dirname, '.env') 
});

// 测试环境变量
console.log('API Key:', process.env.DEEPSEEK_API_KEY);
console.log('API Key长度:', process.env.DEEPSEEK_API_KEY?.length);

// 添加用户状态检查接口
app.get('/api/user/status', (req, res) => {
    // 这里应该根据实际业务逻辑检查用户状态
    // 示例：假设通过cookie或token识别用户
    const userId = req.cookies?.userId || req.headers['x-user-id'];
    const isNewUser = !database.customers[userId];
    
    res.json({ isNewUser });
});

// 添加获取用户最后订单接口
app.get('/api/user/last-order', (req, res) => {
    // 这里应该根据实际业务获取用户最后订单
    // 示例代码：
    const userId = req.cookies?.userId || req.headers['x-user-id'];
    const user = database.customers[userId];
    
    if(user && user.lastOrder) {
        res.json({ lastOrder: user.lastOrder.coffeeId });
    } else {
        res.json({ lastOrder: null });
    }
});

// 新增用户引导状态接口
app.post('/api/user/onboarding', (req, res) => {
    const { userId, name, preferences } = req.body;
    
    // 初始化用户数据
    if (!database.customers[userId]) {
        database.customers[userId] = {
            name,
            preferences: preferences || [],
            onboardingComplete: false,
            lastOrder: null
        };
    }
    
    // 标记引导完成
    database.customers[userId].onboardingComplete = true;
    fs.writeFileSync('database.json', JSON.stringify(database));
    
    res.json({ success: true });
});

// 新增口味偏好选项接口
app.get('/api/preference-options', (req, res) => {
    res.json([
        { id: 'sweet', name: '甜味' },
        { id: 'bitter', name: '苦味' },
        { id: 'fruity', name: '果香' },
        { id: 'nutty', name: '坚果香' },
        { id: 'strong', name: '浓郁' }
    ]);
});

// 新增管理数据接口
app.get('/api/admin/dashboard', (req, res) => {
    try {
        const stats = {
            totalUsers: Object.keys(database.customers).length,
            totalOrders: database.orders.length,
            popularCoffee: getPopularCoffee(),
            averageRating: getAverageRating(),
            userGrowth: getUserGrowthData(),
            recentOrders: database.orders.slice(-10).reverse()
        };
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 辅助函数
function getPopularCoffee() {
    const count = {};
    database.orders.forEach(order => {
        count[order.coffeeId] = (count[order.coffeeId] || 0) + 1;
    });
    return Object.entries(count).sort((a, b) => b[1] - a[1])[0];
}

function getAverageRating() {
    if (database.orders.length === 0) return 0;
    const sum = database.orders.reduce((acc, order) => acc + (order.rating || 0), 0);
    return (sum / database.orders.length).toFixed(1);
}

function getUserGrowthData() {
    // 按日期统计用户增长
    const growth = {};
    Object.values(database.customers).forEach(user => {
        const date = new Date(user.createdAt || Date.now()).toLocaleDateString();
        growth[date] = (growth[date] || 0) + 1;
    });
    return growth;
}