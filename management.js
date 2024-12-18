// 管理页面生成
export function generateManagementPage(env, CONFIG) {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            ${generateHead()}
        </head>
        <body class="bg-gray-100 min-h-screen">
            ${generateHeader(CONFIG)}
            ${generateMainContent(CONFIG)}
            ${generateScripts(env, CONFIG)}
        </body>
        </html>
    `;

    return new Response(html, {
        headers: { 'Content-Type': 'text/html;charset=utf-8' }
    });
}

// 生成头部
function generateHead() {
    return `
        <title>节点管理系统</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://unpkg.com/tailwindcss@2/dist/tailwind.min.css" rel="stylesheet">
        <script>
            // 保存认证信息
            function saveAuth(username, password) {
                const auth = btoa(username + ':' + password);
                localStorage.setItem('auth', auth);
                return auth;
            }

            // 获取认证信息
            function getAuth() {
                return localStorage.getItem('auth');
            }

            // 清除认证信息
            function clearAuth() {
                localStorage.removeItem('auth');
            }
        </script>
    `;
}

// 生成页面头部
function generateHeader(CONFIG) {
    return `
        <header class="bg-white shadow">
            <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center">
                    <h1 class="text-3xl font-bold text-gray-900">节点管理系统</h1>
                    <div class="space-x-4">
                        <button onclick="openUserLogin()"
                            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                            </svg>
                            ���户登录
                        </button>
                        <button onclick="openSubscriber()"
                            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            自选订阅器
                        </button>
                        <button onclick="openQuickSubscriber()"
                            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                            快速订阅器
                        </button>
                    </div>
                </div>
            </div>
        </header>
    `;
}

// 生成主要内容
function generateMainContent(CONFIG) {
    return `
        <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div class="px-4 sm:px-0">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    ${generateNodeManager()}
                    ${generateCollectionManager(CONFIG)}
                </div>
            </div>
        </main>
    `;
}

// 生成节点管理部分
function generateNodeManager() {
    return `
        <div class="bg-white rounded-lg shadow-lg p-6">
            <h2 class="text-2xl font-bold mb-6 text-gray-800">节点管理</h2>
            <div class="space-y-4">
                <div class="flex flex-col md:flex-row gap-4">
                    <div class="flex-1 flex flex-col md:flex-row gap-4">
                        <input type="text" id="nodeName" placeholder="节点名称"
                            class="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <input type="text" id="nodeUrl" placeholder="节点URL"
                            class="w-full md:w-2/3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <button onclick="addNode()"
                        class="whitespace-nowrap px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200">
                        添加节点
                    </button>
                </div>
                <div id="nodeList" class="space-y-4"></div>
            </div>
        </div>
    `;
}

// 生成集合管理部分
function generateCollectionManager(CONFIG) {
    return `
        <div class="bg-white rounded-lg shadow-lg p-6">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-800">集合管理</h2>
                <a href="${CONFIG.DEFAULT_TEMPLATE_URL}" 
                    target="_blank"
                    class="text-sm text-gray-500 hover:text-gray-700 flex items-center">
                    <span>查看默认订阅配置</span>
                    <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                    </svg>
                </a>
            </div>
            <div class="space-y-4">
                <div class="flex flex-col md:flex-row gap-4">
                    <input type="text" id="collectionName" placeholder="集合名称"
                        class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <button onclick="addCollection()"
                        class="whitespace-nowrap px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200">
                        创建集合
                    </button>
                </div>
                <div class="space-y-2">
                    <h3 class="text-lg font-semibold text-gray-700">选择节点</h3>
                    <div id="nodeSelection" class="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg"></div>
                </div>
                <div id="collectionList" class="space-y-4"></div>
            </div>
        </div>
    `;
}

// 生成脚本部分
function generateScripts(env, CONFIG) {
    return `
        <script>
            // 配置常量
            const CONFIG = {
                SUB_WORKER_URL: '${env.SUB_WORKER_URL || CONFIG.SUB_WORKER_URL}',
                TEMPLATE_URL: '${env.DEFAULT_TEMPLATE_URL || CONFIG.DEFAULT_TEMPLATE_URL}',
                SUBSCRIBER_URL: '${env.SUBSCRIBER_URL || CONFIG.SUBSCRIBER_URL}',
                QUICK_SUB_URL: '${env.QUICK_SUB_URL || CONFIG.QUICK_SUB_URL}',
                AUTH: getAuth()  // 从localStorage获取认证信息
            };

            // 简化认证检查，只在初始化时检查一次
            async function checkAuth() {
                if (!CONFIG.AUTH) {
                    showLoginDialog();
                    return false;
                }
                try {
                    const response = await fetch('/api/nodes', {
                        headers: { 'Authorization': 'Basic ' + CONFIG.AUTH }
                    });
                    if (response.status === 401) {
                        clearAuth();
                        showLoginDialog();
                        return false;
                    }
                    return true;
                } catch (e) {
                    console.error('Auth check failed:', e);
                    return false;
                }
            }

            // 修改 fetchWithAuth，不再每次检查认证
            async function fetchWithAuth(url, options = {}) {
                return fetch(url, {
                    ...options,
                    headers: {
                        ...options.headers,
                        'Authorization': 'Basic ' + CONFIG.AUTH
                    }
                });
            }

            // 初始化时检查认证
            async function init() {
                if (await checkAuth()) {
                    loadNodes();
                    loadCollections();
                }
            }

            // 登录成功后直接使用保存的认证信息
            async function login() {
                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;
                
                if (!username || !password) {
                    alert('请输入用户名和密码');
                    return;
                }

                const auth = saveAuth(username, password);
                CONFIG.AUTH = auth;

                try {
                    const response = await fetch('/api/nodes', {
                        headers: { 'Authorization': 'Basic ' + auth }
                    });
                    
                    if (response.ok) {
                        document.querySelector('.fixed').remove();
                        await Promise.all([loadNodes(), loadCollections()]);
                    } else {
                        clearAuth();
                        alert('用户名或密码错误');
                    }
                } catch (e) {
                    clearAuth();
                    alert('登录失败');
                }
            }

            // 启动初始化
            init();

            ${generateNodeScripts()}
            ${generateCollectionScripts()}
            ${generateUtilityScripts()}

            // 打开订阅器
            function openSubscriber() {
                const subscriberUrl = '${env.SUBSCRIBER_URL || CONFIG.SUBSCRIBER_URL}';
                if (subscriberUrl) {
                    window.open(subscriberUrl, '_blank');
                } else {
                    showToast('订阅器地址未配置');
                }
            }

            // 打开快速订阅器
            function openQuickSubscriber() {
                const quickSubUrl = '${env.QUICK_SUB_URL || CONFIG.QUICK_SUB_URL}';
                if (quickSubUrl) {
                    window.open(quickSubUrl, '_blank');
                } else {
                    showToast('快速订阅器地址未配置');
                }
            }
        </script>
    `;
}

// 生成节点相关脚本
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
                alert('加载节点失败');
            }
        }

        function renderNodes(nodes) {
            const nodeList = document.getElementById('nodeList');
            nodeList.innerHTML = nodes.map(node => \`
                <div class="bg-gray-50 rounded-lg p-4 space-y-2">
                    <h3 class="font-semibold text-gray-800">\${node.name}</h3>
                    <div class="text-sm text-gray-600 truncate">\${node.url}</div>
                    <div class="flex flex-wrap gap-2">
                        <button onclick="editNode('\${node.id}')"
                            class="px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition duration-200">
                            编辑
                        </button>
                        <button onclick="copyNode('\${node.id}')"
                            class="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200">
                            复制
                        </button>
                        <button onclick="deleteNode('\${node.id}')"
                            class="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition duration-200">
                            删除
                        </button>
                    </div>
                </div>
            \`).join('');
        }

        async function addNode() {
            const name = document.getElementById('nodeName').value;
            const url = document.getElementById('nodeUrl').value;
            
            if (!name || !url) {
                alert('请填写完整信息');
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
                }
            } catch (e) {
                alert('添加节点失败');
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
                alert('编辑节点失败');
            }
        }

        function showEditDialog(node) {
            const dialog = document.createElement('div');
            dialog.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
            dialog.innerHTML = \`
                <div class="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full mx-4">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-semibold text-gray-800">编辑节点</h3>
                        <button onclick="this.closest('.fixed').remove()" 
                            class="text-gray-400 hover:text-gray-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">节点名称</label>
                            <input type="text" id="editNodeName" value="\${node.name}"
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">节点URL</label>
                            <input type="text" id="editNodeUrl" value="\${node.url}"
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                    </div>
                    <div class="flex justify-end space-x-3 mt-6">
                        <button onclick="this.closest('.fixed').remove()"
                            class="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200">
                            取消
                        </button>
                        <button onclick="updateNode('\${node.id}')"
                            class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200">
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
                alert('请填写完整信息');
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
                }
            } catch (e) {
                alert('更新节点失败');
            }
        }

        async function copyNode(id) {
            try {
                const response = await fetchWithAuth('/api/nodes');
                const nodes = await response.json();
                const node = nodes.find(n => n.id === id);
                
                if (node) {
                    await navigator.clipboard.writeText(node.url);
                    showToast('已复制到剪贴板');
                }
            } catch (e) {
                alert('复制失败');
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
                }
            } catch (e) {
                alert('删除节点失败');
            }
        }

        // 更新节点选择区域
        function updateNodeSelection(nodes) {
            const nodeSelection = document.getElementById('nodeSelection');
            nodeSelection.innerHTML = nodes.map(node => \`
                <div class="flex items-center space-x-3 p-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200">
                    <input type="checkbox" id="select_\${node.id}" value="\${node.id}"
                        class="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500">
                    <label for="select_\${node.id}" class="flex-1 text-sm text-gray-700 cursor-pointer">
                        \${node.name}
                    </label>
                </div>
            \`).join('');

            // 添加全选/取消全选按钮
            const selectionControls = document.createElement('div');
            selectionControls.className = 'col-span-2 md:col-span-3 flex justify-end gap-2';
            selectionControls.innerHTML = \`
                <button onclick="selectAllNodes()"
                    class="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors duration-200">
                    全选
                </button>
                <button onclick="deselectAllNodes()"
                    class="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors duration-200">
                    取消全选
                </button>
            \`;
            nodeSelection.insertBefore(selectionControls, nodeSelection.firstChild);
        }

        // 全选节点
        function selectAllNodes() {
            document.querySelectorAll('#nodeSelection input[type="checkbox"]')
                .forEach(checkbox => checkbox.checked = true);
        }

        // 取消全选节点
        function deselectAllNodes() {
            document.querySelectorAll('#nodeSelection input[type="checkbox"]')
                .forEach(checkbox => checkbox.checked = false);
        }

        // 获取选中的节点ID列表
        function getSelectedNodeIds() {
            return Array.from(document.querySelectorAll('#nodeSelection input:checked'))
                .map(checkbox => checkbox.value);
        }

        // 设置节点选中状态
        function setNodeSelection(nodeIds) {
            document.querySelectorAll('#nodeSelection input[type="checkbox"]')
                .forEach(checkbox => {
                    checkbox.checked = nodeIds.includes(checkbox.value);
                });
        }
    `;
}

// 生成集合相关脚本
function generateCollectionScripts() {
    return `
        async function loadCollections() {
            try {
                const response = await fetchWithAuth('/api/collections');
                const collections = await response.json();
                renderCollections(collections);
            } catch (e) {
                console.error('Error loading collections:', e);
                alert('加载集合失败');
            }
        }

        function renderCollections(collections) {
            const collectionList = document.getElementById('collectionList');
            collectionList.innerHTML = collections.map(collection => \`
                <div class="bg-white rounded-lg shadow-md p-4 space-y-3 hover:shadow-lg transition-shadow duration-200">
                    <div class="flex justify-between items-center">
                        <h3 class="text-lg font-semibold text-gray-800">\${collection.name}</h3>
                        <div class="flex space-x-2">
                            <button onclick="editCollection('\${collection.id}')"
                                class="p-1 text-green-600 hover:text-green-700 transition-colors duration-200">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                </svg>
                            </button>
                            <button onclick="deleteCollection('\${collection.id}')"
                                class="p-1 text-red-600 hover:text-red-700 transition-colors duration-200">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div id="nodeList_\${collection.id}" class="flex flex-wrap gap-2">
                        <!-- 节点标签将通过 updateCollectionNodes 函数更新 -->
                    </div>
                    <div class="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                        <button onclick="shareCollection('\${collection.id}')"
                            class="inline-flex items-center px-3 py-1.5 bg-indigo-500 text-white text-sm rounded-md hover:bg-indigo-600 transition-colors duration-200">
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
                            </svg>分享
                        </button>
                        <button onclick="universalSubscription('\${collection.id}')"
                            class="inline-flex items-center px-3 py-1.5 bg-purple-500 text-white text-sm rounded-md hover:bg-purple-600 transition-colors duration-200">
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                            </svg>通用订阅
                        </button>
                        <button onclick="singboxSubscription('\${collection.id}')"
                            class="inline-flex items-center px-3 py-1.5 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors duration-200">
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                            </svg>SingBox订阅
                        </button>
                        <button onclick="clashSubscription('\${collection.id}')"
                            class="inline-flex items-center px-3 py-1.5 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors duration-200">
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                            </svg>Clash订阅
                        </button>
                    </div>
                </div>
            \`).join('');

            // 更新每个集合的节点列表
            collections.forEach(collection => {
                updateCollectionNodes(collection);
            });
        }

        async function updateCollectionNodes(collection) {
            try {
                const response = await fetchWithAuth('/api/nodes');
                const nodes = await response.json();
                const collectionNodes = nodes.filter(node => collection.nodeIds.includes(node.id));
                
                const nodeList = document.getElementById(\`nodeList_\${collection.id}\`);
                if (nodeList) {
                    nodeList.innerHTML = collectionNodes.map(node => \`
                        <span class="px-2 py-1 bg-blue-50 text-blue-600 text-sm rounded-full">
                            \${node.name}
                        </span>
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
                alert('请输入集合名称');
                return;
            }
            
            if (nodeIds.length === 0) {
                alert('请选择至少一个节点');
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
                }
            } catch (e) {
                alert('创建集合失败');
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
                alert('编辑集合失败');
            }
        }

        async function showCollectionEditDialog(collection, nodes) {
            // 获取当前用户令牌信息
            const response = await fetchWithAuth(\`/api/collections/token/\${collection.id}\`);
            let userToken = {};
            if (response.ok) {
                userToken = await response.json();
            }

            const dialog = document.createElement('div');
            dialog.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center';
            dialog.innerHTML = \`
                <div class="bg-white rounded-lg p-6 w-full max-w-2xl space-y-4">
                    <h2 class="text-xl font-bold text-gray-900">编辑集合</h2>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">集合名称</label>
                        <input type="text" id="collectionName" value="\${collection.name}"
                            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
                    </div>
                    <div class="space-y-4">
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700">访问用户名</label>
                                <input type="text" id="collectionUsername" value="\${userToken.username || ''}"
                                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
                                <p class="mt-1 text-sm text-gray-500">留空将自动生成用户名</p>
                                \${userToken.username ? \`
                                    <p class="mt-1 text-sm text-blue-600">当前用户名: \${userToken.username}</p>
                                \` : ''}
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">访问密码</label>
                                <input type="text" id="collectionPassword" value=""
                                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
                                <p class="mt-1 text-sm text-gray-500">设置后需要密码才能访问此集合</p>
                                \${userToken.password ? \`
                                    <p class="mt-1 text-sm text-blue-600">当前密码: \${userToken.password}</p>
                                \` : ''}
                            </div>
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">选择节点</label>
                        <div class="max-h-60 overflow-y-auto bg-gray-50 p-4 rounded-md space-y-2">
                            \${nodes.map(node => \`
                                <label class="flex items-center space-x-2">
                                    <input type="checkbox" value="\${node.id}" 
                                        \${collection.nodeIds?.includes(node.id) ? 'checked' : ''}>
                                    <span>\${node.name}</span>
                                </label>
                            \`).join('')}
                        </div>
                    </div>
                    <div class="flex justify-end space-x-3 mt-6">
                        <button onclick="this.closest('.fixed').remove()"
                            class="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200">
                            取消
                        </button>
                        <button onclick="updateCollection('\${collection.id}')"
                            class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200">
                            保存
                        </button>
                    </div>
                </div>
            \`;
            document.body.appendChild(dialog);
        }

        async function updateCollection(id) {
            const username = document.getElementById('collectionUsername').value;
            const password = document.getElementById('collectionPassword').value;
            const nodeIds = Array.from(document.querySelectorAll('.fixed input:checked'))
                .map(checkbox => checkbox.value);
            
            try {
                const response = await fetchWithAuth('/api/collections', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, nodeIds, username, password })
                });
                
                if (response.ok) {
                    document.querySelector('.fixed').remove();
                    await loadCollections();
                }
            } catch (e) {
                alert('更新集合失败');
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
                }
            } catch (e) {
                alert('删除集合失败');
            }
        }

        // 订阅相关函数
        async function shareCollection(id) {
            const shareUrl = \`\${window.location.origin}/api/share/\${id}\`;
            try {
                await navigator.clipboard.writeText(shareUrl);
                showToast('分享链接已复制到剪贴板');
            } catch (e) {
                alert('复制分享链接失败');
            }
        }

        function universalSubscription(id) {
            const shareUrl = \`\${window.location.origin}/api/share/\${id}\`;
            const subUrl = CONFIG.SUB_WORKER_URL ? 
                \`\${CONFIG.SUB_WORKER_URL}/base?url=\${encodeURIComponent(shareUrl)}\` :
                \`\${shareUrl}/base?internal=1\`;
            copyToClipboard(subUrl, '通用订阅链接已复制到剪贴板');
        }

        function singboxSubscription(id) {
            const shareUrl = \`\${window.location.origin}/api/share/\${id}\`;
            const templateParam = window.location.search ? 
                \`&template=\${encodeURIComponent(new URLSearchParams(window.location.search).get('template'))}\` : '';
            const subUrl = CONFIG.SUB_WORKER_URL ? 
                \`\${CONFIG.SUB_WORKER_URL}/singbox?url=\${encodeURIComponent(shareUrl)}\${templateParam}\` :
                \`\${shareUrl}/singbox?internal=1\`;
            copyToClipboard(subUrl, 'SingBox订阅链接已复制到剪贴板');
        }

        function clashSubscription(id) {
            const shareUrl = \`\${window.location.origin}/api/share/\${id}\`;
            const templateParam = window.location.search ? 
                \`&template=\${encodeURIComponent(new URLSearchParams(window.location.search).get('template'))}\` : '';
            const subUrl = CONFIG.SUB_WORKER_URL ? 
                \`\${CONFIG.SUB_WORKER_URL}/clash?url=\${encodeURIComponent(shareUrl)}\${templateParam}\` :
                \`\${shareUrl}/clash?internal=1\`;
            copyToClipboard(subUrl, 'Clash订阅链接已复制到剪贴板');
        }
    `;
}

// 生成工具函数脚本
function generateUtilityScripts() {
    return `
        function openUserLogin() {
            window.open('/user', '_blank');
        }

        function openSubscriber() {
            window.open(CONFIG.SUBSCRIBER_URL, '_blank');
        }

        function openQuickSubscriber() {
            window.open(CONFIG.QUICK_SUB_URL, '_blank');
        }

        async function copyToClipboard(text, message) {
            try {
                await navigator.clipboard.writeText(text);
                showToast(message);
            } catch (e) {
                alert('复制失败');
            }
        }

        function showToast(message) {
            const toast = document.createElement('div');
            toast.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg';
            toast.textContent = message;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 2000);
        }
    `;
} 