
// 前端版本檢查機制
function checkVersion() {
    fetch('/api/version')
        .then(response => response.json())
        .then(data => {
            console.log('當前版本信息:', data);
            
            // 在頁面顯示版本信息
            const versionInfo = document.getElementById('version-info') || createVersionDisplay();
            versionInfo.innerHTML = `
                <small style="color: #666; font-size: 0.8em;">
                    版本: ${data.version.substring(0, 16)}... | 
                    構建時間: ${new Date(data.buildTime).toLocaleString()}
                </small>
            `;
            
            // 檢查是否為最新版本（簡單的時間比較）
            const buildTime = new Date(data.buildTime);
            const currentTime = new Date();
            const timeDiff = (currentTime - buildTime) / 1000 / 60; // 分鐘
            
            if (timeDiff > 30) { // 如果構建超過30分鐘
                console.warn('⚠️ 版本可能過舊，建議刷新頁面');
            }
        })
        .catch(error => {
            console.error('版本檢查失敗:', error);
        });
}

function createVersionDisplay() {
    const versionDiv = document.createElement('div');
    versionDiv.id = 'version-info';
    versionDiv.style.cssText = 'position: fixed; bottom: 10px; right: 10px; z-index: 1000;';
    document.body.appendChild(versionDiv);
    return versionDiv;
}

// 頁面載入完成後檢查版本
document.addEventListener('DOMContentLoaded', checkVersion);

// 每5分鐘檢查一次版本
setInterval(checkVersion, 5 * 60 * 1000);
