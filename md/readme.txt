一、项目基本信息
项目名称：智能电价预测与决策系统
赛道方向：大数据应用
场景定位：竞赛演示前端 + 源码包
输出物：前端原型、源码包、数据集样本、竞赛相关文档
二、核心亮点
多源特征融合机制
时空联合预测模型
异常事件感知模块
从监控到策略推荐的端到端工作流
三、技术栈
前端基础：HTML
样式框架：Tailwind CSS（通过 CDN 引入）
可视化：Chart.js 4.4.1
脚本语言：JavaScript（ES Modules 规范）
本地运行：Python / PowerShell 静态服务器
四、目录说明
data/：存放数据集样本，仅用于演示和答辩环节
screenshots/：存放竞赛各模块截图，文件命名及对应模块：
home-dashboard.png → 首页仪表盘
history-analysis.png → 历史数据模块
forecast-analysis.png → 预测分析模块
decision-recommendation.png → 决策推荐模块
model-comparison.png → 模型对比模块
五、运行方法
方式 1：Python 启动本地静态服务器
确保本地已安装 Python 环境
进入项目根目录，执行命令：python -m http.server
浏览器访问 localhost:8000 即可打开前端原型
方式 2：PowerShell 启动本地静态服务器
打开 PowerShell 并进入项目根目录
执行 PowerShell 静态服务器启动命令（适配本地 PowerShell 版本）
浏览器访问对应端口（默认 8000）打开前端原型
六、注意事项
本源码包基于当前项目开发，非去年获奖案例版本
data/ 目录仅包含数据集样本，非完整数据集
若重新生成截图，需保持 screenshots/ 目录下文件为英文命名，且与上述命名规则一致
运行前确保网络正常（Tailwind CSS、Chart.js 依赖 CDN 加载）