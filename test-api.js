// 线上环境API测试脚本
const https = require('https');
const http = require('http');

// 测试服务器列表
const servers = [
    'https://ohciuodbxwdp.sealosbja.site',  // 线上环境
    'https://glbbvnrguhix.sealosbja.site'   // 调试环境
];

// 测试连接函数
function testConnection(url) {
    return new Promise((resolve) => {
        const client = url.startsWith('https') ? https : http;
        const startTime = Date.now();
        
        const req = client.get(url + '/health', (res) => {
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
                        message: jsonData.message || 'OK',
                        data: jsonData
                    });
                } catch (e) {
                    resolve({
                        url,
                        status: 'success',
                        statusCode: res.statusCode,
                        responseTime: `${responseTime}ms`,
                        message: 'Response received but not JSON',
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
                message: error.message,
                error: error
            });
        });
        
        req.setTimeout(10000, () => {
            req.destroy();
            resolve({
                url,
                status: 'error',
                statusCode: 0,
                responseTime: 'timeout',
                message: 'Connection timeout (10s)',
                error: 'timeout'
            });
        });
    });
}

// 测试登录API
function testLogin(url, username, password) {
    return new Promise((resolve) => {
        const postData = JSON.stringify({
            username: username,
            password: password
        });
        
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
                'Accept': 'application/json'
            }
        };
        
        const client = url.startsWith('https') ? https : http;
        const startTime = Date.now();
        
        const req = client.request(url + '/api/auth/login', options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const responseTime = Date.now() - startTime;
                try {
                    const jsonData = JSON.parse(data);
                    resolve({
                        url,
                        status: res.statusCode === 200 ? 'success' : 'error',
                        statusCode: res.statusCode,
                        responseTime: `${responseTime}ms`,
                        message: jsonData.msg || jsonData.message || 'Login response',
                        data: jsonData
                    });
                } catch (e) {
                    resolve({
                        url,
                        status: 'error',
                        statusCode: res.statusCode,
                        responseTime: `${responseTime}ms`,
                        message: 'Invalid JSON response',
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
                message: error.message,
                error: error
            });
        });
        
        req.setTimeout(10000, () => {
            req.destroy();
            resolve({
                url,
                status: 'error',
                statusCode: 0,
                responseTime: 'timeout',
                message: 'Login request timeout (10s)',
                error: 'timeout'
            });
        });
        
        req.write(postData);
        req.end();
    });
}

// 主测试函数
async function runTests() {
    console.log('🚀 EchoSoul AI Platform - 线上环境测试');
    console.log('='.repeat(50));
    console.log(`测试时间: ${new Date().toLocaleString()}`);
    console.log('');
    
    // 测试连接
    console.log('📡 测试API服务器连接...');
    console.log('-'.repeat(30));
    
    for (const server of servers) {
        const result = await testConnection(server);
        const status = result.status === 'success' ? '✅' : '❌';
        console.log(`${status} ${server}`);
        console.log(`   状态码: ${result.statusCode}`);
        console.log(`   响应时间: ${result.responseTime}`);
        console.log(`   消息: ${result.message}`);
        if (result.data) {
            console.log(`   数据: ${JSON.stringify(result.data, null, 2)}`);
        }
        console.log('');
    }
    
    // 测试登录（使用测试账号）
    console.log('🔐 测试登录功能...');
    console.log('-'.repeat(30));
    
    const testCredentials = [
        { username: 'test', password: 'test123' },
        { username: 'admin', password: 'admin123' },
        { username: 'user', password: 'user123' }
    ];
    
    for (const server of servers) {
        console.log(`\n测试服务器: ${server}`);
        
        for (const cred of testCredentials) {
            const result = await testLogin(server, cred.username, cred.password);
            const status = result.status === 'success' ? '✅' : '❌';
            console.log(`  ${status} ${cred.username}/${cred.password}`);
            console.log(`    状态码: ${result.statusCode}`);
            console.log(`    响应时间: ${result.responseTime}`);
            console.log(`    消息: ${result.message}`);
            
            if (result.data && result.data.code === 1) {
                console.log(`    登录成功! 用户ID: ${result.data.data?.userInfo?.id}`);
                console.log(`    Token: ${result.data.data?.token?.substring(0, 20)}...`);
            }
        }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('测试完成!');
}

// 运行测试
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = { testConnection, testLogin, runTests };

