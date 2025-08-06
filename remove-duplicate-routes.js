// 移除重複的路由定義

const fs = require('fs');

console.log('🧹 移除重複的路由...');

let content = fs.readFileSync('app.js', 'utf8');

// 找到第二個dashboard路由的位置
const firstDashboard = content.indexOf("app.get('/dashboard', (req, res) => {");
const secondDashboard = content.indexOf("app.get('/dashboard', (req, res) => {", firstDashboard + 1);

if (secondDashboard > -1) {
    console.log(`  找到重複的Dashboard路由在第 ${content.substring(0, secondDashboard).split('\n').length} 行`);
    
    // 找到這個路由的結束位置
    let braceCount = 0;
    let inString = false;
    let stringChar = '';
    let i = secondDashboard;
    
    while (i < content.length) {
        const char = content[i];
        
        if (!inString) {
            if (char === '"' || char === "'" || char === '`') {
                inString = true;
                stringChar = char;
            } else if (char === '{') {
                braceCount++;
            } else if (char === '}') {
                braceCount--;
                if (braceCount === 0) {
                    // 找到了結束位置
                    const endPos = content.indexOf('});', i) + 3;
                    
                    // 移除這個路由
                    content = content.substring(0, secondDashboard) + content.substring(endPos);
                    console.log('  ✅ 已移除重複的Dashboard路由');
                    break;
                }
            }
        } else {
            if (char === stringChar && content[i-1] !== '\\') {
                inString = false;
            }
        }
        
        i++;
    }
}

// 保存修改
fs.writeFileSync('app.js', content);

// 驗證語法
const { exec } = require('child_process');
exec('node -c app.js', (error, stdout, stderr) => {
    if (error) {
        console.error('❌ 語法錯誤:', stderr);
    } else {
        console.log('✅ 語法檢查通過！');
    }
});