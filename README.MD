# SubHouse - 订阅管理系统

Subhouse 是一个基于 Cloudflare Workers 的节点订阅管理系统，支持多种代理协议和订阅格式。

### 2024-03 更新
- 优化了环境变量处理逻辑
- 改进了订阅链接生成机制
- 增强了安全性检查

- 🚀 支持多种代理协议
  - VLESS
  - VMess
  - Trojan
  - Shadowsocks
  - Hysteria
  - Hysteria2
  - TUIC
  
- 📦 支持多种订阅格式
  - 通用格式
  - SingBox
  - Clash

- 🔐 安全特性
  - 基本身份认证
  - 集合级别访问控制
  - 可选密码保护

- 💼 节点管理
  - 添加/编辑/删除节点
  - 批量导入节点
  - 节点分组管理

- 🔄 集合管理
  - 创建/编辑/删除集合
  - 节点分组
  - 自定义访问控制

- 🔗 订阅功能
  - 生成订阅链接
  - 自定义订阅模板
  - 支持外部订阅转换

## 部署说明

### 方式一：使用 Cloudflare Pages 部署

1. Fork 本仓库到你的 GitHub 账号

2. 在 Cloudflare Pages 中创建新项目
   - 选择你 fork 的仓库
   - 构建设置：
     - 框架预设：None
     - 构建命令：不需要
     - 构建输出目录：不需要

3. 环境变量设置
   在 Pages 的设置中配置以下环境变量：
   ```
   NODE_STORE: your_kv_namespace_id
   DEFAULT_USERNAME: admin          # 必设，默认为 admin
   DEFAULT_PASSWORD: your_password  # 必设，默认为 admin
   SUB_WORKER_URL: https://xxx     # 可选，外部订阅转换服务地址
   DEFAULT_TEMPLATE_URL: https://xxx # 建议必设，默认订阅模板地址
   ```

4. 绑定 KV 命名空间
   - 在 Cloudflare 控制台创建 KV 命名空间
   - 在 Pages 设置中绑定 KV 命名空间：
     - 变量名称：`NODE_STORE`
     - 选择创建的 KV 命名空间

### 方式二：使用 Cloudflare Workers 部署

1. 下载本项目到本地

2. 建立好worker项目，进入编辑代码，右侧目录，选择上传文件，将本地文件依照目录上传或者复制，完成后点击部署，注意worker 部署需是woker.js 而不是_woker.js

3.变量设置同pages部署

| 变量名 | 必填 | 说明 |
|--------|------|------|
| NODE_STORE | 是 | KV 命名空间 ID，用于存储节点和集合数据 |
| DEFAULT_USERNAME | 是 | 管理员用户名，默认为 admin |
| DEFAULT_PASSWORD | 是 | 管理员密码，默认为 admin |
| SUB_WORKER_URL | 否 | 外部订阅转换服务地址，用于转换订阅格式 |
| SUBSCRIBER_URL | 否 | 自选订阅器地址，用于生成自定义订阅 |
| QUICK_SUB_URL | 否 | 快速订阅器地址，用于快速生成订阅 |
| DEFAULT_TEMPLATE_URL | 是 | 默认订阅模板，用于生成配合singbox和clash订阅生成，建议配置自己的需求 |

### KV 存储说明

系统使用 KV 存储以下数据：
- 节点信息
- 集合配置
- 用户令牌
- 模板配置

## 使用指南

## 使用指南

### 1. 用户登录
- 系统提供两种登录方式：
  1. 管理员登录（页面右上角）
     - 使用配置的 DEFAULT_USERNAME 和 DEFAULT_PASSWORD
     - 可以进行节点和集合管理
  
  2. 用户页登录（点击右上角"用户登录"）
     - 使用集合的用户名和密码
     - 只能访问被授权的集合
     - 适合分享给其他用户使用

### 2. 节点管理
- 访问系统首页，使用管理员账号登录
- 在左侧面板添加节点：
  - 输入节点名称
  - 粘贴节点链接（支持多种协议）
  - 点击"添加节点"

### 3. 集合管理
- 在右侧面板创建节点集合：
  - 输入集合名称
  - 选择要包含的节点
  - 可选：设置访问凭证（建议设置，用于用户页登录）
  - 点击"创建集合"

### 4. 订阅使用
- 集合创建后可以生成两种类型的订阅链接：

  1. 内部订阅链接（不配置 SUB_WORKER_URL 时）
     - 格式：`https://你的域名/api/share/集合ID/[base|clash|singbox]`
     - 直接从当前服务器获取配置
     - 支持访问密码保护
     - 适合个人使用

  2. 外部订阅链接（配置 SUB_WORKER_URL 时）
     - 格式：`https://订阅转换服务地址/[base|clash|singbox]?url=分享链接`
     - 通过外部服务转换配置
     - 支持更多自定义选项
     - 适合分享给他人使用

### 5. 使用自定义配置模板
1. 通过 URL 参数指定模板
   - 在订阅链接后添加 `?template=模板地址`
   - 例如：`https://你的域名/api/share/xxx/clash?template=https://raw.githubusercontent.com/xxx.txt` 模版的规则书写请查看项目 https://github.com/Troywww/Subhub

2. 设置默认模板
   - 在环境变量中设置 `DEFAULT_TEMPLATE_URL`
   - 所有未指定模板的订阅都将使用此模板

3. 模板格式要求
   - Clash 模板：使用标准的 Clash 配置格式，使用 `custom_proxy_group` 定义分组
   - SingBox 模板：使用标准的 SingBox 配置格式
   - 可参考项目提供的默认模板

### 6. 外部订阅转换服务
1. 部署说明
   - 参考 https://github.com/Troywww/Subhub 部署独立的订阅转换服务
   - 设置环境变量 `SUB_WORKER_URL` 为转换服务地址

2. 使用场景
   - 需要额外的订阅转换功能
   - 想要自定义转换规则
   - 分享订阅给其他用户使用

3. 注意事项
   - 外部转换服务需要能访问到你的节点管理系统
   - 建议配置访问控制和速率限制
   - 注意保护订阅链接安全

## 项目结构
subhouse/
├── worker.js # Worker 入口文件
├── config.js # 配置文件
├── management.js # 管理界面
└── subscription/ # 订阅转换模块
├── clash.js # Clash 配置生成
└── singbox.js # SingBox 配置生成


## 注意事项

1. 安全性
   - 及时修改默认登录凭证
   - 妥善保管订阅链接
   - 建议为重要集合设置访问密码

2. 使用限制
   - 注意 CF Worker 的调用限制
   - 关注 KV 存储的容量限制
   - 遵守 Cloudflare 的服务条款

3. 最佳实践
   - 定期备份节点数据
   - 使用自定义域名
   - 合理规划节点分组

## 问题反馈

如遇问题，请提交 Issue 或联系开发者
