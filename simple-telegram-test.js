const https = require('https');

// Telegram Bot 配置
const TELEGRAM_BOT_TOKEN = '7659930552:AAF_jF1rAXFnjFO176-9X5fKfBwbrko8BNc';
const TELEGRAM_CHAT_ID = '-1002658082392';

// 發送簡單測試訊息
function sendSimpleMessage() {
    return new Promise((resolve, reject) => {
        const message = '✈️ 測試訊息 - 部署修復完成飛機彙報\n\n這是一個測試訊息，確認Telegram Bot正常運作。';
        
        const data = JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: message
        });

        console.log('📝 測試訊息:', message);
        console.log('📦 JSON 數據:', data);

        const options = {
            hostname: 'api.telegram.org',
            port: 443,
            path: `/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                console.log('📊 HTTP狀態碼:', res.statusCode);
                console.log('📊 回應數據:', responseData);
                
                if (res.statusCode === 200) {
                    console.log('✅ 測試訊息發送成功');
                    resolve(JSON.parse(responseData));
                } else {
                    console.error('❌ 測試訊息發送失敗');
                    reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
                }
            });
        });

        req.on('error', (error) => {
            console.error('❌ 請求錯誤:', error);
            reject(error);
        });

        req.write(data);
        req.end();
    });
}

// 執行測試
async function main() {
    try {
        console.log('🚀 開始Telegram Bot測試...');
        const result = await sendSimpleMessage();
        console.log('🎉 測試成功完成!');
    } catch (error) {
        console.error('❌ 測試失敗:', error.message);
    }
}

main();