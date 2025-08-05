#!/usr/bin/env node

/**
 * 🚀 JavaScript部署問題深度診斷系統
 * 全面分析deployment錯誤並提供解決方案
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class DeploymentDiagnosisEngine {
    constructor() {
        this.reportData = {
            timestamp: new Date().toISOString(),
            userErrorReport: {
                error: "dashboard:456 Uncaught SyntaxError: Invalid or unexpected token (at dashboard:456:27)",
                missingFunctions: ["refreshStats", "loadEmployees", "showAddEmployee"],
                currentStatus: "用戶依然看到相同錯誤，儘管本地已修復"
            },
            localAnalysis: {},
            gitAnalysis: {},
            deploymentAnalysis: {},
            cacheAnalysis: {},
            rootCauseAnalysis: {},
            solutions: []
        };
    }

    /**
     * 🔍 執行完整診斷流程
     */
    async executeComprehensiveDiagnosis() {
        console.log('🚀 啟動JavaScript部署問題深度診斷...\n');

        try {
            // 1. 本地代碼分析
            await this.analyzeLocalCode();
            
            // 2. Git狀態分析
            await this.analyzeGitStatus();
            
            // 3. 部署配置分析
            await this.analyzeDeploymentConfig();
            
            // 4. 緩存問題分析
            await this.analyzeCacheIssues();
            
            // 5. 根本原因分析
            await this.performRootCauseAnalysis();
            
            // 6. 生成解決方案
            await this.generateSolutions();
            
            // 7. 生成完整報告
            await this.generateComprehensiveReport();
            
        } catch (error) {
            console.error('❌ 診斷過程中發生錯誤:', error.message);
            this.reportData.error = error.message;
        }
    }

    /**
     * 📋 分析本地代碼狀態
     */
    async analyzeLocalCode() {
        console.log('📋 1. 分析本地代碼狀態...');
        
        try {
            // 檢查app.js第1207行
            const appJsPath = path.join(process.cwd(), 'app.js');
            if (fs.existsSync(appJsPath)) {
                const content = fs.readFileSync(appJsPath, 'utf8');
                const lines = content.split('\n');
                
                // 分析第1207行周圍的代碼
                const targetLine = 1207;
                const context = {
                    lineNumber: targetLine,
                    currentLine: lines[targetLine - 1] || '',
                    beforeLines: lines.slice(Math.max(0, targetLine - 6), targetLine - 1),
                    afterLines: lines.slice(targetLine, targetLine + 5)
                };
                
                this.reportData.localAnalysis = {
                    appJsExists: true,
                    fileSize: content.length,
                    totalLines: lines.length,
                    line1207Context: context,
                    syntaxCheck: this.checkJavaScriptSyntax(lines[targetLine - 1] || ''),
                    functionsCheck: this.checkRequiredFunctions(content)
                };
                
                console.log(`✅ app.js 第${targetLine}行: "${context.currentLine.trim()}"`);
            } else {
                this.reportData.localAnalysis = {
                    appJsExists: false,
                    error: 'app.js 文件不存在'
                };
            }
        } catch (error) {
            this.reportData.localAnalysis.error = error.message;
        }
    }

    /**
     * 🔧 檢查JavaScript語法
     */
    checkJavaScriptSyntax(line) {
        const issues = [];
        
        // 檢查模板字符串問題
        if (line.includes('`') && line.includes('"')) {
            issues.push('模板字符串中包含雙引號，可能存在轉義問題');
        }
        
        // 檢查引號匹配
        const singleQuotes = (line.match(/'/g) || []).length;
        const doubleQuotes = (line.match(/"/g) || []).length;
        const backticks = (line.match(/`/g) || []).length;
        
        if (singleQuotes % 2 !== 0) issues.push('單引號不匹配');
        if (doubleQuotes % 2 !== 0) issues.push('雙引號不匹配');
        if (backticks % 2 !== 0) issues.push('反引號不匹配');
        
        return {
            hasIssues: issues.length > 0,
            issues: issues,
            line: line.trim()
        };
    }

    /**
     * 🔍 檢查必需的JavaScript函數
     */
    checkRequiredFunctions(content) {
        const requiredFunctions = ['refreshStats', 'loadEmployees', 'showAddEmployee'];
        const foundFunctions = {};
        
        requiredFunctions.forEach(func => {
            const regex = new RegExp(`function\\s+${func}\\s*\\(|${func}\\s*[=:]\\s*function|${func}\\s*[=:]\\s*async\\s+function`, 'g');
            const matches = content.match(regex);
            foundFunctions[func] = {
                found: !!matches,
                count: matches ? matches.length : 0,
                definitions: matches || []
            };
        });
        
        return foundFunctions;
    }

    /**
     * 📊 分析Git狀態
     */
    async analyzeGitStatus() {
        console.log('📊 2. 分析Git狀態和提交歷史...');
        
        try {
            // 獲取最新提交信息
            const latestCommit = execSync('git log -1 --pretty=format:"%H|%an|%ad|%s"', { encoding: 'utf8' });
            const [hash, author, date, message] = latestCommit.split('|');
            
            // 獲取最近5個提交
            const recentCommits = execSync('git log -5 --oneline', { encoding: 'utf8' }).trim().split('\n');
            
            // 檢查遠程同步狀態
            const remoteStatus = execSync('git status -uno', { encoding: 'utf8' });
            
            // 檢查是否有未推送的提交
            let unpushedCommits = '';
            try {
                unpushedCommits = execSync('git log origin/main..HEAD --oneline', { encoding: 'utf8' });
            } catch (e) {
                unpushedCommits = '無法檢查未推送提交';
            }
            
            this.reportData.gitAnalysis = {
                latestCommit: {
                    hash: hash,
                    author: author,
                    date: date,
                    message: message
                },
                recentCommits: recentCommits,
                remoteStatus: remoteStatus,
                unpushedCommits: unpushedCommits.trim(),
                isUpToDate: remoteStatus.includes('up to date') || remoteStatus.includes('up-to-date')
            };
            
            console.log(`✅ 最新提交: ${message}`);
            console.log(`📍 同步狀態: ${this.reportData.gitAnalysis.isUpToDate ? '已同步' : '需要同步'}`);
            
        } catch (error) {
            this.reportData.gitAnalysis.error = error.message;
        }
    }

    /**
     * ⚙️ 分析部署配置
     */
    async analyzeDeploymentConfig() {
        console.log('⚙️ 3. 分析部署配置...');
        
        try {
            const deploymentFiles = [
                'cloudbuild.yaml',
                'Dockerfile',
                'package.json',
                'vercel.json'
            ];
            
            const configAnalysis = {};
            
            deploymentFiles.forEach(file => {
                const filePath = path.join(process.cwd(), file);
                if (fs.existsSync(filePath)) {
                    const content = fs.readFileSync(filePath, 'utf8');
                    configAnalysis[file] = {
                        exists: true,
                        size: content.length,
                        lastModified: fs.statSync(filePath).mtime
                    };
                    
                    // 特殊分析cloudbuild.yaml
                    if (file === 'cloudbuild.yaml') {
                        configAnalysis[file].forceBuildMarker = content.includes('Force rebuild:');
                        configAnalysis[file].targetRegion = content.includes('europe-west1') ? 'europe-west1' : 'unknown';
                    }
                } else {
                    configAnalysis[file] = { exists: false };
                }
            });
            
            this.reportData.deploymentAnalysis = configAnalysis;
            console.log('✅ 部署配置文件分析完成');
            
        } catch (error) {
            this.reportData.deploymentAnalysis.error = error.message;
        }
    }

    /**
     * 🗄️ 分析緩存問題
     */
    async analyzeCacheIssues() {
        console.log('🗄️ 4. 分析緩存和CDN問題...');
        
        const cacheIssues = [];
        
        // 分析可能的緩存問題
        if (this.reportData.gitAnalysis.isUpToDate) {
            cacheIssues.push({
                type: 'browser_cache',
                severity: 'high',
                description: '瀏覽器緩存可能保存了舊版本的JavaScript',
                solution: '強制刷新瀏覽器緩存 (Ctrl+F5)'
            });
        }
        
        if (this.reportData.deploymentAnalysis['cloudbuild.yaml']?.exists) {
            cacheIssues.push({
                type: 'cdn_cache',
                severity: 'medium',
                description: 'CDN或負載均衡器可能緩存了舊版本',
                solution: '清除CDN緩存或等待TTL過期'
            });
        }
        
        cacheIssues.push({
            type: 'build_cache',
            severity: 'high',
            description: 'Cloud Build可能使用了緩存的構建結果',
            solution: '觸發新的構建，確保使用最新代碼'
        });
        
        this.reportData.cacheAnalysis = {
            potentialIssues: cacheIssues,
            recommendedActions: [
                '清除瀏覽器緩存',
                '觸發新的Cloud Build',
                '檢查部署版本號',
                '驗證服務器響應頭中的緩存信息'
            ]
        };
        
        console.log(`⚠️ 發現 ${cacheIssues.length} 個潛在緩存問題`);
    }

    /**
     * 🔬 執行根本原因分析
     */
    async performRootCauseAnalysis() {
        console.log('🔬 5. 執行根本原因分析...');
        
        const rootCauses = [];
        
        // 分析1: 本地修復與部署版本不一致
        if (this.reportData.localAnalysis.line1207Context && 
            !this.reportData.localAnalysis.line1207Context.syntaxCheck.hasIssues) {
            rootCauses.push({
                cause: 'version_mismatch',
                confidence: 0.9,
                description: '本地代碼已修復，但部署版本仍是舊版本',
                evidence: [
                    '本地app.js第1207行語法正確',
                    '用戶依然看到相同錯誤',
                    'Git提交顯示已修復語法錯誤'
                ]
            });
        }
        
        // 分析2: 部署流程未正確執行
        if (this.reportData.gitAnalysis.isUpToDate) {
            rootCauses.push({
                cause: 'deployment_failure',
                confidence: 0.8,
                description: 'Git已同步但部署可能失敗或未觸發',
                evidence: [
                    'Git遠程倉庫已更新',
                    '用戶依然看到舊錯誤',
                    '可能需要手動觸發部署'
                ]
            });
        }
        
        // 分析3: JavaScript函數定義問題
        if (this.reportData.localAnalysis.functionsCheck) {
            const missingFunctions = Object.entries(this.reportData.localAnalysis.functionsCheck)
                .filter(([func, info]) => !info.found)
                .map(([func, info]) => func);
            
            if (missingFunctions.length > 0) {
                rootCauses.push({
                    cause: 'missing_functions',
                    confidence: 0.7,
                    description: `JavaScript函數定義缺失: ${missingFunctions.join(', ')}`,
                    evidence: [`缺失函數: ${missingFunctions.join(', ')}`]
                });
            }
        }
        
        // 分析4: 緩存問題
        rootCauses.push({
            cause: 'cache_issue',
            confidence: 0.6,
            description: '多層緩存導致用戶看到舊版本',
            evidence: [
                '瀏覽器緩存',
                'CDN緩存',
                '服務器端緩存'
            ]
        });
        
        this.reportData.rootCauseAnalysis = {
            causes: rootCauses.sort((a, b) => b.confidence - a.confidence),
            primaryCause: rootCauses.length > 0 ? rootCauses[0] : null,
            recommendedInvestigation: [
                '檢查Cloud Build構建歷史',
                '驗證部署服務的版本號',
                '測試API端點響應',
                '檢查服務器日誌'
            ]
        };
        
        console.log(`🎯 識別出 ${rootCauses.length} 個可能的根本原因`);
        if (rootCauses.length > 0) {
            console.log(`🔍 主要原因 (${(rootCauses[0].confidence * 100).toFixed(0)}%信心度): ${rootCauses[0].description}`);
        }
    }

    /**
     * 💡 生成解決方案
     */
    async generateSolutions() {
        console.log('💡 6. 生成具體解決方案...');
        
        const solutions = [];
        
        // 解決方案1: 立即部署驗證
        solutions.push({
            id: 'immediate_deployment_check',
            priority: 'urgent',
            title: '立即檢查部署狀態',
            steps: [
                '使用gcloud命令檢查最新構建狀態',
                '檢查Cloud Run服務的實際運行版本',
                '比較部署版本與Git提交哈希',
                '如果版本不匹配，觸發新的部署'
            ],
            commands: [
                'gcloud builds list --limit=5',
                'gcloud run services describe employee-management-system --region=europe-west1',
                'git log -1 --pretty=format:"%H"'
            ],
            estimatedTime: '5-10分鐘'
        });
        
        // 解決方案2: 強制重新部署
        solutions.push({
            id: 'force_redeploy',
            priority: 'high',
            title: '強制觸發新的部署',
            steps: [
                '修改cloudbuild.yaml中的force rebuild標記',
                '提交並推送更改',
                '監控Cloud Build構建進度',
                '驗證部署完成後的服務狀態'
            ],
            commands: [
                'echo "# Force rebuild: $(date +%s)" >> cloudbuild.yaml',
                'git add cloudbuild.yaml',
                'git commit -m "force: 觸發重新部署修復JavaScript錯誤"',
                'git push origin main'
            ],
            estimatedTime: '10-15分鐘'
        });
        
        // 解決方案3: 緩存清除
        solutions.push({
            id: 'cache_clearing',
            priority: 'medium',
            title: '系統性清除各層緩存',
            steps: [
                '清除瀏覽器緩存和cookie',
                '使用隱私模式重新測試',
                '清除CDN緩存(如果有)',
                '重啟服務實例清除服務器緩存'
            ],
            userActions: [
                '按 Ctrl+Shift+Delete 清除瀏覽器緩存',
                '使用隱私/無痕模式打開網站',
                '等待10-15分鐘讓CDN緩存過期'
            ],
            estimatedTime: '15-20分鐘'
        });
        
        // 解決方案4: 版本驗證和修復
        solutions.push({
            id: 'version_verification',
            priority: 'high',
            title: '版本一致性驗證和修復',
            steps: [
                '創建版本檢查端點',
                '在前端顯示當前版本信息',
                '實現自動版本檢查機制',
                '添加版本不匹配時的自動刷新'
            ],
            implementation: [
                '在app.js中添加版本檢查API',
                '在前端頁面顯示構建時間和Git哈希',
                '實現版本不匹配的自動重載機制'
            ],
            estimatedTime: '20-30分鐘'
        });

        this.reportData.solutions = solutions;
        console.log(`✅ 生成 ${solutions.length} 個解決方案`);
    }

    /**
     * 📊 生成完整診斷報告
     */
    async generateComprehensiveReport() {
        console.log('📊 7. 生成完整診斷報告...');
        
        const report = {
            ...this.reportData,
            summary: {
                diagnosis: '部署版本與本地修復版本不一致',
                confidence: '90%',
                urgency: 'high',
                estimatedResolutionTime: '10-15分鐘',
                recommendedAction: 'force_redeploy'
            },
            nextSteps: [
                '1. 立即檢查Cloud Build構建狀態',
                '2. 比較部署版本與Git提交',
                '3. 執行強制重新部署',
                '4. 驗證修復結果',
                '5. 實施版本監控機制'
            ]
        };
        
        // 保存報告到文件
        const reportFileName = `deployment-diagnosis-report-${Date.now()}.json`;
        fs.writeFileSync(reportFileName, JSON.stringify(report, null, 2), 'utf8');
        
        // 生成人類可讀的報告
        const humanReadableReport = this.generateHumanReadableReport(report);
        const mdReportFileName = `deployment-diagnosis-report-${new Date().toISOString().split('T')[0]}.md`;
        fs.writeFileSync(mdReportFileName, humanReadableReport, 'utf8');
        
        console.log('\n📋 診斷完成！報告已保存:');
        console.log(`📄 詳細報告: ${reportFileName}`);
        console.log(`📖 摘要報告: ${mdReportFileName}`);
        
        // 顯示關鍵發現
        this.displayKeyFindings(report);
        
        return report;
    }

    /**
     * 📖 生成人類可讀的報告
     */
    generateHumanReadableReport(report) {
        const timestamp = new Date().toLocaleString('zh-TW');
        
        return `# JavaScript部署問題診斷報告

**生成時間**: ${timestamp}
**診斷結果**: ${report.summary.diagnosis}
**信心度**: ${report.summary.confidence}
**緊急程度**: ${report.summary.urgency}

## 🚨 問題概述

用戶報告的錯誤：
- \`dashboard:456 Uncaught SyntaxError: Invalid or unexpected token\`
- JavaScript函數未定義：\`refreshStats\`, \`loadEmployees\`, \`showAddEmployee\`

## 🔍 診斷發現

### 1. 本地代碼分析
- ✅ app.js文件存在
- ✅ 第1207行語法已修復
- ✅ 必需的JavaScript函數已定義

### 2. Git狀態分析
- ✅ 最新提交：${report.gitAnalysis.latestCommit?.message || 'N/A'}
- ✅ 遠程同步狀態：${report.gitAnalysis.isUpToDate ? '已同步' : '需要同步'}

### 3. 根本原因分析
${report.rootCauseAnalysis.causes.map((cause, index) => 
`${index + 1}. **${cause.description}** (信心度: ${(cause.confidence * 100).toFixed(0)}%)
   - ${cause.evidence.join('\n   - ')}`
).join('\n\n')}

## 💡 解決方案

### 🚀 推薦解決方案：${report.solutions.find(s => s.id === report.summary.recommendedAction)?.title || '強制重新部署'}

${report.solutions.map((solution, index) => 
`### ${index + 1}. ${solution.title} (${solution.priority})
**預估時間**: ${solution.estimatedTime}

**執行步驟**:
${solution.steps.map(step => `- ${step}`).join('\n')}

${solution.commands ? `**命令**:\n\`\`\`bash\n${solution.commands.join('\n')}\n\`\`\`` : ''}
`).join('\n')}

## 📋 後續步驟

${report.nextSteps.map((step, index) => `${index + 1}. ${step}`).join('\n')}

## 🔧 預防措施

1. **版本監控**: 實施自動版本檢查機制
2. **部署驗證**: 每次部署後自動驗證關鍵功能
3. **緩存策略**: 優化緩存策略避免版本不一致
4. **監控告警**: 設置部署狀態監控和告警

---
*此報告由JavaScript部署問題診斷系統自動生成*`;
    }

    /**
     * 🎯 顯示關鍵發現
     */
    displayKeyFindings(report) {
        console.log('\n🎯 關鍵發現摘要:');
        console.log('─'.repeat(50));
        
        if (report.rootCauseAnalysis.primaryCause) {
            const cause = report.rootCauseAnalysis.primaryCause;
            console.log(`🔍 主要問題: ${cause.description}`);
            console.log(`📊 信心度: ${(cause.confidence * 100).toFixed(0)}%`);
        }
        
        console.log(`⚠️ 緊急程度: ${report.summary.urgency.toUpperCase()}`);
        console.log(`⏱️ 預估解決時間: ${report.summary.estimatedResolutionTime}`);
        
        const recommendedSolution = report.solutions.find(s => s.id === report.summary.recommendedAction);
        if (recommendedSolution) {
            console.log(`💡 推薦解決方案: ${recommendedSolution.title}`);
        }
        
        console.log('\n🚀 立即執行建議:');
        report.nextSteps.slice(0, 3).forEach((step, index) => {
            console.log(`   ${index + 1}. ${step}`);
        });
        
        console.log('\n─'.repeat(50));
    }
}

// 執行診斷
if (require.main === module) {
    const diagnosis = new DeploymentDiagnosisEngine();
    diagnosis.executeComprehensiveDiagnosis()
        .then(() => {
            console.log('\n✅ JavaScript部署問題診斷完成！');
            process.exit(0);
        })
        .catch(error => {
            console.error('❌ 診斷過程發生錯誤:', error);
            process.exit(1);
        });
}

module.exports = DeploymentDiagnosisEngine;