// 🚨 緊急API修復腳本
// 修復Dashboard中verifyUserAuth使用GET而非POST的問題

const fs = require('fs');

console.log('🚨 執行緊急API修復...');

// 讀取app.js
const appContent = fs.readFileSync('app.js', 'utf8');

// 檢查需要修復的兩個關鍵位置
const fixes = [
    {
        name: 'apiRequest預設方法',
        search: `    async function apiRequest(url, options = {}) {
        const token = localStorage.getItem('userToken') || '';
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        };`,
        replace: `    async function apiRequest(url, options = {}) {
        const token = localStorage.getItem('userToken') || '';
        const defaultOptions = {
            method: 'GET', // 預設為GET
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        };`
    },
    {
        name: 'verifyUserAuth方法',
        search: `    async function verifyUserAuth() {
        try {
            const response = await apiRequest('/api/auth/verify');
            return response;
        } catch (error) {
            return { success: false, message: '驗證失敗' };
        }
    }`,
        replace: `    async function verifyUserAuth() {
        try {
            const response = await apiRequest('/api/auth/verify', {
                method: 'POST'
            });
            return response;
        } catch (error) {
            return { success: false, message: '驗證失敗' };
        }
    }`
    }
];

let fixedContent = appContent;
let fixCount = 0;

// 應用修復
fixes.forEach(fix => {
    if (fixedContent.includes(fix.search)) {
        fixedContent = fixedContent.replace(fix.search, fix.replace);
        console.log(`✅ 已修復: ${fix.name}`);
        fixCount++;
    } else {
        console.log(`⚠️ 未找到需要修復的: ${fix.name}`);
        // 嘗試部分匹配修復
        if (fixedContent.includes('async function verifyUserAuth()')) {
            // 使用正則表達式進行更靈活的替換
            const regex = /async function verifyUserAuth\(\) \{[\s\S]*?return response;[\s\S]*?\}/;
            const newVerifyAuth = `async function verifyUserAuth() {
        try {
            const response = await apiRequest('/api/auth/verify', {
                method: 'POST'
            });
            return response;
        } catch (error) {
            return { success: false, message: '驗證失敗' };
        }
    }`;
            
            if (regex.test(fixedContent)) {
                fixedContent = fixedContent.replace(regex, newVerifyAuth);
                console.log(`✅ 使用正則表達式修復: ${fix.name}`);
                fixCount++;
            }
        }
    }
});

// 保存修復後的檔案
if (fixCount > 0) {
    fs.writeFileSync('app.js', fixedContent);
    console.log(`\n🎉 緊急修復完成！共修復 ${fixCount} 個問題`);
    console.log('📝 修復內容:');
    console.log('  1. apiRequest函數添加預設method: "GET"');
    console.log('  2. verifyUserAuth函數明確使用method: "POST"');
    console.log('\n⏳ 請執行 git add, commit 和 push 來部署修復');
} else {
    console.log('\n⚠️ 未找到需要修復的內容，可能已經修復過了');
}

// 驗證修復
console.log('\n🔍 驗證修復結果...');
const verifyContent = fs.readFileSync('app.js', 'utf8');

if (verifyContent.includes('method: \'POST\'') && verifyContent.includes('method: \'GET\'')) {
    console.log('✅ 修復驗證成功！');
} else {
    console.log('❌ 修復可能不完整，請手動檢查');
}