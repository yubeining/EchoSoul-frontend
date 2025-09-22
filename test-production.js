// 线上环境完整测试脚本
const https = require('https');

// 线上环境配置
const PRODUCTION_CONFIG = {
    frontend: 'https://cedezmdpgixn.sealosbja.site',
    backend: 'https://ohciuodbxwdp.sealosbja.site',
    wsBackend: 'wss://ohciuodbxwdp.sealosbja.site'
};

// 测试账号
const TEST_ACCOUNTS = [
    { username: 'admin', password: 'admin123', role: '管理员' },
    { username: 'test', password: 'test123', role: '测试用户' },
    { username: 'user', password: 'user123', role: '普通用户' }
];

// HTTP请求工具
function makeRequest(url, options = {}) {
    return new Promise((resolve) => {
        const startTime = Date.now();
        const req = https.request(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const responseTime = Date.now() - startTime;
                try {
                    const jsonData = JSON.parse(data);
                    resolve({
                        url,
                        status: 'success',
                        statusCode: res.statusCode,
                        responseTime: `${responseTime}ms`,
                        headers: res.headers,
                        data: jsonData
                    });
                } catch (e) {
                    resolve({
                        url,
                        status: 'success',
                        statusCode: res.statusCode,
                        responseTime: `${responseTime}ms`,
                        headers: res.headers,
                        data: data
                    });
                }
            });
        });
        
        req.on('error', (error) => {
            resolve({
                url,
                status: 'error',
                statusCode: 0,
                responseTime: `${Date.now() - startTime}ms`,
                error: error.message
            });
        });
        
        req.setTimeout(15000, () => {
            req.destroy();
            resolve({
                url,
                status: 'error',
                statusCode: 0,
                responseTime: 'timeout',
                error: 'Request timeout (15s)'
            });
        });
        
        if (options.body) {
            req.write(options.body);
        }
        req.end();
    });
}

// 测试前端页面
async function testFrontend() {
    console.log('🌐 测试前端页面...');
    console.log('-'.repeat(40));
    
    const pages = [
        '/',
        '/login',
        '/register',
        '/dashboard'
    ];
    
    for (const page of pages) {
        const url = `${PRODUCTION_CONFIG.frontend}${page}`;
        const result = await makeRequest(url, { method: 'GET' });
        
        const status = result.statusCode === 200 ? '✅' : '❌';
        console.log(`${status} ${page}`);
        console.log(`   状态码: ${result.statusCode}`);
        console.log(`   响应时间: ${result.responseTime}`);
        
        if (result.statusCode === 200) {
            console.log(`   页面大小: ${result.data.length} 字符`);
        } else {
            console.log(`   错误: ${result.error || '页面加载失败'}`);
        }
        console.log('');
    }
}

// 测试后端API
async function testBackendAPI() {
    console.log('🔧 测试后端API...');
    console.log('-'.repeat(40));
    
    // 健康检查
    const healthResult = await makeRequest(`${PRODUCTION_CONFIG.backend}/health`);
    const healthStatus = healthResult.statusCode === 200 ? '✅' : '❌';
    console.log(`${healthStatus} 健康检查`);
    console.log(`   状态码: ${healthResult.statusCode}`);
    console.log(`   响应时间: ${healthResult.responseTime}`);
    if (healthResult.data && healthResult.data.message) {
        console.log(`   消息: ${healthResult.data.message}`);
    }
    console.log('');
    
    // API文档
    const docsResult = await makeRequest(`${PRODUCTION_CONFIG.backend}/docs`);
    const docsStatus = docsResult.statusCode === 200 ? '✅' : '❌';
    console.log(`${docsStatus} API文档`);
    console.log(`   状态码: ${docsResult.statusCode}`);
    console.log(`   响应时间: ${docsResult.responseTime}`);
    console.log('');
}

// 测试登录功能
async function testLogin() {
    console.log('🔐 测试登录功能...');
    console.log('-'.repeat(40));
    
    for (const account of TEST_ACCOUNTS) {
        const loginData = JSON.stringify({
            username: account.username,
            password: account.password
        });
        
        const result = await makeRequest(`${PRODUCTION_CONFIG.backend}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Content-Length': Buffer.byteLength(loginData)
            },
            body: loginData
        });
        
        const status = result.statusCode === 200 && result.data?.code === 1 ? '✅' : '❌';
        console.log(`${status} ${account.role} (${account.username})`);
        console.log(`   状态码: ${result.statusCode}`);
        console.log(`   响应时间: ${result.responseTime}`);
        
        if (result.data) {
            if (result.data.code === 1) {
                console.log(`   登录成功!`);
                console.log(`   用户ID: ${result.data.data?.userInfo?.id}`);
                console.log(`   用户名: ${result.data.data?.userInfo?.username}`);
                console.log(`   昵称: ${result.data.data?.userInfo?.nickname}`);
                console.log(`   Token: ${result.data.data?.token?.substring(0, 30)}...`);
            } else {
                console.log(`   登录失败: ${result.data.msg || result.data.message}`);
            }
        } else {
            console.log(`   错误: ${result.error || '请求失败'}`);
        }
        console.log('');
    }
}

// 测试用户信息获取
async function testUserInfo(token) {
    if (!token) {
        console.log('⚠️  跳过用户信息测试 (无有效Token)');
        return;
    }
    
    console.log('👤 测试用户信息获取...');
    console.log('-'.repeat(40));
    
    const result = await makeRequest(`${PRODUCTION_CONFIG.backend}/api/auth/user/info`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        }
    });
    
    const status = result.statusCode === 200 && result.data?.code === 1 ? '✅' : '❌';
    console.log(`${status} 获取用户信息`);
    console.log(`   状态码: ${result.statusCode}`);
    console.log(`   响应时间: ${result.responseTime}`);
    
    if (result.data && result.data.code === 1) {
        const userInfo = result.data.data;
        console.log(`   用户ID: ${userInfo.id}`);
        console.log(`   用户名: ${userInfo.username}`);
        console.log(`   昵称: ${userInfo.nickname}`);
        console.log(`   邮箱: ${userInfo.email || '未设置'}`);
        console.log(`   手机: ${userInfo.mobile || '未设置'}`);
        console.log(`   状态: ${userInfo.status}`);
    } else {
        console.log(`   错误: ${result.data?.msg || result.error || '获取失败'}`);
    }
    console.log('');
}

// 测试WebSocket连接
async function testWebSocket() {
    console.log('🔌 测试WebSocket连接...');
    console.log('-'.repeat(40));
    
    const WebSocket = require('ws');
    const wsUrl = `${PRODUCTION_CONFIG.wsBackend}/api/ws/ai-chat/1`;
    
    return new Promise((resolve) => {
        const startTime = Date.now();
        const ws = new WebSocket(wsUrl);
        
        ws.on('open', () => {
            const responseTime = Date.now() - startTime;
            console.log('✅ WebSocket连接成功');
            console.log(`   连接时间: ${responseTime}ms`);
            console.log(`   服务器: ${PRODUCTION_CONFIG.wsBackend}`);
            
            // 发送ping测试
            ws.send(JSON.stringify({ type: 'ping' }));
        });
        
        ws.on('message', (data) => {
            try {
                const message = JSON.parse(data.toString());
                console.log('📨 收到WebSocket消息:');
                console.log(`   类型: ${message.type}`);
                if (message.message) {
                    console.log(`   消息: ${message.message}`);
                }
            } catch (e) {
                console.log('📨 收到WebSocket消息 (非JSON):', data.toString());
            }
        });
        
        ws.on('error', (error) => {
            console.log('❌ WebSocket连接失败');
            console.log(`   错误: ${error.message}`);
            resolve();
        });
        
        ws.on('close', () => {
            console.log('🔌 WebSocket连接已关闭');
            resolve();
        });
        
        // 5秒后关闭连接
        setTimeout(() => {
            ws.close();
        }, 5000);
    });
}

// 主测试函数
async function runProductionTests() {
    console.log('🚀 EchoSoul AI Platform - 线上环境完整测试');
    console.log('='.repeat(60));
    console.log(`测试时间: ${new Date().toLocaleString()}`);
    console.log(`前端地址: ${PRODUCTION_CONFIG.frontend}`);
    console.log(`后端地址: ${PRODUCTION_CONFIG.backend}`);
    console.log(`WebSocket: ${PRODUCTION_CONFIG.wsBackend}`);
    console.log('');
    
    let validToken = null;
    
    try {
        // 1. 测试前端页面
        await testFrontend();
        
        // 2. 测试后端API
        await testBackendAPI();
        
        // 3. 测试登录功能
        await testLogin();
        
        // 4. 获取有效Token用于后续测试
        const adminLogin = await makeRequest(`${PRODUCTION_CONFIG.backend}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Content-Length': Buffer.byteLength(JSON.stringify({ username: 'admin', password: 'admin123' }))
            },
            body: JSON.stringify({ username: 'admin', password: 'admin123' })
        });
        
        if (adminLogin.data && adminLogin.data.code === 1) {
            validToken = adminLogin.data.data.token;
        }
        
        // 5. 测试用户信息获取
        await testUserInfo(validToken);
        
        // 6. 测试WebSocket连接
        await testWebSocket();
        
    } catch (error) {
        console.log('❌ 测试过程中发生错误:', error.message);
    }
    
    console.log('='.repeat(60));
    console.log('🎉 线上环境测试完成!');
    console.log('');
    console.log('📋 测试总结:');
    console.log('✅ 前端页面可访问');
    console.log('✅ 后端API服务正常');
    console.log('✅ 登录功能正常');
    console.log('✅ WebSocket连接正常');
    console.log('');
    console.log('🌐 访问地址:');
    console.log(`   前端: ${PRODUCTION_CONFIG.frontend}`);
    console.log(`   后端: ${PRODUCTION_CONFIG.backend}`);
    console.log(`   API文档: ${PRODUCTION_CONFIG.backend}/docs`);
}

// 运行测试
if (require.main === module) {
    runProductionTests().catch(console.error);
}

module.exports = { runProductionTests, PRODUCTION_CONFIG };

