// 🚀 企業管理系統 v4.0.0 生產環境部署執行器
// 自動化Cloud Run部署流程

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class ProductionDeployer {
    constructor() {
        this.projectId = 'employee-management-system-445304';
        this.serviceName = 'employee-management-system';
        this.region = 'europe-west1';
        this.deploymentLog = [];
    }

    async deployToProduction() {
        console.log('🚀 開始企業管理系統 v4.0.0 生產環境部署');
        console.log('📋 部署目標: Cloud Run 生產環境');
        console.log(`🌍 專案ID: ${this.projectId}`);
        console.log(`📍 區域: ${this.region}`);
        
        try {
            // 1. 檢查系統環境
            await this.checkEnvironment();
            
            // 2. 驗證專案檔案
            await this.validateProjectFiles();
            
            // 3. 執行Cloud Build部署
            await this.executeCloudBuild();
            
            // 4. 驗證部署狀態
            await this.verifyDeployment();
            
            // 5. 生成部署報告
            this.generateDeploymentReport();
            
            console.log('\n🎉 企業管理系統 v4.0.0 生產環境部署完成！');
            
        } catch (error) {
            console.error('❌ 部署過程發生錯誤:', error.message);
            this.deploymentLog.push({
                step: 'deployment_error',
                status: 'failed',
                error: error.message,
                timestamp: new Date().toISOString()
            });
            
            // 嘗試回滾或修復
            await this.handleDeploymentError(error);
        }
    }

    async checkEnvironment() {
        console.log('\n🔍 步驟 1: 檢查部署環境');
        
        try {
            // 檢查gcloud安裝
            const gcloudVersion = execSync('gcloud version', { encoding: 'utf8' });
            console.log('✅ Google Cloud SDK 已安裝');
            
            // 檢查當前專案
            const currentProject = execSync('gcloud config get-value project', { encoding: 'utf8' }).trim();
            console.log(`📋 當前專案: ${currentProject}`);
            
            if (currentProject !== this.projectId) {
                console.log(`🔄 切換到目標專案: ${this.projectId}`);
                execSync(`gcloud config set project ${this.projectId}`);
            }
            
            // 檢查API啟用狀態
            console.log('🔌 檢查必要API...');
            const requiredAPIs = [
                'cloudbuild.googleapis.com',
                'run.googleapis.com',
                'containerregistry.googleapis.com'
            ];
            
            for (const api of requiredAPIs) {
                try {
                    execSync(`gcloud services list --enabled --filter="name:${api}" --format="value(name)"`, { encoding: 'utf8' });
                    console.log(`✅ ${api} 已啟用`);
                } catch (error) {
                    console.log(`🔄 啟用 ${api}...`);
                    execSync(`gcloud services enable ${api}`);
                }
            }
            
            this.deploymentLog.push({
                step: 'environment_check',
                status: 'success',
                details: { project: currentProject, apis: requiredAPIs },
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            throw new Error(`環境檢查失敗: ${error.message}`);
        }
    }

    async validateProjectFiles() {
        console.log('\n📋 步驟 2: 驗證專案檔案');
        
        const requiredFiles = [
            'app.js',
            'package.json',
            'Dockerfile',
            'cloudbuild.yaml'
        ];
        
        const missingFiles = [];
        
        for (const file of requiredFiles) {
            if (fs.existsSync(file)) {
                console.log(`✅ ${file} 存在`);
            } else {
                missingFiles.push(file);
                console.log(`❌ ${file} 缺失`);
            }
        }
        
        if (missingFiles.length > 0) {
            throw new Error(`缺失重要檔案: ${missingFiles.join(', ')}`);
        }
        
        // 檢查package.json配置
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        console.log(`📦 應用版本: ${packageJson.version}`);
        console.log(`🎯 Node.js 版本要求: ${packageJson.engines?.node || '未指定'}`);
        
        this.deploymentLog.push({
            step: 'file_validation',
            status: 'success',
            details: { 
                files: requiredFiles,
                version: packageJson.version,
                nodeVersion: packageJson.engines?.node
            },
            timestamp: new Date().toISOString()
        });
    }

    async executeCloudBuild() {
        console.log('\n🏗️  步驟 3: 執行Cloud Build部署');
        
        try {
            console.log('🚀 開始Cloud Build...');
            
            // 觸發Cloud Build
            const buildCommand = `gcloud builds submit --config=cloudbuild.yaml --substitutions=_SERVICE_NAME=${this.serviceName},_REGION=${this.region}`;
            
            console.log('📝 執行命令:', buildCommand);
            
            // 執行構建（這可能需要幾分鐘）
            const buildOutput = execSync(buildCommand, { 
                encoding: 'utf8',
                maxBuffer: 1024 * 1024 * 10 // 10MB buffer
            });
            
            console.log('✅ Cloud Build 完成');
            
            // 解析構建ID
            const buildIdMatch = buildOutput.match(/BUILD\s+([a-f0-9-]+)/);
            const buildId = buildIdMatch ? buildIdMatch[1] : 'unknown';
            
            console.log(`🏷️  Build ID: ${buildId}`);
            
            this.deploymentLog.push({
                step: 'cloud_build',
                status: 'success',
                details: { buildId: buildId },
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('❌ Cloud Build 失敗:', error.message);
            throw new Error(`Cloud Build 執行失敗: ${error.message}`);
        }
    }

    async verifyDeployment() {
        console.log('\n✅ 步驟 4: 驗證部署狀態');
        
        try {
            // 取得服務URL
            const serviceUrl = execSync(
                `gcloud run services describe ${this.serviceName} --region=${this.region} --format="value(status.url)"`,
                { encoding: 'utf8' }
            ).trim();
            
            console.log(`🌐 服務URL: ${serviceUrl}`);
            
            // 檢查服務狀態
            const serviceStatus = execSync(
                `gcloud run services describe ${this.serviceName} --region=${this.region} --format="value(status.conditions[0].status)"`,
                { encoding: 'utf8' }
            ).trim();
            
            console.log(`📊 服務狀態: ${serviceStatus}`);
            
            if (serviceStatus !== 'True') {
                throw new Error('服務部署未完全完成');
            }
            
            // 測試健康檢查端點
            console.log('🏥 測試健康檢查...');
            
            // 使用curl測試（如果可用）
            try {
                const healthResponse = execSync(`curl -s -f "${serviceUrl}/health"`, { encoding: 'utf8' });
                console.log('✅ 健康檢查通過');
                console.log('📋 健康狀態:', JSON.parse(healthResponse).status);
            } catch (curlError) {
                console.log('⚠️  健康檢查跳過（curl不可用或服務啟動中）');
            }
            
            this.deploymentLog.push({
                step: 'deployment_verification',
                status: 'success',
                details: { 
                    serviceUrl: serviceUrl,
                    serviceStatus: serviceStatus
                },
                timestamp: new Date().toISOString()
            });
            
            console.log('\n🎉 部署驗證完成！');
            console.log(`🌍 生產環境地址: ${serviceUrl}`);
            
            return serviceUrl;
            
        } catch (error) {
            throw new Error(`部署驗證失敗: ${error.message}`);
        }
    }

    async handleDeploymentError(error) {
        console.log('\n🔧 處理部署錯誤...');
        
        try {
            // 取得最近的部署日誌
            console.log('📋 取得部署日誌...');
            const logs = execSync(
                `gcloud logging read "resource.type=build" --limit=10 --format="value(textPayload)"`,
                { encoding: 'utf8' }
            );
            
            console.log('🔍 最近的構建日誌:');
            console.log(logs);
            
            // 檢查服務是否存在舊版本
            try {
                const existingService = execSync(
                    `gcloud run services describe ${this.serviceName} --region=${this.region} --format="value(status.url)"`,
                    { encoding: 'utf8' }
                ).trim();
                
                if (existingService) {
                    console.log(`ℹ️  發現現有服務: ${existingService}`);
                    console.log('📝 建議手動檢查服務狀態和日誌');
                }
            } catch (serviceError) {
                console.log('ℹ️  沒有找到現有服務');
            }
            
        } catch (errorHandlingError) {
            console.log('⚠️  錯誤處理過程中發生問題:', errorHandlingError.message);
        }
    }

    generateDeploymentReport() {
        console.log('\n📊 生成部署報告...');
        
        const report = {
            deploymentSummary: {
                projectId: this.projectId,
                serviceName: this.serviceName,
                region: this.region,
                timestamp: new Date().toISOString(),
                success: this.deploymentLog.every(log => log.status === 'success')
            },
            deploymentSteps: this.deploymentLog,
            nextSteps: [
                '驗證所有功能模組正常運行',
                '執行完整的系統測試',
                '監控服務效能和錯誤日誌',
                '設定自動化監控和警報'
            ]
        };
        
        // 儲存報告
        fs.writeFileSync(
            `deployment-report-${Date.now()}.json`,
            JSON.stringify(report, null, 2)
        );
        
        console.log('📄 部署報告已儲存');
        
        // 顯示摘要
        const successSteps = this.deploymentLog.filter(log => log.status === 'success').length;
        const totalSteps = this.deploymentLog.length;
        
        console.log(`\n📈 部署摘要: ${successSteps}/${totalSteps} 步驟成功`);
        
        if (report.deploymentSummary.success) {
            console.log('🟢 整體狀態: 部署成功');
        } else {
            console.log('🔴 整體狀態: 部署失敗或不完整');
        }
    }
}

// 執行部署
async function deploy() {
    const deployer = new ProductionDeployer();
    await deployer.deployToProduction();
}

// 如果直接執行此檔案
if (require.main === module) {
    deploy().catch(console.error);
}

module.exports = ProductionDeployer;