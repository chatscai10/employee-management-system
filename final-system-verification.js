// 🔬 最終系統深度驗證測試
// 驗證所有新增功能和改進項目

const https = require('https');
const http = require('http');
const fs = require('fs');

// 測試配置
const TEST_CONFIG = {
    serverUrl: 'http://localhost:3008',
    testEmployeeId: 'EMP001',
    testIdNumber: 'A123456789',
    testEmployee: '測試員工'
};

// 顏色輸出工具
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

function log(color, message) {
    console.log(`${color}${message}${colors.reset}`);
}

// HTTP請求工具
function makeRequest(url, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port,
            path: urlObj.pathname + urlObj.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Final-System-Verification/1.0'
            }
        };

        if (data && method !== 'GET') {
            const postData = JSON.stringify(data);
            options.headers['Content-Length'] = Buffer.byteLength(postData);
        }

        const req = http.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(responseData);
                    resolve({
                        statusCode: res.statusCode,
                        data: parsedData,
                        rawData: responseData
                    });
                } catch (e) {
                    resolve({
                        statusCode: res.statusCode,
                        data: null,
                        rawData: responseData
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (data && method !== 'GET') {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

// 階段一：營收系統完整性驗證
async function verifyRevenueSystem() {
    log(colors.cyan + colors.bold, '\n💰 階段一：營收系統完整性驗證');
    
    const results = {
        storeListAPI: false,
        revenueCategoriesAPI: false,
        revenueSubmitAPI: false,
        frontendIntegration: false
    };

    try {
        // 測試分店列表API
        const storeResponse = await makeRequest(`${TEST_CONFIG.serverUrl}/api/stores/list`);
        if (storeResponse.statusCode === 200 && storeResponse.data.success) {
            results.storeListAPI = true;
            log(colors.green, `✅ 分店列表API正常 (${storeResponse.data.data.length}間分店)`);
        } else {
            log(colors.red, '❌ 分店列表API失敗');
        }

        // 測試營收類別API
        const categoryResponse = await makeRequest(`${TEST_CONFIG.serverUrl}/api/revenue/categories/ST001`);
        if (categoryResponse.statusCode === 200 && categoryResponse.data.success) {
            results.revenueCategoriesAPI = true;
            log(colors.green, `✅ 營收類別API正常 (${categoryResponse.data.data.income.length}個收入項目)`);
            
            // 驗證預設收入項目
            const incomeItems = categoryResponse.data.data.income;
            const expectedItems = ['現金銷售', '信用卡銷售', '熊貓外送', 'UBER外送'];
            const hasExpectedItems = expectedItems.every(item => 
                incomeItems.some(income => income.categoryName === item)
            );
            
            if (hasExpectedItems) {
                log(colors.blue, '📋 預設收入項目配置正確');
            } else {
                log(colors.yellow, '⚠️ 預設收入項目配置需檢查');
            }
        } else {
            log(colors.red, '❌ 營收類別API失敗');
        }

        // 檢查前端檔案整合
        if (fs.existsSync('D:\\0802\\employee-system.html')) {
            const htmlContent = fs.readFileSync('D:\\0802\\employee-system.html', 'utf8');
            if (htmlContent.includes('loadStoreList') && htmlContent.includes('loadRevenueCategories')) {
                results.frontendIntegration = true;
                log(colors.green, '✅ 前端整合功能已實現');
            } else {
                log(colors.red, '❌ 前端整合功能缺失');
            }
        }

    } catch (error) {
        log(colors.red, `❌ 營收系統驗證失敗: ${error.message}`);
    }

    return results;
}

// 階段二：叫貨系統增強功能驗證
async function verifyOrderingSystem() {
    log(colors.cyan + colors.bold, '\n📦 階段二：叫貨系統增強功能驗證');
    
    const results = {
        orderingItemsAPI: false,
        categoryFilterAPI: false,
        issueReportAPI: false,
        frontendEnhancements: false
    };

    try {
        // 測試叫貨品項API
        const itemsResponse = await makeRequest(`${TEST_CONFIG.serverUrl}/api/ordering/items/ST001`);
        if (itemsResponse.statusCode === 200 && itemsResponse.data.success) {
            results.orderingItemsAPI = true;
            log(colors.green, `✅ 叫貨品項API正常 (${itemsResponse.data.data.length}個品項)`);
        } else {
            log(colors.red, '❌ 叫貨品項API失敗');
        }

        // 測試品項異常回報API
        const testIssueData = {
            orderId: 'TEST_ORDER_001',
            issueType: '品項破損',
            relatedItems: ['測試品項'],
            description: '測試異常回報功能',
            priority: '一般'
        };

        const issueResponse = await makeRequest(
            `${TEST_CONFIG.serverUrl}/api/ordering/report-issue`, 
            'POST', 
            testIssueData
        );
        
        if (issueResponse.statusCode === 200) {
            results.issueReportAPI = true;
            log(colors.green, '✅ 品項異常回報API正常');
        } else {
            log(colors.yellow, '⚠️ 品項異常回報API需檢查');
        }

        // 檢查前端增強功能
        if (fs.existsSync('D:\\0802\\employee-system.html')) {
            const htmlContent = fs.readFileSync('D:\\0802\\employee-system.html', 'utf8');
            const hasEnhancements = [
                'reportOrderingIssue',
                'categoryFilter',
                'itemDetails',
                'orderingSummary'
            ].every(func => htmlContent.includes(func));
            
            if (hasEnhancements) {
                results.frontendEnhancements = true;
                log(colors.green, '✅ 叫貨系統前端增強功能已實現');
            } else {
                log(colors.yellow, '⚠️ 部分前端增強功能待實現');
            }
        }

    } catch (error) {
        log(colors.red, `❌ 叫貨系統驗證失敗: ${error.message}`);
    }

    return results;
}

// 階段三：排班系統規則驗證
async function verifySchedulingSystem() {
    log(colors.cyan + colors.bold, '\n📅 階段三：排班系統規則驗證');
    
    const results = {
        scheduleConfigAPI: false,
        scheduleSubmitAPI: false,
        ruleValidationAPI: false,
        timeControlAPI: false
    };

    try {
        // 測試排班配置API
        const configResponse = await makeRequest(`${TEST_CONFIG.serverUrl}/api/schedule/config`);
        if (configResponse.statusCode === 200 && configResponse.data.success) {
            results.scheduleConfigAPI = true;
            log(colors.green, '✅ 排班配置API正常');
            
            // 檢查配置參數
            const config = configResponse.data.data;
            if (config.maxVacationDays === 8 && config.maxDailyVacationTotal === 2) {
                log(colors.blue, '📋 排班參數配置正確');
            }
        } else {
            log(colors.red, '❌ 排班配置API失敗');
        }

        // 測試排班狀態API
        const statusResponse = await makeRequest(`${TEST_CONFIG.serverUrl}/api/schedule/status`);
        if (statusResponse.statusCode === 200 && statusResponse.data.success) {
            results.timeControlAPI = true;
            log(colors.green, '✅ 排班狀態控制API正常');
            
            const status = statusResponse.data.data;
            log(colors.blue, `📋 當前狀態: ${status.isOpen ? '開放' : '關閉'}`);
        } else {
            log(colors.red, '❌ 排班狀態API失敗');
        }

        // 測試規則驗證 (模擬提交)
        const testScheduleData = {
            employeeId: TEST_CONFIG.testEmployeeId,
            month: new Date().getMonth() + 2, // 下個月
            year: new Date().getFullYear(),
            vacationDates: ['2025-09-15', '2025-09-16'] // 模擬週末
        };

        const scheduleResponse = await makeRequest(
            `${TEST_CONFIG.serverUrl}/api/schedule/validate`, 
            'POST', 
            testScheduleData
        );
        
        if (scheduleResponse.statusCode === 200) {
            results.ruleValidationAPI = true;
            log(colors.green, '✅ 排班規則驗證API正常');
        } else {
            log(colors.yellow, '⚠️ 排班規則驗證API需檢查');
        }

    } catch (error) {
        log(colors.red, `❌ 排班系統驗證失敗: ${error.message}`);
    }

    return results;
}

// 階段四：照片和作廢功能驗證
async function verifyPhotoAndVoidSystem() {
    log(colors.cyan + colors.bold, '\n📸 階段四：照片和作廢功能驗證');
    
    const results = {
        photoQueryAPI: false,
        voidRecordAPI: false,
        editRecordAPI: false,
        adminPhotoManager: false
    };

    try {
        // 測試照片查詢API
        const photoResponse = await makeRequest(`${TEST_CONFIG.serverUrl}/api/admin/photos?type=revenue&page=1`);
        if (photoResponse.statusCode === 200) {
            results.photoQueryAPI = true;
            log(colors.green, '✅ 照片查詢API正常');
        } else {
            log(colors.yellow, '⚠️ 照片查詢API需檢查');
        }

        // 測試作廢功能API
        const voidResponse = await makeRequest(`${TEST_CONFIG.serverUrl}/api/records/void-policies`);
        if (voidResponse.statusCode === 200) {
            results.voidRecordAPI = true;
            log(colors.green, '✅ 作廢功能API正常');
        } else {
            log(colors.yellow, '⚠️ 作廢功能API需檢查');
        }

        // 檢查管理員照片管理界面
        if (fs.existsSync('D:\\0802\\admin-system.html')) {
            const adminContent = fs.readFileSync('D:\\0802\\admin-system.html', 'utf8');
            if (adminContent.includes('照片管理') && adminContent.includes('photoManager')) {
                results.adminPhotoManager = true;
                log(colors.green, '✅ 管理員照片管理界面已實現');
            } else {
                log(colors.yellow, '⚠️ 管理員照片管理界面待完善');
            }
        }

        // 檢查員工作廢功能界面
        if (fs.existsSync('D:\\0802\\employee-system.html')) {
            const empContent = fs.readFileSync('D:\\0802\\employee-system.html', 'utf8');
            if (empContent.includes('voidRecord') && empContent.includes('editRecord')) {
                results.editRecordAPI = true;
                log(colors.green, '✅ 員工作廢編輯功能已實現');
            } else {
                log(colors.yellow, '⚠️ 員工作廢編輯功能待完善');
            }
        }

    } catch (error) {
        log(colors.red, `❌ 照片作廢功能驗證失敗: ${error.message}`);
    }

    return results;
}

// 階段五：Telegram通知系統驗證
async function verifyTelegramNotifications() {
    log(colors.cyan + colors.bold, '\n📱 階段五：Telegram通知系統驗證');
    
    const results = {
        notificationConfig: false,
        photoUploadIntegration: false,
        detailedNotifications: false,
        birthdayNotifications: false
    };

    try {
        // 檢查Telegram配置
        if (fs.existsSync('D:\\0802\\database-structure.js')) {
            const dbContent = fs.readFileSync('D:\\0802\\database-structure.js', 'utf8');
            if (dbContent.includes('7659930552') && dbContent.includes('-1002658082392')) {
                results.notificationConfig = true;
                log(colors.green, '✅ Telegram通知配置正確');
            } else {
                log(colors.red, '❌ Telegram通知配置缺失');
            }
        }

        // 檢查照片上傳整合
        if (fs.existsSync('D:\\0802\\complete-server.js')) {
            const serverContent = fs.readFileSync('D:\\0802\\complete-server.js', 'utf8');
            if (serverContent.includes('sendTelegramPhoto') && serverContent.includes('form-data')) {
                results.photoUploadIntegration = true;
                log(colors.green, '✅ 照片上傳Telegram整合已實現');
            } else {
                log(colors.yellow, '⚠️ 照片上傳Telegram整合待完善');
            }
        }

        // 檢查詳細通知格式
        const serverContent = fs.readFileSync('D:\\0802\\complete-server.js', 'utf8');
        const hasDetailedNotifications = [
            '員工打卡記錄',
            '叫貨記錄',
            '維修申請',
            '升遷投票'
        ].every(keyword => serverContent.includes(keyword));
        
        if (hasDetailedNotifications) {
            results.detailedNotifications = true;
            log(colors.green, '✅ 詳細通知格式已實現');
        } else {
            log(colors.yellow, '⚠️ 詳細通知格式需檢查');
        }

        // 檢查生日通知模板
        if (serverContent.includes('本週生日提醒') && serverContent.includes('生日快樂')) {
            results.birthdayNotifications = true;
            log(colors.green, '✅ 生日通知模板已實現');
        } else {
            log(colors.yellow, '⚠️ 生日通知模板待實現');
        }

    } catch (error) {
        log(colors.red, `❌ Telegram通知系統驗證失敗: ${error.message}`);
    }

    return results;
}

// 生成最終驗證報告
function generateFinalReport(stage1, stage2, stage3, stage4, stage5) {
    log(colors.magenta + colors.bold, '\n📊 最終系統驗證報告');
    log(colors.magenta, '='.repeat(60));

    const allResults = { ...stage1, ...stage2, ...stage3, ...stage4, ...stage5 };
    const totalTests = Object.keys(allResults).length;
    const passedTests = Object.values(allResults).filter(result => result === true).length;
    const successRate = (passedTests / totalTests) * 100;

    log(colors.bold, `📈 總體完成率: ${successRate.toFixed(1)}% (${passedTests}/${totalTests})`);
    
    // 系統品質評級
    let qualityLevel, qualityColor;
    if (successRate >= 95) {
        qualityLevel = '🏆 優秀';
        qualityColor = colors.green + colors.bold;
    } else if (successRate >= 85) {
        qualityLevel = '⭐ 良好';
        qualityColor = colors.yellow + colors.bold;
    } else if (successRate >= 75) {
        qualityLevel = '✅ 合格';
        qualityColor = colors.blue + colors.bold;
    } else {
        qualityLevel = '⚠️ 需改進';
        qualityColor = colors.red + colors.bold;
    }
    
    log(qualityColor, `🎯 系統品質等級: ${qualityLevel}`);

    // 各階段詳細結果
    log(colors.cyan, '\n📋 各階段驗證結果:');
    
    const stages = [
        { name: '💰 營收系統', results: stage1 },
        { name: '📦 叫貨系統', results: stage2 },
        { name: '📅 排班系統', results: stage3 },
        { name: '📸 照片作廢', results: stage4 },
        { name: '📱 Telegram通知', results: stage5 }
    ];

    stages.forEach(stage => {
        const stageTests = Object.keys(stage.results).length;
        const stagePassed = Object.values(stage.results).filter(r => r === true).length;
        const stageRate = (stagePassed / stageTests) * 100;
        const stageColor = stageRate >= 80 ? colors.green : stageRate >= 60 ? colors.yellow : colors.red;
        
        log(stageColor, `${stage.name}: ${stageRate.toFixed(1)}% (${stagePassed}/${stageTests})`);
    });

    // 功能完成度統計
    log(colors.cyan, '\n🔍 功能完成度統計:');
    Object.entries(allResults).forEach(([test, result]) => {
        const status = result ? '✅' : '❌';
        const color = result ? colors.green : colors.red;
        log(color, `${status} ${test}`);
    });

    // 建議和後續步驟
    log(colors.blue, '\n💡 系統狀態總結:');
    if (successRate >= 90) {
        log(colors.green, '🎉 系統已達到生產就緒狀態，可立即投入使用');
        log(colors.green, '🚀 所有核心功能已完成，系統運行穩定');
    } else if (successRate >= 80) {
        log(colors.yellow, '⚡ 系統基本功能完整，部分增強功能需要完善');
        log(colors.yellow, '🔧 建議優先完成失敗的測試項目');
    } else {
        log(colors.red, '⚠️ 系統存在重要功能缺失，需要進一步開發');
        log(colors.red, '🛠️ 建議逐項檢查並修復失敗的功能');
    }

    return {
        successRate,
        totalTests,
        passedTests,
        status: successRate >= 90 ? 'production-ready' : successRate >= 80 ? 'needs-polish' : 'needs-development',
        qualityLevel
    };
}

// 主要執行函數
async function runFinalSystemVerification() {
    log(colors.magenta + colors.bold, '🔬 啟動最終系統深度驗證');
    log(colors.blue, '目標: 驗證所有新增功能和改進項目的完整性');
    log(colors.blue, '範圍: 營收、叫貨、排班、照片、作廢、通知系統\n');

    try {
        const stage1Results = await verifyRevenueSystem();
        const stage2Results = await verifyOrderingSystem();
        const stage3Results = await verifySchedulingSystem();
        const stage4Results = await verifyPhotoAndVoidSystem();
        const stage5Results = await verifyTelegramNotifications();

        const finalReport = generateFinalReport(
            stage1Results, 
            stage2Results, 
            stage3Results, 
            stage4Results, 
            stage5Results
        );

        log(colors.green + colors.bold, '\n🎊 最終系統驗證完成!');
        return finalReport;

    } catch (error) {
        log(colors.red, `💥 驗證過程發生錯誤: ${error.message}`);
        return null;
    }
}

// 執行驗證
if (require.main === module) {
    runFinalSystemVerification()
        .then((report) => {
            if (report) {
                process.exit(report.status === 'production-ready' ? 0 : 1);
            } else {
                process.exit(1);
            }
        })
        .catch((error) => {
            console.error('執行失敗:', error);
            process.exit(1);
        });
}

module.exports = { runFinalSystemVerification };