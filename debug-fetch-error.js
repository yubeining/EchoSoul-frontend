// 诊断Failed to fetch错误
const https = require('https');
const http = require('http');

// 线上环境配置
const PRODUCTION_CONFIG = {
    frontend: 'https://cedezmdpgixn.sealosbja.site',
    backend: 'https://ohciuodbxwdp.sealosbja.site'
};

// 详细的网络诊断
async function diagnoseNetworkIssue() {
    console.log('🔍 诊断Failed to fetch错误...');
    console.log('='.repeat(50));
    console.log(`诊断时间: ${new Date().toLocaleString()}`);
    console.log(`目标服务器: ${PRODUCTION_CONFIG.backend}`);
    console.log('');

    // 1. 测试基本连接
    console.log('1️⃣ 测试基本连接...');
    await testBasicConnection();

    // 2. 测试HTTPS证书
    console.log('\n2️⃣ 测试HTTPS证书...');
    await testHttpsCertificate();

    // 3. 测试DNS解析
    console.log('\n3️⃣ 测试DNS解析...');
    await testDnsResolution();

    // 4. 测试具体API端点
    console.log('\n4️⃣ 测试API端点...');
    await testApiEndpoint();

    // 5. 测试CORS
    console.log('\n5️⃣ 测试CORS配置...');
    await testCorsConfiguration();
}

// 测试基本连接
async function testBasicConnection() {
    return new Promise((resolve) => {
        const startTime = Date.now();
        const req = https.request(PRODUCTION_CONFIG.backend, { method: 'GET' }, (res) => {
            const responseTime = Date.now() - startTime;
            console.log(`✅ 基本连接成功`);
            console.log(`   状态码: ${res.statusCode}`);
            console.log(`   响应时间: ${responseTime}ms`);
            console.log(`   服务器: ${res.headers.server || '未知'}`);
            resolve();
        });

        req.on('error', (error) => {
            console.log(`❌ 基本连接失败`);
            console.log(`   错误: ${error.message}`);
            console.log(`   错误代码: ${error.code}`);
            resolve();
        });

        req.setTimeout(5000, () => {
            req.destroy();
            console.log(`❌ 连接超时 (5秒)`);
            resolve();
        });

        req.end();
    });
}

// 测试HTTPS证书
async function testHttpsCertificate() {
    return new Promise((resolve) => {
        const options = {
            hostname: 'ohciuodbxwdp.sealosbja.site',
            port: 443,
            method: 'GET',
            rejectUnauthorized: false // 临时禁用证书验证
        };

        const req = https.request(options, (res) => {
            console.log(`✅ HTTPS连接成功`);
            console.log(`   证书状态: 可连接`);
            console.log(`   协议版本: ${res.socket.getProtocol()}`);
            resolve();
        });

        req.on('error', (error) => {
            console.log(`❌ HTTPS连接失败`);
            console.log(`   错误: ${error.message}`);
            console.log(`   可能原因: 证书问题或网络问题`);
            resolve();
        });

        req.setTimeout(5000, () => {
            req.destroy();
            console.log(`❌ HTTPS连接超时`);
            resolve();
        });

        req.end();
    });
}

// 测试DNS解析
async function testDnsResolution() {
    const dns = require('dns');
    
    return new Promise((resolve) => {
        dns.lookup('ohciuodbxwdp.sealosbja.site', (err, address, family) => {
            if (err) {
                console.log(`❌ DNS解析失败`);
                console.log(`   错误: ${err.message}`);
            } else {
                console.log(`✅ DNS解析成功`);
                console.log(`   IP地址: ${address}`);
                console.log(`   地址族: IPv${family}`);
            }
            resolve();
        });
    });
}

// 测试API端点
async function testApiEndpoint() {
    const loginData = JSON.stringify({
        username: 'admin',
        password: 'admin123'
    });

    return new Promise((resolve) => {
        const startTime = Date.now();
        const options = {
            hostname: 'ohciuodbxwdp.sealosbja.site',
            port: 443,
            path: '/api/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(loginData),
                'Accept': 'application/json',
                'Origin': PRODUCTION_CONFIG.frontend
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const responseTime = Date.now() - startTime;
                console.log(`✅ API端点可访问`);
                console.log(`   状态码: ${res.statusCode}`);
                console.log(`   响应时间: ${responseTime}ms`);
                
                try {
                    const jsonData = JSON.parse(data);
                    if (jsonData.code === 1) {
                        console.log(`   登录测试: 成功`);
                    } else {
                        console.log(`   登录测试: 失败 - ${jsonData.msg}`);
                    }
                } catch (e) {
                    console.log(`   响应数据: ${data.substring(0, 100)}...`);
                }
                resolve();
            });
        });

        req.on('error', (error) => {
            console.log(`❌ API端点访问失败`);
            console.log(`   错误: ${error.message}`);
            console.log(`   错误代码: ${error.code}`);
            resolve();
        });

        req.setTimeout(10000, () => {
            req.destroy();
            console.log(`❌ API端点访问超时 (10秒)`);
            resolve();
        });

        req.write(loginData);
        req.end();
    });
}

// 测试CORS配置
async function testCorsConfiguration() {
    return new Promise((resolve) => {
        const options = {
            hostname: 'ohciuodbxwdp.sealosbja.site',
            port: 443,
            path: '/api/auth/login',
            method: 'OPTIONS',
            headers: {
                'Origin': PRODUCTION_CONFIG.frontend,
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type,Authorization'
            }
        };

        const req = https.request(options, (res) => {
            console.log(`✅ CORS预检成功`);
            console.log(`   状态码: ${res.statusCode}`);
            
            const corsHeaders = {
                'Access-Control-Allow-Origin': res.headers['access-control-allow-origin'],
                'Access-Control-Allow-Methods': res.headers['access-control-allow-methods'],
                'Access-Control-Allow-Headers': res.headers['access-control-allow-headers'],
                'Access-Control-Allow-Credentials': res.headers['access-control-allow-credentials']
            };
            
            console.log(`   CORS头信息:`);
            Object.entries(corsHeaders).forEach(([key, value]) => {
                console.log(`     ${key}: ${value || '未设置'}`);
            });
            resolve();
        });

        req.on('error', (error) => {
            console.log(`❌ CORS预检失败`);
            console.log(`   错误: ${error.message}`);
            resolve();
        });

        req.setTimeout(5000, () => {
            req.destroy();
            console.log(`❌ CORS预检超时`);
            resolve();
        });

        req.end();
    });
}

// 运行诊断
if (require.main === module) {
    diagnoseNetworkIssue().then(() => {
        console.log('\n' + '='.repeat(50));
        console.log('🎯 诊断建议:');
        console.log('');
        console.log('如果所有测试都通过，问题可能是:');
        console.log('1. 浏览器缓存问题 - 尝试清除缓存');
        console.log('2. 浏览器安全策略 - 检查浏览器设置');
        console.log('3. 网络代理问题 - 检查代理设置');
        console.log('4. 防火墙阻止 - 检查防火墙设置');
        console.log('');
        console.log('如果测试失败，请检查:');
        console.log('1. 网络连接是否正常');
        console.log('2. 服务器是否正常运行');
        console.log('3. DNS解析是否正确');
    }).catch(console.error);
}

module.exports = { diagnoseNetworkIssue };
