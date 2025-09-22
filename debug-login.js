// 登录问题诊断脚本
const https = require('https');

// 线上环境配置
const PRODUCTION_CONFIG = {
    frontend: 'https://cedezmdpgixn.sealosbja.site',
    backend: 'https://ohciuodbxwdp.sealosbja.site',
    backupBackend: 'https://glbbvnrguhix.sealosbja.site'
};

// 测试CORS预检请求
async function testCorsPreflight() {
    console.log('🔍 测试CORS预检请求...');
    console.log('-'.repeat(40));
    
    const servers = [PRODUCTION_CONFIG.backend, PRODUCTION_CONFIG.backupBackend];
    
    for (const server of servers) {
        console.log(`\n测试服务器: ${server}`);
        
        // 测试OPTIONS预检请求
        const optionsResult = await makeRequest(`${server}/api/auth/login`, {
            method: 'OPTIONS',
            headers: {
                'Origin': PRODUCTION_CONFIG.frontend,
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type,Authorization'
            }
        });
        
        console.log(`OPTIONS预检请求:`);
        console.log(`  状态码: ${optionsResult.statusCode}`);
        console.log(`  响应时间: ${optionsResult.responseTime}`);
        
        if (optionsResult.headers) {
            const corsHeaders = {
                'Access-Control-Allow-Origin': optionsResult.headers['access-control-allow-origin'],
                'Access-Control-Allow-Methods': optionsResult.headers['access-control-allow-methods'],
                'Access-Control-Allow-Headers': optionsResult.headers['access-control-allow-headers'],
                'Access-Control-Allow-Credentials': optionsResult.headers['access-control-allow-credentials']
            };
            console.log(`  CORS头信息:`, corsHeaders);
        }
        
        if (optionsResult.error) {
            console.log(`  错误: ${optionsResult.error}`);
        }
    }
}

// 测试实际登录请求
async function testLoginRequest() {
    console.log('\n🔐 测试实际登录请求...');
    console.log('-'.repeat(40));
    
    const servers = [PRODUCTION_CONFIG.backend, PRODUCTION_CONFIG.backupBackend];
    const loginData = JSON.stringify({
        username: 'admin',
        password: 'admin123'
    });
    
    for (const server of servers) {
        console.log(`\n测试服务器: ${server}`);
        
        const result = await makeRequest(`${server}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Origin': PRODUCTION_CONFIG.frontend,
                'Content-Length': Buffer.byteLength(loginData)
            },
            body: loginData
        });
        
        console.log(`POST登录请求:`);
        console.log(`  状态码: ${result.statusCode}`);
        console.log(`  响应时间: ${result.responseTime}`);
        
        if (result.data) {
            if (result.data.code === 1) {
                console.log(`  ✅ 登录成功!`);
                console.log(`  用户ID: ${result.data.data?.userInfo?.id}`);
                console.log(`  Token: ${result.data.data?.token?.substring(0, 30)}...`);
            } else {
                console.log(`  ❌ 登录失败: ${result.data.msg || result.data.message}`);
            }
        } else {
            console.log(`  错误: ${result.error || '请求失败'}`);
        }
    }
}

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
                        statusCode: res.statusCode,
                        responseTime: `${responseTime}ms`,
                        headers: res.headers,
                        data: jsonData
                    });
                } catch (e) {
                    resolve({
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
                statusCode: 0,
                responseTime: `${Date.now() - startTime}ms`,
                error: error.message
            });
        });
        
        req.setTimeout(10000, () => {
            req.destroy();
            resolve({
                statusCode: 0,
                responseTime: 'timeout',
                error: 'Request timeout (10s)'
            });
        });
        
        if (options.body) {
            req.write(options.body);
        }
        req.end();
    });
}

// 主诊断函数
async function runDiagnosis() {
    console.log('🔍 EchoSoul AI Platform - 登录问题诊断');
    console.log('='.repeat(50));
    console.log(`诊断时间: ${new Date().toLocaleString()}`);
    console.log(`前端地址: ${PRODUCTION_CONFIG.frontend}`);
    console.log(`主后端: ${PRODUCTION_CONFIG.backend}`);
    console.log(`备用后端: ${PRODUCTION_CONFIG.backupBackend}`);
    console.log('');
    
    try {
        await testCorsPreflight();
        await testLoginRequest();
        
        console.log('\n' + '='.repeat(50));
        console.log('🎯 诊断建议:');
        console.log('');
        console.log('1. 检查CORS配置是否正确');
        console.log('2. 确认后端服务器状态');
        console.log('3. 验证API端点路径');
        console.log('4. 检查网络连接');
        console.log('');
        console.log('如果CORS预检失败，需要后端配置CORS头信息');
        console.log('如果503错误，说明服务器暂时不可用');
        
    } catch (error) {
        console.log('❌ 诊断过程中发生错误:', error.message);
    }
}

// 运行诊断
if (require.main === module) {
    runDiagnosis().catch(console.error);
}

module.exports = { runDiagnosis };
