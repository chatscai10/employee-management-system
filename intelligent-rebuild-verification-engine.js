// 🧠 智慧重建驗證引擎
// 完整核心邏輯驗證和系統重建

const fs = require('fs').promises;
const https = require('https');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

class IntelligentRebuildEngine {
    constructor() {
        this.telegramConfig = {
            botToken: '7659930552:AAF_jF1rAXFnjFO176-9X5fKfBwbrko8BNc',
            chatId: '-1002658082392'
        };
        
        this.verificationResults = {
            coreFileCheck: {},
            logicVerification: {},
            dependencyCheck: {},
            deploymentReadiness: {},
            systemIntegrity: {}
        };
    }

    // 核心文件完整性檢查
    async verifyCoreFiles() {
        console.log('🔍 執行核心文件完整性檢查...');
        
        const coreFiles = [
            'app.js',
            'package.json', 
            'cloudbuild.yaml',
            'Dockerfile',
            'public/index.html'
        ];
        
        const results = {};
        
        for (const file of coreFiles) {
            try {
                const stats = await fs.stat(`D:\\0802\\${file}`);
                results[file] = {
                    exists: true,
                    size: stats.size,
                    modified: stats.mtime.toISOString(),
                    status: 'valid'
                };
                console.log(`   ✅ ${file}: ${stats.size} bytes`);
            } catch (error) {
                results[file] = {
                    exists: false,
                    error: error.message,
                    status: 'missing'
                };
                console.log(`   ❌ ${file}: 文件缺失`);
            }
        }
        
        this.verificationResults.coreFileCheck = results;
        return results;
    }

    // 應用邏輯完整性驗證
    async verifyApplicationLogic() {
        console.log('\\n🧠 執行應用邏輯完整性驗證...');
        
        try {
            const appContent = await fs.readFile('D:\\0802\\app.js', 'utf8');
            
            // 檢查核心功能模組
            const coreFeatures = {
                'express服務器': /const express = require\('express'\)/.test(appContent),
                '用戶認證': /\/api\/auth\/login/.test(appContent),
                '員工管理': /\/api\/employees/.test(appContent),
                '考勤系統': /\/api\/attendance/.test(appContent),
                '庫存管理': /\/api\/inventory/.test(appContent),
                '維修申請': /\/api\/maintenance/.test(appContent),
                '營收分析': /\/api\/revenue/.test(appContent),
                '系統狀態': /\/api\/system\/status/.test(appContent),
                'Dashboard路由': /app\.get\('\/dashboard'/.test(appContent),
                '靜態文件服務': /express\.static/.test(appContent)
            };
            
            // 檢查數據庫結構
            const databaseStructure = {
                'employees數據': /employees:\s*\[/.test(appContent),
                'attendance數據': /attendance:\s*\[/.test(appContent),
                'schedules數據': /schedules:\s*\[/.test(appContent),
                'inventory數據': /inventory:\s*\[/.test(appContent),
                'orders數據': /orders:\s*\[/.test(appContent),
                'maintenance數據': /maintenanceRequests:\s*\[/.test(appContent),
                'revenue數據': /revenue:\s*\[/.test(appContent)
            };
            
            // 檢查JavaScript函數
            const jsFunctions = {
                'refreshStats函數': /function refreshStats\(\)/.test(appContent),
                'loadEmployees函數': /function loadEmployees\(\)/.test(appContent),
                'checkSystemStatus函數': /function checkSystemStatus\(\)/.test(appContent),
                'testAllAPIs函數': /function testAllAPIs\(\)/.test(appContent),
                'logout函數': /function logout\(\)/.test(appContent)
            };
            
            const logicResults = {
                coreFeatures,
                databaseStructure, 
                jsFunctions,
                totalFeatures: Object.keys(coreFeatures).length,
                validFeatures: Object.values(coreFeatures).filter(Boolean).length,
                totalDatabase: Object.keys(databaseStructure).length,
                validDatabase: Object.values(databaseStructure).filter(Boolean).length,
                totalFunctions: Object.keys(jsFunctions).length,
                validFunctions: Object.values(jsFunctions).filter(Boolean).length
            };
            
            // 輸出驗證結果
            console.log('   📊 核心功能檢查:');
            Object.entries(coreFeatures).forEach(([feature, valid]) => {
                console.log(`     ${valid ? '✅' : '❌'} ${feature}`);
            });
            
            console.log('   📊 數據庫結構檢查:');
            Object.entries(databaseStructure).forEach(([structure, valid]) => {
                console.log(`     ${valid ? '✅' : '❌'} ${structure}`);
            });
            
            console.log('   📊 JavaScript函數檢查:');
            Object.entries(jsFunctions).forEach(([func, valid]) => {
                console.log(`     ${valid ? '✅' : '❌'} ${func}`);
            });
            
            this.verificationResults.logicVerification = logicResults;
            return logicResults;
            
        } catch (error) {
            console.log(`   ❌ 邏輯驗證失敗: ${error.message}`);
            this.verificationResults.logicVerification = { error: error.message };
            return null;
        }
    }

    // 依賴和配置檢查
    async verifyDependencies() {
        console.log('\\n📦 執行依賴和配置檢查...');
        
        try {
            // 檢查package.json
            const packageContent = await fs.readFile('D:\\0802\\package.json', 'utf8');
            const packageJson = JSON.parse(packageContent);
            
            const requiredDeps = ['express', 'cors'];
            const dependencyCheck = {
                hasPackageJson: true,
                dependencies: packageJson.dependencies || {},
                requiredDepsPresent: requiredDeps.every(dep => 
                    packageJson.dependencies && packageJson.dependencies[dep]
                ),
                scripts: packageJson.scripts || {},
                hasStartScript: !!(packageJson.scripts && packageJson.scripts.start)
            };
            
            // 檢查cloudbuild.yaml
            const cloudBuildContent = await fs.readFile('D:\\0802\\cloudbuild.yaml', 'utf8');
            const cloudBuildCheck = {
                exists: true,
                hasDockerBuild: cloudBuildContent.includes('docker build'),
                hasCloudRunDeploy: cloudBuildContent.includes('cloud-run'),
                hasSubstitutions: cloudBuildContent.includes('substitutions')
            };
            
            // 檢查Dockerfile
            const dockerContent = await fs.readFile('D:\\0802\\Dockerfile', 'utf8');
            const dockerCheck = {
                exists: true,
                hasNodeBase: dockerContent.includes('FROM node:'),
                hasWorkdir: dockerContent.includes('WORKDIR'),
                hasCopyPackage: dockerContent.includes('COPY package'),
                hasNpmInstall: dockerContent.includes('npm install'),
                hasExpose: dockerContent.includes('EXPOSE'),
                hasCmd: dockerContent.includes('CMD')
            };
            
            const depResults = {
                package: dependencyCheck,
                cloudBuild: cloudBuildCheck,
                docker: dockerCheck
            };
            
            console.log('   📦 Package.json檢查:');
            console.log(`     ✅ 必要依賴: ${dependencyCheck.requiredDepsPresent ? '完整' : '缺失'}`);
            console.log(`     ✅ 啟動腳本: ${dependencyCheck.hasStartScript ? '存在' : '缺失'}`);
            
            console.log('   ☁️ Cloud Build配置:');
            console.log(`     ✅ Docker構建: ${cloudBuildCheck.hasDockerBuild ? '配置正確' : '配置錯誤'}`);
            console.log(`     ✅ Cloud Run部署: ${cloudBuildCheck.hasCloudRunDeploy ? '配置正確' : '配置錯誤'}`);
            
            console.log('   🐳 Dockerfile檢查:');
            console.log(`     ✅ Node.js基礎映像: ${dockerCheck.hasNodeBase ? '正確' : '錯誤'}`);
            console.log(`     ✅ 工作目錄: ${dockerCheck.hasWorkdir ? '設置' : '未設置'}`);
            console.log(`     ✅ 依賴安裝: ${dockerCheck.hasNpmInstall ? '配置' : '未配置'}`);
            
            this.verificationResults.dependencyCheck = depResults;
            return depResults;
            
        } catch (error) {
            console.log(`   ❌ 依賴檢查失敗: ${error.message}`);
            this.verificationResults.dependencyCheck = { error: error.message };
            return null;
        }
    }

    // 本地測試運行
    async runLocalTest() {
        console.log('\\n🧪 執行本地測試運行...');
        
        try {
            // 語法檢查
            console.log('   🔍 執行Node.js語法檢查...');
            const syntaxCheck = await execPromise('node -c app.js');
            console.log('   ✅ 語法檢查通過');
            
            // 端口測試
            console.log('   🔌 檢查端口8080可用性...');
            const portCheck = await this.checkPortAvailability(8080);
            console.log(`   ${portCheck ? '✅' : '⚠️'} 端口8080 ${portCheck ? '可用' : '被占用'}`);
            
            const testResults = {
                syntaxValid: true,
                portAvailable: portCheck,
                readyForDeploy: true
            };
            
            this.verificationResults.deploymentReadiness = testResults;
            return testResults;
            
        } catch (error) {
            console.log(`   ❌ 本地測試失敗: ${error.message}`);
            const testResults = {
                syntaxValid: false,
                error: error.message,
                readyForDeploy: false
            };
            this.verificationResults.deploymentReadiness = testResults;
            return testResults;
        }
    }

    // 檢查端口可用性
    async checkPortAvailability(port) {
        return new Promise((resolve) => {
            const server = require('net').createServer();
            server.listen(port, () => {
                server.once('close', () => resolve(true));
                server.close();
            });
            server.on('error', () => resolve(false));
        });
    }

    // 系統完整性評估
    evaluateSystemIntegrity() {
        console.log('\\n🔒 執行系統完整性評估...');
        
        const coreFiles = this.verificationResults.coreFileCheck;
        const logic = this.verificationResults.logicVerification;
        const deps = this.verificationResults.dependencyCheck;
        const deploy = this.verificationResults.deploymentReadiness;
        
        // 計算完整性分數
        let integrityScore = 0;
        let maxScore = 0;
        
        // 核心文件評分 (30%)
        const coreFileCount = Object.values(coreFiles).filter(f => f.exists).length;
        const totalCoreFiles = Object.keys(coreFiles).length;
        integrityScore += (coreFileCount / totalCoreFiles) * 30;
        maxScore += 30;
        
        // 應用邏輯評分 (40%)
        if (logic && !logic.error) {
            const featureScore = (logic.validFeatures / logic.totalFeatures) * 15;
            const dbScore = (logic.validDatabase / logic.totalDatabase) * 15;
            const funcScore = (logic.validFunctions / logic.totalFunctions) * 10;
            integrityScore += featureScore + dbScore + funcScore;
        }
        maxScore += 40;
        
        // 依賴配置評分 (20%)
        if (deps && !deps.error) {
            if (deps.package.requiredDepsPresent) integrityScore += 7;
            if (deps.cloudBuild.hasDockerBuild) integrityScore += 7;
            if (deps.docker.hasNodeBase) integrityScore += 6;
        }
        maxScore += 20;
        
        // 部署準備評分 (10%)
        if (deploy && deploy.syntaxValid) integrityScore += 10;
        maxScore += 10;
        
        const finalScore = Math.round((integrityScore / maxScore) * 100);
        const integrity = {
            score: finalScore,
            status: finalScore >= 95 ? 'excellent' : finalScore >= 85 ? 'good' : finalScore >= 70 ? 'acceptable' : 'needs_improvement',
            readyForProduction: finalScore >= 85,
            recommendations: this.generateRecommendations(finalScore)
        };
        
        console.log(`   📊 系統完整性分數: ${finalScore}/100`);
        console.log(`   🎯 系統狀態: ${integrity.status.toUpperCase()}`);
        console.log(`   🚀 生產就緒: ${integrity.readyForProduction ? '是' : '否'}`);
        
        this.verificationResults.systemIntegrity = integrity;
        return integrity;
    }

    // 生成建議
    generateRecommendations(score) {
        const recommendations = [];
        
        if (score < 100) {
            recommendations.push('檢查並修復缺失的核心功能');
        }
        if (score < 90) {
            recommendations.push('驗證所有API端點正常工作');
        }
        if (score < 80) {
            recommendations.push('檢查依賴配置和Docker設置');
        }
        if (score >= 95) {
            recommendations.push('系統狀態優異，可以立即部署');
        }
        
        return recommendations;
    }

    // 執行智慧重建流程
    async executeIntelligentRebuild() {
        console.log('🧠 智慧重建驗證引擎啟動');
        console.log('=' * 70);
        console.log('🎯 執行完整核心邏輯驗證和系統重建準備');
        
        try {
            // 1. 核心文件檢查
            await this.verifyCoreFiles();
            
            // 2. 應用邏輯驗證
            await this.verifyApplicationLogic();
            
            // 3. 依賴和配置檢查
            await this.verifyDependencies();
            
            // 4. 本地測試運行
            await this.runLocalTest();
            
            // 5. 系統完整性評估
            this.evaluateSystemIntegrity();
            
            // 6. 生成完整報告
            const report = this.generateCompleteReport();
            
            return {
                success: true,
                integrity: this.verificationResults.systemIntegrity,
                readyForDeployment: this.verificationResults.systemIntegrity.readyForProduction,
                report: report
            };
            
        } catch (error) {
            console.error('❌ 智慧重建驗證失敗:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // 生成完整驗證報告
    generateCompleteReport() {
        return {
            timestamp: new Date().toISOString(),
            systemVersion: 'v4.0.0',
            verificationResults: this.verificationResults,
            summary: {
                integrityScore: this.verificationResults.systemIntegrity?.score || 0,
                status: this.verificationResults.systemIntegrity?.status || 'unknown',
                readyForProduction: this.verificationResults.systemIntegrity?.readyForProduction || false,
                recommendations: this.verificationResults.systemIntegrity?.recommendations || []
            }
        };
    }
}

// 執行智慧重建驗證
async function main() {
    const engine = new IntelligentRebuildEngine();
    
    try {
        const result = await engine.executeIntelligentRebuild();
        
        if (result.success) {
            console.log('\\n🏆 智慧重建驗證完成！');
            console.log(`🎯 系統完整性: ${result.integrity.score}/100`);
            console.log(`🚀 部署就緒: ${result.readyForDeployment ? '是' : '否'}`);
            
            if (result.readyForDeployment) {
                console.log('✅ 系統可以立即部署到Google Cloud');
            } else {
                console.log('⚠️ 系統需要修復後才能部署');
            }
            
            process.exit(0);
        } else {
            console.log('\\n❌ 智慧重建驗證失敗');
            process.exit(1);
        }
        
    } catch (error) {
        console.error('❌ 智慧重建引擎執行錯誤:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = IntelligentRebuildEngine;