/**
 * 系統完整性檢查和驗證腳本
 * 檢查所有模組和功能是否正確實現
 */

const SystemVerification = {
  
  /**
   * 執行完整系統驗證
   */
  async runCompleteVerification() {
    console.log('🔍 開始執行系統完整性檢查...');
    
    const results = {
      timestamp: new Date().toISOString(),
      totalChecks: 0,
      passedChecks: 0,
      failedChecks: 0,
      modules: {},
      issues: [],
      recommendations: []
    };
    
    try {
      // 1. 檢查後端模組
      await this.verifyBackendModules(results);
      
      // 2. 檢查前端模組
      await this.verifyFrontendModules(results);
      
      // 3. 檢查配置檔案
      await this.verifyConfigFiles(results);
      
      // 4. 檢查部署配置
      await this.verifyDeploymentConfig(results);
      
      // 5. 生成報告
      this.generateVerificationReport(results);
      
      return results;
      
    } catch (error) {
      console.error('系統驗證失敗:', error);
      results.issues.push({
        type: 'CRITICAL',
        message: `系統驗證過程失敗: ${error.message}`
      });
      return results;
    }
  },
  
  /**
   * 檢查後端模組
   */
  async verifyBackendModules(results) {
    console.log('📦 檢查後端模組...');
    
    const backendModules = [
      { name: 'EmployeeModule', path: 'D:/0802/backend/modules/employee.js' },
      { name: 'AttendanceModule', path: 'D:/0802/backend/modules/attendance.js' },
      { name: 'RevenueModule', path: 'D:/0802/backend/modules/revenue.js' },
      { name: 'OrderingModule', path: 'D:/0802/backend/modules/ordering.js' },
      { name: 'ScheduleModule', path: 'D:/0802/backend/modules/schedule.js' },
      { name: 'PromotionModule', path: 'D:/0802/backend/modules/promotion.js' },
      { name: 'MaintenanceModule', path: 'D:/0802/backend/modules/maintenance.js' }
    ];
    
    const utilModules = [
      { name: 'DatabaseUtils', path: 'D:/0802/backend/utils/database.js' },
      { name: 'ValidationUtils', path: 'D:/0802/backend/utils/validation.js' },
      { name: 'TelegramUtils', path: 'D:/0802/backend/utils/telegram.js' }
    ];
    
    results.modules.backend = {};
    
    // 檢查核心模組
    for (const module of backendModules) {
      const checkResult = await this.checkModuleFile(module);
      results.modules.backend[module.name] = checkResult;
      results.totalChecks++;
      
      if (checkResult.exists && checkResult.valid) {
        results.passedChecks++;
      } else {
        results.failedChecks++;
        results.issues.push({
          type: 'ERROR',
          module: module.name,
          message: checkResult.message || '模組檔案缺失或無效'
        });
      }
    }
    
    // 檢查工具模組
    for (const module of utilModules) {
      const checkResult = await this.checkModuleFile(module);
      results.modules.backend[module.name] = checkResult;
      results.totalChecks++;
      
      if (checkResult.exists && checkResult.valid) {
        results.passedChecks++;
      } else {
        results.failedChecks++;
        results.issues.push({
          type: 'ERROR',
          module: module.name,
          message: checkResult.message || '工具模組檔案缺失或無效'
        });
      }
    }
  },
  
  /**
   * 檢查前端模組
   */
  async verifyFrontendModules(results) {
    console.log('🌐 檢查前端模組...');
    
    const frontendModules = [
      { name: 'APIClient', path: 'D:/0802/frontend/js/utils/api.js' },
      { name: 'LocationUtils', path: 'D:/0802/frontend/js/utils/location.js' },
      { name: 'DeviceUtils', path: 'D:/0802/frontend/js/utils/device.js' },
      { name: 'ValidationUtils', path: 'D:/0802/frontend/js/utils/validation.js' },
      { name: 'AuthModule', path: 'D:/0802/frontend/js/modules/auth.js' },
      { name: 'AttendanceModule', path: 'D:/0802/frontend/js/modules/attendance.js' },
      { name: 'RevenueModule', path: 'D:/0802/frontend/js/modules/revenue.js' },
      { name: 'OrderingModule', path: 'D:/0802/frontend/js/modules/ordering.js' },
      { name: 'MainApp', path: 'D:/0802/frontend/js/app.js' }
    ];
    
    const frontendAssets = [
      { name: 'IndexHTML', path: 'D:/0802/frontend/index.html' },
      { name: 'MainCSS', path: 'D:/0802/frontend/css/style.css' }
    ];
    
    results.modules.frontend = {};
    
    // 檢查前端模組
    for (const module of frontendModules) {
      const checkResult = await this.checkModuleFile(module);
      results.modules.frontend[module.name] = checkResult;
      results.totalChecks++;
      
      if (checkResult.exists && checkResult.valid) {
        results.passedChecks++;
      } else {
        results.failedChecks++;
        results.issues.push({
          type: 'ERROR',
          module: module.name,
          message: checkResult.message || '前端模組檔案缺失或無效'
        });
      }
    }
    
    // 檢查前端資源
    for (const asset of frontendAssets) {
      const checkResult = await this.checkModuleFile(asset);
      results.modules.frontend[asset.name] = checkResult;
      results.totalChecks++;
      
      if (checkResult.exists) {
        results.passedChecks++;
      } else {
        results.failedChecks++;
        results.issues.push({
          type: 'ERROR',
          module: asset.name,
          message: '前端資源檔案缺失'
        });
      }
    }
  },
  
  /**
   * 檢查配置檔案
   */
  async verifyConfigFiles(results) {
    console.log('⚙️ 檢查配置檔案...');
    
    const configFiles = [
      { name: 'PackageJSON', path: 'D:/0802/package.json' },
      { name: 'Dockerfile', path: 'D:/0802/Dockerfile' },
      { name: 'DockerCompose', path: 'D:/0802/docker-compose.yml' },
      { name: 'GitHubActions', path: 'D:/0802/.github/workflows/deploy.yml' },
      { name: 'DeploymentGuide', path: 'D:/0802/deployment/deployment-guide.md' }
    ];
    
    results.modules.config = {};
    
    for (const config of configFiles) {
      const checkResult = await this.checkModuleFile(config);
      results.modules.config[config.name] = checkResult;
      results.totalChecks++;
      
      if (checkResult.exists) {
        results.passedChecks++;
      } else {
        results.failedChecks++;
        results.issues.push({
          type: 'WARNING',
          module: config.name,
          message: '配置檔案缺失'
        });
      }
    }
  },
  
  /**
   * 檢查部署配置
   */
  async verifyDeploymentConfig(results) {
    console.log('🚀 檢查部署配置...');
    
    // 檢查 package.json 是否包含必要的依賴
    const packageCheck = await this.verifyPackageDependencies();
    results.modules.deployment = { packageDependencies: packageCheck };
    results.totalChecks++;
    
    if (packageCheck.valid) {
      results.passedChecks++;
    } else {
      results.failedChecks++;
      results.issues.push({
        type: 'WARNING',
        module: 'PackageDependencies',
        message: packageCheck.message
      });
    }
    
    // 檢查環境變數範例
    const envExampleCheck = await this.checkEnvironmentTemplate();
    results.modules.deployment.envTemplate = envExampleCheck;
    results.totalChecks++;
    
    if (envExampleCheck.valid) {
      results.passedChecks++;
    } else {
      results.failedChecks++;
      results.recommendations.push('建議創建 .env.example 檔案說明環境變數配置');
    }
  },
  
  /**
   * 檢查模組檔案
   */
  async checkModuleFile(module) {
    try {
      const fs = require('fs').promises;
      
      try {
        const stats = await fs.stat(module.path.replace(/\//g, '\\'));
        const content = await fs.readFile(module.path.replace(/\//g, '\\'), 'utf8');
        
        // 基本內容檢查
        const hasContent = content.length > 100;
        const hasJSStructure = content.includes('function') || content.includes('class') || content.includes('=>');
        
        return {
          exists: true,
          valid: hasContent && hasJSStructure,
          size: stats.size,
          modified: stats.mtime,
          message: hasContent && hasJSStructure ? '模組檔案正常' : '模組檔案內容不完整'
        };
      } catch (error) {
        return {
          exists: false,
          valid: false,
          message: `檔案不存在: ${error.message}`
        };
      }
    } catch (error) {
      return {
        exists: false,
        valid: false,
        message: `檢查失敗: ${error.message}`
      };
    }
  },
  
  /**
   * 檢查 package.json 依賴
   */
  async verifyPackageDependencies() {
    try {
      const fs = require('fs').promises;
      const packagePath = 'D:/0802/package.json';
      
      try {
        const content = await fs.readFile(packagePath.replace(/\//g, '\\'), 'utf8');
        const pkg = JSON.parse(content);
        
        const requiredDeps = ['express', 'cors'];
        const requiredDevDeps = ['nodemon'];
        
        const missingDeps = [];
        const missingDevDeps = [];
        
        requiredDeps.forEach(dep => {
          if (!pkg.dependencies || !pkg.dependencies[dep]) {
            missingDeps.push(dep);
          }
        });
        
        requiredDevDeps.forEach(dep => {
          if (!pkg.devDependencies || !pkg.devDependencies[dep]) {
            missingDevDeps.push(dep);
          }
        });
        
        if (missingDeps.length === 0 && missingDevDeps.length === 0) {
          return { valid: true, message: '所有必要依賴都已配置' };
        } else {
          return {
            valid: false,
            message: `缺失依賴: ${[...missingDeps, ...missingDevDeps].join(', ')}`
          };
        }
      } catch (error) {
        return { valid: false, message: 'package.json 檔案無效或不存在' };
      }
    } catch (error) {
      return { valid: false, message: `依賴檢查失敗: ${error.message}` };
    }
  },
  
  /**
   * 檢查環境變數範本
   */
  async checkEnvironmentTemplate() {
    try {
      const fs = require('fs').promises;
      const envExamplePath = 'D:/0802/.env.example';
      
      try {
        await fs.stat(envExamplePath.replace(/\//g, '\\'));
        return { valid: true, message: '環境變數範本存在' };
      } catch (error) {
        return { valid: false, message: '缺少 .env.example 範本檔案' };
      }
    } catch (error) {
      return { valid: false, message: `環境變數範本檢查失敗: ${error.message}` };
    }
  },
  
  /**
   * 生成驗證報告
   */
  generateVerificationReport(results) {
    const successRate = ((results.passedChecks / results.totalChecks) * 100).toFixed(1);
    
    console.log('\n📊 ===== 系統驗證報告 =====');
    console.log(`⏰ 檢查時間: ${results.timestamp}`);
    console.log(`📈 成功率: ${successRate}% (${results.passedChecks}/${results.totalChecks})`);
    console.log(`✅ 通過檢查: ${results.passedChecks}`);
    console.log(`❌ 失敗檢查: ${results.failedChecks}`);
    
    if (results.issues.length > 0) {
      console.log('\n⚠️ 發現問題:');
      results.issues.forEach((issue, index) => {
        console.log(`${index + 1}. [${issue.type}] ${issue.module ? issue.module + ': ' : ''}${issue.message}`);
      });
    }
    
    if (results.recommendations.length > 0) {
      console.log('\n💡 建議:');
      results.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    }
    
    // 模組狀態摘要
    console.log('\n📦 模組狀態摘要:');
    Object.entries(results.modules).forEach(([category, modules]) => {
      console.log(`\n${category.toUpperCase()}:`);
      Object.entries(modules).forEach(([name, status]) => {
        const icon = status.exists && status.valid ? '✅' : '❌';
        console.log(`  ${icon} ${name}: ${status.message}`);
      });
    });
    
    // 總結
    console.log('\n🎯 總結:');
    if (successRate >= 90) {
      console.log('🎉 系統狀態良好，大部分功能已正確實現！');
    } else if (successRate >= 70) {
      console.log('⚠️ 系統基本可用，但存在一些問題需要修正。');
    } else {
      console.log('❌ 系統存在較多問題，建議優先修復重要模組。');
    }
    
    console.log('============================\n');
    
    // 保存報告到檔案
    this.saveReportToFile(results);
  },
  
  /**
   * 保存報告到檔案
   */
  async saveReportToFile(results) {
    try {
      const fs = require('fs').promises;
      const reportPath = 'D:/0802/verification-report.json';
      
      await fs.writeFile(
        reportPath.replace(/\//g, '\\'),
        JSON.stringify(results, null, 2),
        'utf8'
      );
      
      console.log(`📄 驗證報告已保存到: ${reportPath}`);
    } catch (error) {
      console.error('保存驗證報告失敗:', error);
    }
  }
};

// 執行驗證（如果直接運行此腳本）
if (require.main === module) {
  SystemVerification.runCompleteVerification()
    .then(results => {
      process.exit(results.failedChecks > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('驗證失敗:', error);
      process.exit(1);
    });
}

module.exports = SystemVerification;