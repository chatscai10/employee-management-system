// 🚀 快速部署追蹤器
// 使用方法: node quick-deployment-tracker.js <deployed-url>

console.log('🎯 企業管理系統部署驗證');
console.log('🔗 請提供您的部署網址進行完整驗證');

const url = process.argv[2];
if (!url) {
    console.log('\n📋 使用方法:');
    console.log('   node quick-deployment-tracker.js https://your-deployed-url');
    console.log('\n🌍 常見部署平台網址格式:');
    console.log('   Railway: https://xxx.up.railway.app');
    console.log('   Vercel: https://xxx.vercel.app');
    console.log('   Render: https://xxx.onrender.com');
    process.exit(1);
}

console.log('🔍 驗證網址:', url);
console.log('⏳ 正在執行完整智慧驗證...');

// 調用智慧驗證器
const { spawn } = require('child_process');
const verifier = spawn('node', ['universal-smart-deployment-verifier.js', url], {
    stdio: 'inherit'
});

verifier.on('close', (code) => {
    if (code === 0) {
        console.log('\n🎉 驗證完成！');
        console.log('🔐 測試帳號:');
        console.log('   👑 admin / admin123 (管理員)');
        console.log('   👔 manager / manager123 (經理)');
        console.log('   👤 john.doe / password123 (員工)');
    } else {
        console.log('\n⚠️  驗證過程中發現問題，請檢查部署狀態');
    }
});