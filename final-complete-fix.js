// 🚨 最終完整修復腳本

const fs = require('fs');

console.log('🚨 執行最終完整修復...');

// 讀取當前內容
let content = fs.readFileSync('app.js', 'utf8');

// 1. 修復登入路由結尾
console.log('🔧 修復登入路由...');
content = content.replace(
    /res\.json\(\{ [\s\S]*?token: username[\s\S]*?\}\);[\s\S]*?\/\/ 🔐 用戶驗證API/,
    `res.json({ 
            success: true, 
            message: \`歡迎回來，\${user.name}！\`,
            user: userInfo,
            token: username // 簡化的token (實際應用中應使用JWT)
        });
    } else {
        res.status(401).json({ 
            success: false, 
            message: '用戶名或密碼錯誤' 
        });
    }
});

// 🔐 用戶驗證API`
);

// 2. 移除多餘的代碼片段
console.log('🧹 清理多餘代碼...');
content = content.replace(/\}\);[\s\S]*?\} else \{[\s\S]*?\}\);[\s\S]*?\}[\s\S]*?res\.json\(\{[\s\S]*?department: user\.department[\s\S]*?\}\);/, '');

// 3. 修復verifyUserAuth函數
console.log('🔧 修復verifyUserAuth函數...');
content = content.replace(
    /async function verifyUserAuth\(\) \{[\s\S]*?\}[\s\S]*?\} catch[\s\S]*?\}[\s\S]*?\}/g,
    `async function verifyUserAuth() {
        console.log('[DEBUG] 開始驗證用戶身份...');
        try {
            // 明確使用POST方法
            const response = await apiRequest('/api/auth/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log('[DEBUG] 驗證響應:', response);
            return response;
        } catch (error) {
            console.error('[DEBUG] 驗證失敗:', error);
            return { success: false, message: '驗證失敗: ' + error.message };
        }
    }`
);

// 4. 保存修復
fs.writeFileSync('app.js', content);
console.log('✅ 最終修復完成！');

// 5. 語法檢查
console.log('\n🔍 執行語法檢查...');
const { exec } = require('child_process');

exec('node -c app.js', (error, stdout, stderr) => {
    if (error) {
        console.error('❌ 語法錯誤:', stderr);
    } else {
        console.log('✅ 語法檢查通過！');
    }
});