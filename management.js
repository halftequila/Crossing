import { CONFIG, getConfig } from './config.js';

// Generate management page with Bauhaus design principles
export function generateManagementPage(env, CONFIG) {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            ${generateHead()}
        </head>
        <body class="bg-white min-h-screen">
            ${generateHeader(CONFIG, env)}
            ${generateMainContent(CONFIG)}
            ${generateScripts(env, CONFIG)}
        </body>
        </html>
    `;

    return new Response(html, {
        headers: { 'Content-Type': 'text/html;charset=utf-8' }
    });
}

// Generate head with Bauhaus-inspired styles
function generateHead() {
    return `
        <title>节点管理系统</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://unpkg.com/tailwindcss@2/dist/tailwind.min.css" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet">
        <style>
            :root {
                --bauhaus-red: #E53935;
                --bauhaus-blue: #1E88E5;
                --bauhaus-yellow: #FDD835;
                --bauhaus-black: #212121;
            }
            
            body {
                font-family: 'Inter', sans-serif;
                color: var(--bauhaus-black);
            }
            
            .bauhaus-grid {
                display: grid;
                grid-template-columns: repeat(12, 1fr);
                gap: 24px;
            }
            
            .bauhaus-red { background-color: var(--bauhaus-red); }
            .bauhaus-blue { background-color: var(--bauhaus-blue); }
            .bauhaus-yellow { background-color: var(--bauhaus-yellow); }
            
            .bauhaus-text-red { color: var(--bauhaus-red); }
            .bauhaus-text-blue { color: var(--bauhaus-blue); }
            .bauhaus-text-yellow { color: var(--bauhaus-yellow); }
            
            .bauhaus-border-red { border-color: var(--bauhaus-red); }
            .bauhaus-border-blue { border-color: var(--bauhaus-blue); }
            .bauhaus-border-yellow { border-color: var(--bauhaus-yellow); }
            
            .bauhaus-btn {
                border: none;
                font-weight: 500;
                text-transform: uppercase;
                letter-spacing: 1px;
                transition: transform 0.2s;
            }
            
            .bauhaus-btn:hover {
                transform: translateY(-2px);
            }
            
            .bauhaus-card {
                border: 2px solid var(--bauhaus-black);
                box-shadow: 8px 8px 0 var(--bauhaus-black);
                transition: all 0.2s;
            }
            
            .bauhaus-card:hover {
                box-shadow: 6px 6px 0 var(--bauhaus-black);
                transform: translate(2px, 2px);
            }
            
            .bauhaus-input {
                border: 2px solid var(--bauhaus-black);
                font-size: 1rem;
                outline: none;
            }
            
            .bauhaus-input:focus {
                border-color: var(--bauhaus-blue);
            }
            
            .bauhaus-circle {
                border-radius: 50%;
                display: inline-block;
            }
            
            .bauhaus-square {
                display: inline-block;
            }
            
            .bauhaus-triangle {
                width: 0;
                height: 0;
                border-left: 8px solid transparent;
                border-right: 8px solid transparent;
                border-bottom: 16px solid currentColor;
                display: inline-block;
            }
        </style>
        <script>
            // Auth functions remain the same
            function saveAuth(username, password) {
                const auth = btoa(username + ':' + password);
                try {
                    localStorage.setItem('auth', auth);
                } catch (e) {
                    console.warn('localStorage not available');
                }
                sessionStorage.setItem('auth', auth);
                return auth;
            }

            function getAuth() {
                return sessionStorage.getItem('auth') || localStorage.getItem('auth');
            }

            function clearAuth() {
                try {
                    localStorage.removeItem('auth');
                } catch (e) {
                    console.warn('localStorage not available');
                }
                sessionStorage.removeItem('auth');
            }

            function showLoginDialog() {
                const dialog = document.createElement('div');
                dialog.className = 'fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50';
                dialog.innerHTML = \`
                    <div class="bg-white p-8 w-full max-w-md bauhaus-card">
                        <h2 class="text-2xl font-bold mb-8 uppercase tracking-wider">管理员登录</h2>
                        <div class="space-y-6">
                            <div>
                                <label class="block text-sm font-medium uppercase mb-2">用户名</label>
                                <input type="text" id="username" 
                                    class="bauhaus-input w-full px-4 py-3">
                            </div>
                            <div>
                                <label class="block text-sm font-medium uppercase mb-2">密码</label>
                                <input type="password" id="password" 
                                    class="bauhaus-input w-full px-4 py-3">
                            </div>
                            <button onclick="login()"
                                class="w-full py-3 mt-4 bauhaus-btn bauhaus-blue text-white">
                                登录
                            </button>
                        </div>
                    </div>
                \`;
                document.body.appendChild(dialog);

                // 添加回车键登录支持
                const inputs = dialog.querySelectorAll('input');
                inputs.forEach(input => {
                    input.addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') {
                            login();
                        }
                    });
                });
            }
        </script>
    `;
}

// Generate header with Bauhaus design
function generateHeader(CONFIG, env) {
    return `
        <header class="border-b-4 border-black py-6 px-8 mb-12">
            <div class="max-w-7xl mx-auto">
                <div class="flex flex-col md:flex-row justify-between items-center">
                    <div class="flex items-center mb-6 md:mb-0">
                        <div class="bauhaus-circle w-12 h-12 mr-4 bauhaus-red"></div>
                        <div>
                            <h1 class="text-4xl font-bold uppercase tracking-wider">节点管理系统</h1>
                            <div class="w-32 h-2 bauhaus-blue mt-2"></div>
                        </div>
                    </div>
                    <div class="flex flex-wrap justify-center gap-4">
                        <button onclick="openUserLogin()"
                            class="px-6 py-3 bauhaus-btn bauhaus-yellow text-black">
                            用户登录
                        </button>
                        <button onclick="openSubscriber()"
                            class="px-6 py-3 bauhaus-btn bauhaus-blue text-white">
                            自选订阅器
                        </button>
                        <button onclick="openQuickSubscriber()"
                            class="px-6 py-3 bauhaus-btn bauhaus-red text-white">
                            快速订阅器
                        </button>
                    </div>
                </div>
            </div>
        </header>
    `;
}

// Generate main content with Bauhaus grid
function generateMainContent(CONFIG) {
    return `
        <main class="max-w-7xl mx-auto px-8 pb-16">
            <div class="bauhaus-grid">
                <div class="col-span-12 md:col-span-6 mb-10">
                    ${generateNodeManager()}
                </div>
                <div class="col-span-12 md:col-span-6 mb-10">
                    ${generateCollectionManager(CONFIG)}
                </div>
            </div>
        </main>
    `;
}

// Generate node manager with Bauhaus style
function generateNodeManager() {
    return `
        <div class="p-8 bauhaus-card bg-white mb-6">
            <h2 class="text-2xl font-bold uppercase mb-8 flex items-center">
                <div class="bauhaus-square w-6 h-6 bauhaus-blue mr-3"></div>
                节点管理
            </h2>
            <div class="space-y-8">
                <div class="flex flex-col gap-4">
                    <div class="flex flex-col md:flex-row gap-4">
                        <input type="text" id="nodeName" placeholder="节点名称"
                            class="bauhaus-input w-full md:w-1/3 px-4 py-3">
                        <input type="text" id="nodeUrl" placeholder="节点URL"
                            class="bauhaus-input w-full md:w-2/3 px-4 py-3">
                    </div>
                    <button onclick="addNode()"
                        class="self-end px-6 py-3 bauhaus-btn bauhaus-red text-white uppercase">
                        添加节点
                    </button>
                </div>
                <div id="nodeList" class="space-y-4"></div>
            </div>
        </div>
    `;
}

// Generate collection manager with Bauhaus style
function generateCollectionManager(CONFIG) {
    return `
        <div class="p-8 bauhaus-card bg-white mb-6">
            <div class="flex justify-between items-center mb-8">
                <h2 class="text-2xl font-bold uppercase flex items-center">
                    <div class="bauhaus-circle w-6 h-6 bauhaus-red mr-3"></div>
                    集合管理
                </h2>
                <a href="${CONFIG.DEFAULT_TEMPLATE_URL}" 
                    target="_blank"
                    class="text-sm underline font-medium">
                    查看默认配置
                </a>
            </div>
            <div class="space-y-6">
                <div class="flex flex-col gap-4">
                    <input type="text" id="collectionName" placeholder="集合名称"
                        class="bauhaus-input w-full px-4 py-3">
                    <button onclick="addCollection()"
                        class="self-end px-6 py-3 bauhaus-btn bauhaus-blue text-white uppercase">
                        创建集合
                    </button>
                </div>
                <div class="space-y-4">
                    <h3 class="text-lg font-bold uppercase">选择节点</h3>
                    <div id="nodeSelection" class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border-2 border-black"></div>
                </div>
                <div id="collectionList" class="space-y-6"></div>
            </div>
        </div>
    `;
}

// Generate scripts with Bauhaus-compatible rendering
function generateScripts(env, CONFIG) {
    return `
        <script>
            // Configuration
            const CONFIG = {
                SUB_WORKER_URL: '${getConfig('SUB_WORKER_URL', env)}',
                TEMPLATE_URL: '${getConfig('DEFAULT_TEMPLATE_URL', env)}',
                SUBSCRIBER_URL: '${getConfig('SUBSCRIBER_URL', env)}',
                QUICK_SUB_URL: '${getConfig('QUICK_SUB_URL', env)}',
                API: ${JSON.stringify(CONFIG.API)}
            };

            // Auth fetch helper
            async function fetchWithAuth(url, options = {}) {
                const response = await fetch(url, options);
                if (response.status === 401) {
                    location.reload();
                    throw new Error('Unauthorized');
                }
                return response;
            }

            // Initialize application
            async function init() {
                try {
                    // Add Font Awesome for icons
                    if (!document.querySelector('link[href*="font-awesome"]')) {
                        const link = document.createElement('link');
                        link.rel = 'stylesheet';
                        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
                        document.head.appendChild(link);
                    }

                    await Promise.all([loadNodes(), loadCollections()]);
                } catch (e) {
                    console.error('Failed to load data:', e);
                }
            }

            // Start initialization
            init();

            ${generateNodeScripts()}
            ${generateCollectionScripts()}
            ${generateUtilityScripts(env, CONFIG)}
        </script>
    `;
}

// Generate node scripts with Bauhaus styling
function generateNodeScripts() {
    return `
        async function loadNodes() {
            try {
                const response = await fetchWithAuth('/api/nodes');
                if (response.ok) {
                    const nodes = await response.json();
                    renderNodes(nodes);
                    updateNodeSelection(nodes);
                }
            } catch (e) {
                console.error('Error loading nodes:', e);
                showToast('加载节点失败', 'bauhaus-red');
            }
        }

        function renderNodes(nodes) {
            const nodeList = document.getElementById('nodeList');
            nodeList.innerHTML = nodes.map(node => \`
                <div class="p-5 border-2 border-black hover:border-blue-500 transition-colors duration-200">
                    <div class="flex justify-between items-center">
                        <div class="flex-1 min-w-0">
                            <h3 class="font-bold uppercase mb-2 flex items-center">
                                <div class="w-3 h-3 bauhaus-blue mr-2"></div>
                                \${node.name}
                            </h3>
                            <div class="text-sm truncate font-mono">
                                \${node.url}
                            </div>
                        </div>
                        <div class="flex items-center space-x-3 ml-4">
                            <button onclick="editNode('\${node.id}')"
                                class="p-1.5 hover:text-blue-500 transition-colors"
                                title="编辑节点">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="copyNode('\${node.id}')"
                                class="p-1.5 hover:text-blue-500 transition-colors"
                                title="复制链接">
                                <i class="fas fa-copy"></i>
                            </button>
                            <button onclick="deleteNode('\${node.id}')"
                                class="p-1.5 hover:text-red-500 transition-colors"
                                title="删除节点">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>
                </div>
            \`).join('');
        }

        async function addNode() {
            const name = document.getElementById('nodeName').value;
            const url = document.getElementById('nodeUrl').value;
            
            if (!name || !url) {
                showToast('请填写完整信息', 'bauhaus-red');
                return;
            }
            
            try {
                const response = await fetchWithAuth('/api/nodes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, url })
                });
                
                if (response.ok) {
                    document.getElementById('nodeName').value = '';
                    document.getElementById('nodeUrl').value = '';
                    await loadNodes();
                    showToast('添加成功', 'bauhaus-blue');
                }
            } catch (e) {
                showToast('添加节点失败', 'bauhaus-red');
            }
        }

        async function editNode(id) {
            try {
                const response = await fetchWithAuth('/api/nodes');
                const nodes = await response.json();
                const node = nodes.find(n => n.id === id);
                
                if (node) {
                    showEditDialog(node);
                }
            } catch (e) {
                showToast('编辑节点失败', 'bauhaus-red');
            }
        }

        function showEditDialog(node) {
            const dialog = document.createElement('div');
            dialog.className = 'fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50';
            dialog.innerHTML = \`
                <div class="bg-white p-8 w-full max-w-lg mx-4 bauhaus-card">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-xl font-bold uppercase">编辑节点</h3>
                        <button onclick="this.closest('.fixed').remove()" 
                            class="text-black hover:text-red-500">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    <div class="space-y-6">
                        <div>
                            <label class="block text-sm font-bold uppercase mb-2">节点名称</label>
                            <input type="text" id="editNodeName" value="\${node.name}"
                                class="bauhaus-input w-full px-4 py-3">
                        </div>
                        <div>
                            <label class="block text-sm font-bold uppercase mb-2">节点URL</label>
                            <input type="text" id="editNodeUrl" value="\${node.url}"
                                class="bauhaus-input w-full px-4 py-3">
                        </div>
                    </div>
                    <div class="flex justify-end space-x-4 mt-8">
                        <button onclick="this.closest('.fixed').remove()"
                            class="px-6 py-3 border-2 border-black hover:bg-black hover:text-white transition-colors">
                            取消
                        </button>
                        <button onclick="updateNode('\${node.id}')"
                            class="px-6 py-3 bauhaus-btn bauhaus-blue text-white">
                            保存
                        </button>
                    </div>
                </div>
            \`;
            document.body.appendChild(dialog);
        }

        async function updateNode(id) {
            const name = document.getElementById('editNodeName').value;
            const url = document.getElementById('editNodeUrl').value;
            
            if (!name || !url) {
                showToast('请填写完整信息', 'bauhaus-red');
                return;
            }
            
            try {
                const response = await fetchWithAuth('/api/nodes', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, name, url })
                });
                
                if (response.ok) {
                    document.querySelector('.fixed').remove();
                    await loadNodes();
                    showToast('更新成功', 'bauhaus-blue');
                }
            } catch (e) {
                showToast('更新节点失败', 'bauhaus-red');
            }
        }

        async function copyNode(id) {
            try {
                const response = await fetchWithAuth('/api/nodes');
                const nodes = await response.json();
                const node = nodes.find(n => n.id === id);
                
                if (node) {
                    await navigator.clipboard.writeText(node.url);
                    showToast('已复制到剪贴板', 'bauhaus-blue');
                }
            } catch (e) {
                showToast('复制失败', 'bauhaus-red');
            }
        }

        async function deleteNode(id) {
            if (!confirm('确定要删除这个节点吗？')) return;
            
            try {
                const response = await fetchWithAuth('/api/nodes', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id })
                });
                
                if (response.ok) {
                    await loadNodes();
                    showToast('删除成功', 'bauhaus-yellow');
                }
            } catch (e) {
                showToast('删除节点失败', 'bauhaus-red');
            }
        }

        // Update node selection area with Bauhaus style
        function updateNodeSelection(nodes) {
            const nodeSelection = document.getElementById('nodeSelection');
            
            // Add selection controls
            const selectionControls = document.createElement('div');
            selectionControls.className = 'col-span-1 md:col-span-2 flex justify-end gap-3 mb-3';
            selectionControls.innerHTML = \`
                <button onclick="selectAllNodes()"
                    class="px-4 py-2 border-2 border-black hover:bg-black hover:text-white transition-colors text-sm uppercase">
                    全选
                </button>
                <button onclick="deselectAllNodes()"
                    class="px-4 py-2 border-2 border-black hover:bg-black hover:text-white transition-colors text-sm uppercase">
                    取消全选
                </button>
            \`;
            
            // Generate nodes checkboxes with Bauhaus style
            nodeSelection.innerHTML = nodes.map(node => \`
                <label class="flex items-center p-3 border-2 border-black hover:border-blue-500 transition-colors cursor-pointer">
                    <input type="checkbox" id="select_\${node.id}" value="\${node.id}"
                        class="mr-3 w-5 h-5 accent-blue-500">
                    <span class="text-sm uppercase font-medium">\${node.name}</span>
                </label>
            \`).join('');
            
            nodeSelection.insertBefore(selectionControls, nodeSelection.firstChild);
        }

        // Select all nodes
        function selectAllNodes() {
            document.querySelectorAll('#nodeSelection input[type="checkbox"]')
                .forEach(checkbox => checkbox.checked = true);
        }

        // Deselect all nodes
        function deselectAllNodes() {
            document.querySelectorAll('#nodeSelection input[type="checkbox"]')
                .forEach(checkbox => checkbox.checked = false);
        }

        // Get selected node IDs
        function getSelectedNodeIds() {
            return Array.from(document.querySelectorAll('#nodeSelection input:checked'))
                .map(checkbox => checkbox.value);
        }

        // Set node selection
        function setNodeSelection(nodeIds) {
            document.querySelectorAll('#nodeSelection input[type="checkbox"]')
                .forEach(checkbox => {
                    checkbox.checked = nodeIds.includes(checkbox.value);
                });
        }
    `;
}

// Generate collection scripts with Bauhaus styling
function generateCollectionScripts() {
    return `
        async function loadCollections() {
            try {
                const response = await fetchWithAuth('/api/collections');
                const collections = await response.json();
                
                const collectionList = document.getElementById('collectionList');
                collectionList.innerHTML = collections.map(collection => \`
                    <div class="p-6 border-2 border-black hover:border-blue-500 transition-colors">
                        <div class="flex flex-col space-y-4">
                            <!-- Collection header -->
                            <div class="flex justify-between items-start">
                                <div class="flex-1">
                                    <div class="flex items-center gap-2">
                                        <h3 class="text-lg font-bold uppercase flex items-center">
                                            <div class="bauhaus-circle w-3 h-3 bauhaus-yellow mr-2"></div>
                                            \${collection.name}
                                        </h3>
                                        <span id="expiry_\${collection.id}" class="text-sm"></span>
                                    </div>
                                </div>
                                <div class="flex space-x-3">
                                    <button onclick="editCollection('\${collection.id}')"
                                        class="p-1.5 hover:text-blue-500 transition-colors"
                                        title="编辑集合">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button onclick="deleteCollection('\${collection.id}')"
                                        class="p-1.5 hover:text-red-500 transition-colors"
                                        title="删除集合">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>

                            <!-- Node list -->
                            <div id="nodeList_\${collection.id}" class="flex flex-wrap gap-2 py-3"></div>

                            <!-- Action buttons -->
                            <div class="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t-2 border-black">
                                <button onclick="shareCollection('\${collection.id}')"
                                    class="py-2 px-3 bauhaus-yellow text-black text-sm uppercase">
                                    分享
                                </button>
                                <button onclick="universalSubscription('\${collection.id}')"
                                    class="py-2 px-3 bauhaus-blue text-white text-sm uppercase">
                                    通用订阅
                                </button>
                                <button onclick="singboxSubscription('\${collection.id}')"
                                    class="py-2 px-3 bauhaus-red text-white text-sm uppercase">
                                    SingBox
                                </button>
                                <button onclick="clashSubscription('\${collection.id}')"
                                    class="py-2 px-3 bg-black text-white text-sm uppercase">
                                    Clash
                                </button>
                            </div>
                        </div>
                    </div>
                \`).join('');

                // Update each collection's nodes and expiry
                collections.forEach(collection => {
                    updateCollectionNodes(collection);
                });
            } catch (e) {
                console.error('Error loading collections:', e);
                showToast('加载集合失败', 'bauhaus-red');
            }
        }

        async function updateCollectionNodes(collection) {
            try {
                const [nodesResponse, tokenResponse] = await Promise.all([
                    fetchWithAuth('/api/nodes'),
                    fetchWithAuth(\`/api/collections/token/\${collection.id}\`)
                ]);
                
                const nodes = await nodesResponse.json();
                const token = await tokenResponse.json();
                const collectionNodes = nodes.filter(node => collection.nodeIds.includes(node.id));
                
                // Update expiry display with Bauhaus styling
                const expiryElement = document.getElementById(\`expiry_\${collection.id}\`);
                if (expiryElement && token.expiry) {
                    const expDate = new Date(token.expiry);
                    const isExpired = expDate < new Date();
                    const isNearExpiry = !isExpired && (expDate - new Date() < 7 * 24 * 60 * 60 * 1000);
                    
                    const dateStr = expDate.toLocaleDateString('zh-CN', {
                        year: 'numeric',
                        month: 'numeric',
                        day: 'numeric'
                    });
                    
                    expiryElement.innerHTML = \`
                        <span>
                            (\${dateStr})
                        </span>
                        \${isExpired ? \`
                            <span class="ml-1 px-2 py-0.5 bauhaus-red text-white text-xs uppercase">
                                已过期
                            </span>
                        \` : isNearExpiry ? \`
                            <span class="ml-1 px-2 py-0.5 bauhaus-yellow text-black text-xs uppercase">
                                即将到期
                            </span>
                        \` : ''}
                    \`;
                }
                
                // Update node list with Bauhaus styling
                const nodeList = document.getElementById(\`nodeList_\${collection.id}\`);
                if (nodeList) {
                    nodeList.innerHTML = collectionNodes.map(node => \`
                        <div class="px-3 py-2 border-2 border-black text-sm uppercase">
                            <div class="w-2 h-2 bauhaus-red inline-block mr-2"></div>
                            \${node.name}
                        </div>
                    \`).join('');
                }
            } catch (e) {
                console.error('Error updating collection nodes:', e);
            }
        }

        async function addCollection() {
            const name = document.getElementById('collectionName').value;
            const nodeIds = Array.from(document.querySelectorAll('#nodeSelection input:checked'))
                .map(checkbox => checkbox.value);
            
            if (!name) {
                showToast('请输入集合名称', 'bauhaus-red');
                return;
            }
            
            if (nodeIds.length === 0) {
                showToast('请选择至少一个节点', 'bauhaus-red');
                return;
            }
            
            try {
                const response = await fetchWithAuth('/api/collections', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, nodeIds })
                });
                
                if (response.ok) {
                    document.getElementById('collectionName').value = '';
                    document.querySelectorAll('#nodeSelection input').forEach(
                        checkbox => checkbox.checked = false
                    );
                    await loadCollections();
                    showToast('创建集合成功', 'bauhaus-blue');
                }
            } catch (e) {
                showToast('创建集合失败', 'bauhaus-red');
            }
        }

        async function editCollection(id) {
            try {
                const [collectionsResponse, nodesResponse] = await Promise.all([
                    fetchWithAuth('/api/collections'),
                    fetchWithAuth('/api/nodes')
                ]);
                
                const collections = await collectionsResponse.json();
                const allNodes = await nodesResponse.json();
                const collection = collections.find(c => c.id === id);
                
                if (collection) {
                    showCollectionEditDialog(collection, allNodes);
                }
            } catch (e) {
                console.error('编辑集合失败:', e);
                showToast('编辑集合失败', 'bauhaus-red');
            }
        }

        async function showCollectionEditDialog(collection, nodes) {
            // Get user token info
            const response = await fetchWithAuth(\`/api/collections/token/\${collection.id}\`);
            let userToken = {};
            if (response.ok) {
                userToken = await response.json();
            }

            // Format date for input
            const formatDateForInput = (dateString) => {
                if (!dateString) return '';
                const date = new Date(dateString);
                return date.toISOString().split('T')[0];
            };

            const dialog = document.createElement('div');
            dialog.className = 'fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50';
            dialog.innerHTML = \`
                <div class="bg-white p-8 w-full max-w-2xl bauhaus-card overflow-y-auto max-h-[90vh]">
                    <h2 class="text-xl font-bold uppercase mb-6 flex items-center">
                        <div class="bauhaus-circle w-4 h-4 bauhaus-red mr-3"></div>
                        编辑集合
                    </h2>
                    <div class="space-y-6">
                        <div>
                            <label class="block text-sm font-bold uppercase mb-2">集合名称</label>
                            <input type="text" id="collectionName" value="\${collection.name}"
                                class="bauhaus-input w-full px-4 py-3">
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-bold uppercase mb-2">访问用户名</label>
                                <input type="text" id="collectionUsername" value="\${userToken.username || ''}"
                                    class="bauhaus-input w-full px-4 py-3">
                                <p class="mt-2 text-sm">留空将自动生成用户名</p>
                                \${userToken.username ? \`
                                    <p class="mt-1 text-sm bauhaus-text-blue font-medium">
                                        当前用户名: \${userToken.username}
                                    </p>
                                \` : ''}
                            </div>
                            <div>
                                <label class="block text-sm font-bold uppercase mb-2">访问密码</label>
                                <input type="text" id="collectionPassword" 
                                    class="bauhaus-input w-full px-4 py-3">
                                <p class="mt-2 text-sm">设置后需要密码才能访问</p>
                                \${userToken.password ? \`
                                    <p class="mt-1 text-sm bauhaus-text-blue font-medium">
                                        当前密码: \${userToken.password}
                                    </p>
                                \` : ''}
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-bold uppercase mb-2">有效期</label>
                            <input type="date" id="collectionExpiry" 
                                value="\${formatDateForInput(userToken.expiry)}"
                                class="bauhaus-input w-full px-4 py-3">
                            <p class="mt-2 text-sm">可选，设置订阅的有效期</p>
                            \${userToken.expiry ? \`
                                <p class="mt-1 text-sm bauhaus-text-blue font-medium">
                                    当前有效期: \${new Date(userToken.expiry).toLocaleDateString()}
                                </p>
                            \` : ''}
                        </div>
                        <div>
                            <label class="block text-sm font-bold uppercase mb-2">选择节点</label>
                            <div class="h-60 overflow-y-auto border-2 border-black p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                                \${nodes.map(node => \`
                                    <label class="flex items-center space-x-2 p-2 border-2 border-black hover:border-blue-500 transition-colors cursor-pointer">
                                        <input type="checkbox" value="\${node.id}" class="w-4 h-4 accent-blue-500"
                                            \${collection.nodeIds?.includes(node.id) ? 'checked' : ''}>
                                        <span class="text-sm uppercase">\${node.name}</span>
                                    </label>
                                \`).join('')}
                            </div>
                        </div>
                    </div>
                    <div class="flex justify-end space-x-4 mt-8">
                        <button onclick="this.closest('.fixed').remove()"
                            class="px-6 py-3 border-2 border-black hover:bg-black hover:text-white transition-colors uppercase">
                            取消
                        </button>
                        <button onclick="updateCollection('\${collection.id}')"
                            class="px-6 py-3 bauhaus-btn bauhaus-blue text-white uppercase">
                            保存
                        </button>
                    </div>
                </div>
            \`;
            document.body.appendChild(dialog);
        }

        async function updateCollection(id) {
            // Get values from dialog
            const dialog = document.querySelector('.fixed');
            if (!dialog) {
                console.error('Dialog not found');
                return;
            }

            const nameInput = dialog.querySelector('#collectionName');
            if (!nameInput) {
                console.error('Name input not found');
                return;
            }

            const name = nameInput.value;
            const username = dialog.querySelector('#collectionUsername').value;
            const password = dialog.querySelector('#collectionPassword').value;
            const expiry = dialog.querySelector('#collectionExpiry').value;
            const nodeIds = Array.from(dialog.querySelectorAll('input[type="checkbox"]:checked'))
                .map(checkbox => checkbox.value);
            
            if (!name) {
                showToast('请输入集合名称', 'bauhaus-red');
                return;
            }
            
            if (nodeIds.length === 0) {
                showToast('请选择至少一个节点', 'bauhaus-red');
                return;
            }
            
            try {
                const response = await fetchWithAuth('/api/collections', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        id, 
                        nodeIds, 
                        username, 
                        password,
                        expiry: expiry || null,
                        name
                    })
                });
                
                if (response.ok) {
                    dialog.remove();
                    await loadCollections();
                    showToast('更新集合成功', 'bauhaus-blue');
                } else {
                    const error = await response.json();
                    throw new Error(error.error || '更新失败');
                }
            } catch (e) {
                console.error('Update failed:', e);
                showToast('更新集合失败: ' + e.message, 'bauhaus-red');
            }
        }

        async function deleteCollection(id) {
            if (!confirm('确定要删除这个集合吗？')) return;
            
            try {
                const response = await fetchWithAuth('/api/collections', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id })
                });
                
                if (response.ok) {
                    await loadCollections();
                    showToast('删除集合成功', 'bauhaus-yellow');
                }
            } catch (e) {
                showToast('删除集合失败', 'bauhaus-red');
            }
        }

        // Subscription-related functions with Bauhaus styling
        async function shareCollection(id) {
            const shareUrl = \`\${window.location.origin}/api/share/\${id}\`;
            try {
                await navigator.clipboard.writeText(shareUrl);
                showToast('分享链接已复制', 'bauhaus-blue');
            } catch (e) {
                showToast('复制分享链接失败', 'bauhaus-red');
            }
        }

        function universalSubscription(id) {
            const shareUrl = \`\${window.location.origin}/api/share/\${id}\`;
            const subUrl = CONFIG.SUB_WORKER_URL ? 
                \`\${CONFIG.SUB_WORKER_URL}/base?url=\${encodeURIComponent(shareUrl)}\` :
                \`\${shareUrl}/base?internal=1\`;
            copyToClipboard(subUrl, '通用订阅链接已复制');
        }

        function singboxSubscription(id) {
            const shareUrl = \`\${window.location.origin}/api/share/\${id}\`;
            const templateParam = window.location.search ? 
                \`&template=\${encodeURIComponent(new URLSearchParams(window.location.search).get('template'))}\` : '';
            const subUrl = CONFIG.SUB_WORKER_URL ? 
                \`\${CONFIG.SUB_WORKER_URL}/singbox?url=\${encodeURIComponent(shareUrl)}\${templateParam}\` :
                \`\${shareUrl}/singbox?internal=1\`;
            copyToClipboard(subUrl, 'SingBox订阅链接已复制');
        }

        function clashSubscription(id) {
            const shareUrl = \`\${window.location.origin}/api/share/\${id}\`;
            const templateParam = window.location.search ? 
                \`&template=\${encodeURIComponent(new URLSearchParams(window.location.search).get('template'))}\` : '';
            const subUrl = CONFIG.SUB_WORKER_URL ? 
                \`\${CONFIG.SUB_WORKER_URL}/clash?url=\${encodeURIComponent(shareUrl)}\${templateParam}\` :
                \`\${shareUrl}/clash?internal=1\`;
            copyToClipboard(subUrl, 'Clash订阅链接已复制');
        }
    `;
}

// Generate utility scripts with Bauhaus-inspired toast
function generateUtilityScripts(env, CONFIG) {
    return `
        function openUserLogin() {
            window.open('${CONFIG.API.USER.PAGE}', '_blank');
        }

        function openSubscriber() {
            if (CONFIG.SUBSCRIBER_URL) {
                window.open(CONFIG.SUBSCRIBER_URL, '_blank');
            } else {
                showToast('订阅器地址未配置', 'bauhaus-red');
            }
        }

        function openQuickSubscriber() {
            if (CONFIG.QUICK_SUB_URL) {
                window.open(CONFIG.QUICK_SUB_URL, '_blank');
            } else {
                showToast('快速订阅器地址未配置', 'bauhaus-red');
            }
        }

        async function copyToClipboard(text, message) {
            try {
                await navigator.clipboard.writeText(text);
                showToast(message, 'bauhaus-blue');
            } catch (e) {
                showToast('复制失败', 'bauhaus-red');
            }
        }

        function showToast(message, colorClass = 'bauhaus-blue') {
            const toast = document.createElement('div');
            toast.className = \`fixed bottom-8 left-1/2 transform -translate-x-1/2 \${colorClass} text-white px-6 py-3 uppercase border-2 border-black font-bold\`;
            toast.textContent = message;
            document.body.appendChild(toast);
            
            // Create and append circle decoration
            const circle = document.createElement('div');
            circle.className = 'absolute -top-3 -right-3 bauhaus-circle w-6 h-6 bg-white border-2 border-black';
            toast.appendChild(circle);
            
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transition = 'opacity 0.5s';
                setTimeout(() => toast.remove(), 500);
            }, 2000);
        }
    `;
}
