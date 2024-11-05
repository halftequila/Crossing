// CFSUB.js

const CONFIG = {
    KV_NAMESPACE: 'NODE_STORE',
    KV_KEY: 'nodes',
    COLLECTIONS_KEY: 'collections',
    ADMIN_USERNAME: 'admin',           
    ADMIN_PASSWORD: '123456',
    SUB_WORKER_URL: 'https://subct.869.xyz' , // 替换成你的域名
    SUBSCRIBER_URL: 'https://youxuan1104.wroy.workers.dev/?key=ttvv00'
};

// 主要处理函数
export default {
    async fetch(request, env, ctx) {
        try {
            return await handleRequest(request, env);
        } catch (err) {
            console.error('Error in request:', err);
            return new Response('Internal Server Error', { status: 500 });
        }
    }
};

// 请求处理函数
async function handleRequest(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // 检查管理页面的访问权限，但排除分享链接
    if (!path.startsWith('/api/share/')) {
        const auth = request.headers.get('Authorization');
        if (!auth || !checkAuth(auth)) {
            return new Response('Unauthorized', {
                status: 401,
                headers: {
                    'WWW-Authenticate': 'Basic realm="Admin Access"',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }
    }

    // API 路由处理
    if (path.startsWith('/api/')) {
        return handleAPI(request, env);
    }

    // 返回管理界面
    return generateManagementPage();
}

// 验证函数
function checkAuth(auth) {
    try {
        const [scheme, encoded] = auth.split(' ');
        if (!encoded || scheme !== 'Basic') {
            return false;
        }
        
        const decoded = atob(encoded);
        const [username, password] = decoded.split(':');
        
        return username === CONFIG.ADMIN_USERNAME && 
               password === CONFIG.ADMIN_PASSWORD;
    } catch (e) {
        return false;
    }
}

// KV 操作函数增加更多日志
async function getKVData(env) {
    console.log('Getting KV data, env:', env);
    if (!env) {
        console.error('env is undefined');
        return [];
    }
    if (!env.NODE_STORE) {
        console.error('NODE_STORE is undefined in env, available keys:', Object.keys(env));
        return [];
    }
    try {
        const data = await env.NODE_STORE.get(CONFIG.KV_KEY);
        console.log('Raw KV data:', data);
        if (!data) {
            console.log('No data in KV, returning empty array');
            return [];
        }
        const parsed = JSON.parse(data);
        console.log('Parsed KV data:', parsed);
        return parsed;
    } catch (e) {
        console.error('Error getting KV data:', e);
        return [];
    }
}

async function setKVData(env, data) {
    console.log('Setting KV data:', data);
    if (!env) {
        throw new Error('env is undefined');
    }
    if (!env.NODE_STORE) {
        throw new Error('NODE_STORE is undefined in env');
    }
    try {
        const jsonData = JSON.stringify(data);
        console.log('Stringified data:', jsonData);
        await env.NODE_STORE.put(CONFIG.KV_KEY, jsonData);
        console.log('KV data set successfully');
    } catch (e) {
        console.error('Error setting KV data:', e);
        throw e;
    }
}

async function getCollections(env) {
    if (!env || !env.NODE_STORE) {
        return [];
    }
    const data = await env.NODE_STORE.get(CONFIG.COLLECTIONS_KEY);
    return data ? JSON.parse(data) : [];
}

async function setCollections(env, collections) {
    if (!env || !env.NODE_STORE) {
        return;
    }
    await env.NODE_STORE.put(CONFIG.COLLECTIONS_KEY, JSON.stringify(collections));
}
// API 处理函数
async function handleAPI(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/api/nodes') {
        return handleNodesAPI(request, env);
    }
    if (path === '/api/collections') {
        return handleCollectionsAPI(request, env);
    }
    if (path.startsWith('/api/share/')) {
        return handleShareAPI(request, env);
    }

    return new Response('Not Found', { status: 404 });
}


// 节点API处理
async function handleNodesAPI(request, env) {
    const method = request.method;
    
    switch (method) {
        case 'GET':
            const nodes = await getKVData(env);
            // 简单返回节点信息，不做额外处理
            return new Response(JSON.stringify(nodes), {
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });

            
            case 'POST':
                try {
                    const data = await request.json();
                    console.log('Received node data:', data);
                    
                    if (!data.name || !data.url) {
                        throw new Error('Missing required fields');
                    }
                    
                    const nodes = await getKVData(env);
                    console.log('Current nodes:', nodes);
                    
                    const newNode = {
                        id: Date.now().toString(),
                        name: data.name,
                        url: data.url,
                        createdAt: new Date().toISOString()
                    };
                    console.log('New node:', newNode);
                    
                    nodes.push(newNode);
                    console.log('Updated nodes array:', nodes);
                    
                    try {
                        await setKVData(env, nodes);
                        console.log('KV write successful');
                    } catch (e) {
                        console.error('KV write error:', e);
                        throw e;
                    }
                    
                    return new Response(JSON.stringify(newNode), {
                        headers: { 'Content-Type': 'application/json' }
                    });
                } catch (e) {
                    console.error('Error in POST:', e);
                    return new Response(JSON.stringify({ error: e.message }), {
                        status: 400,
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
            
                case 'PUT':
                    try {
                        const data = await request.json();
                        if (!data.id || !data.name || !data.url) {
                            throw new Error('Missing required fields');
                        }
                        
                        const nodes = await getKVData(env);
                        const nodeIndex = nodes.findIndex(node => node.id === data.id);
                        
                        if (nodeIndex === -1) {
                            throw new Error('Node not found');
                        }
                        
                        nodes[nodeIndex] = {
                            ...nodes[nodeIndex],
                            name: data.name,
                            url: data.url,
                            updatedAt: new Date().toISOString()
                        };
                        
                        await setKVData(env, nodes);
                        return new Response(JSON.stringify(nodes[nodeIndex]), {
                            headers: { 'Content-Type': 'application/json' }
                        });
                    } catch (e) {
                        return new Response(JSON.stringify({ error: e.message }), {
                            status: 400,
                            headers: { 'Content-Type': 'application/json' }
                        });
                    }
            
        case 'DELETE':
            try {
                const { id } = await request.json();
                const nodes = await getKVData(env);
                const newNodes = nodes.filter(node => node.id !== id);
                await setKVData(env, newNodes);
                return new Response(JSON.stringify({ success: true }));
            } catch (e) {
                return new Response(JSON.stringify({ error: e.message }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            
        case 'OPTIONS':
            return new Response(null, {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                }
            });
            
        default:
            return new Response('Method not allowed', { status: 405 });
    }
}

// 集合API处理
async function handleCollectionsAPI(request, env) {
    const method = request.method;
    
    switch (method) {
        case 'GET':
            const collections = await getCollections(env);
            return new Response(JSON.stringify(collections), {
                headers: { 'Content-Type': 'application/json' }
            });
          
            case 'PUT':
                try {
                    const data = await request.json();
                    if (!data.id || !data.nodeIds) {
                        throw new Error('Missing required fields');
                    }
                    
                    const collections = await getCollections(env);
                    const collectionIndex = collections.findIndex(c => c.id === data.id);
                    
                    if (collectionIndex === -1) {
                        throw new Error('Collection not found');
                    }
                    
                    collections[collectionIndex] = {
                        ...collections[collectionIndex],
                        nodeIds: data.nodeIds,
                        updatedAt: new Date().toISOString()
                    };
                    
                    await setCollections(env, collections);
                    return new Response(JSON.stringify(collections[collectionIndex]), {
                        headers: { 'Content-Type': 'application/json' }
                    });
                } catch (e) {
                    return new Response(JSON.stringify({ error: e.message }), {
                        status: 400,
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
                
        case 'POST':
            try {
                const data = await request.json();
                if (!data.name || !data.nodeIds || !Array.isArray(data.nodeIds)) {
                    throw new Error('Missing required fields');
                }
                
                const collections = await getCollections(env);
                const newCollection = {
                    id: Date.now().toString(),
                    name: data.name,
                    nodeIds: data.nodeIds,
                    createdAt: new Date().toISOString()
                };
                
                collections.push(newCollection);
                await setCollections(env, collections);
                return new Response(JSON.stringify(newCollection));
            } catch (e) {
                return new Response(JSON.stringify({ error: e.message }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            
        case 'DELETE':
            try {
                const { id } = await request.json();
                const collections = await getCollections(env);
                const newCollections = collections.filter(collection => collection.id !== id);
                await setCollections(env, newCollections);
                return new Response(JSON.stringify({ success: true }));
            } catch (e) {
                return new Response(JSON.stringify({ error: e.message }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            
        default:
            return new Response('Method not allowed', { status: 405 });
    }
}

// 分享API处理
async function handleShareAPI(request, env) {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    
    try {
        const collections = await getCollections(env);
        const collection = collections.find(c => c.id === id);
        
        if (!collection) {
            return new Response('Collection not found', { status: 404 });
        }
        
        const nodes = await getKVData(env);
        const collectionNodes = nodes.filter(node => 
            collection.nodeIds.includes(node.id)
        );
        
        const urls = collectionNodes.map(node => node.url).join('\n');
        return new Response(urls, {  // 直接返回原始内容，不进行 Base64 编码
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (e) {
        return new Response('Error processing share request', { status: 500 });
    }
}
// 生成管理页面
function generateManagementPage() {
    return new Response(
        '<!DOCTYPE html>' +
        '<html>' +
        '<head>' +
            '<title>节点管理系统</title>' +
            '<meta charset="UTF-8">' +
            '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
            '<meta name="auth" content="Basic ' + btoa(CONFIG.ADMIN_USERNAME + ':' + CONFIG.ADMIN_PASSWORD) + '">' +
            '<meta name="sub-worker-url" content="' + CONFIG.SUB_WORKER_URL + '">' +
            '<style>' +
            // 基础样式和布局
            'body { margin: 0; padding: 20px 40px; background: #f5f5f5; font-family: Arial, sans-serif; min-height: 100vh; }' +
            '.container { display: flex; gap: 30px; max-width: 1400px; margin: 0 auto; padding: 20px; }' +
            '.section { flex: 1; background: white; padding: 25px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); height: calc(100vh - 120px); overflow-y: auto; }' +
                    
            // 标题样式
            'h2 { margin-top: 0; margin-bottom: 20px; color: #333; }' +
            'h3 { margin: 0 0 10px 0; color: #444; }' +
            
            // 输入组样式
            '.input-group { margin-bottom: 20px; display: flex; gap: 10px; align-items: center; }' +
            'input[type="text"] { padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; }' +
            '#nodeName { width: 150px; }' +
            '#nodeUrl { width: 300px; }' +
            '#collectionName { width: 200px; }' +
            
            // 按钮样式
            '.button { padding: 8px 15px; border: none; border-radius: 6px; cursor: pointer; background: #007bff; color: white; transition: background-color 0.2s; }' +
            '.button:hover { background: #0056b3; }' +
            '.delete-btn { background: #dc3545; }' +
            '.delete-btn:hover { background: #c82333; }' +
            '.edit-btn { background: #28a745; }' +
            '.edit-btn:hover { background: #218838; }' +
            
            // 节点和集合样式
            '.node-item, .collection-item { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px; }' +
            '.node-content { margin: 10px 0; word-break: break-all; }' +
            '.button-group { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }' +  // 添加按钮组样式
            // 节点选择区域
            '.node-selection { ' +
                'margin: 15px 0; ' +
                'padding: 15px; ' +
                'background: #f8f9fa; ' +
                'border-radius: 8px; ' +
                'border: 1px solid #e9ecef; ' +
                'display: grid; ' +  // 使用网格布局
                'grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); ' +  // 自动填充列
                'gap: 10px; ' +  // 网格间距
            '}' +

            // 优化复选框和标签的样式
            '.node-selection div { ' +
                'display: flex; ' +
                'align-items: center; ' +
                'padding: 6px 10px; ' +  // 增加内边距
                'background: white; ' +  // 添加背景色
                'border-radius: 4px; ' +  // 圆角
                'border: 1px solid #dee2e6; ' +  // 边框
            '}' +

            '.node-selection input[type="checkbox"] { ' +
                'margin-right: 8px; ' +  // 复选框和文字的间距
                'cursor: pointer; ' +
            '}' +

            '.node-selection label { ' +
                'cursor: pointer; ' +  // 鼠标指针
                'white-space: nowrap; ' +  // 防止文字换行
                'overflow: hidden; ' +  // 超出隐藏
                'text-overflow: ellipsis; ' +  // 显示省略号
                'flex: 1; ' +  // 占满剩余空间
            '}' +
            '.checkbox-item { margin: 5px 0; }' +

            // 添加节点标签样式
            '.node-tags { display: flex; flex-wrap: wrap; gap: 8px; }' +
            '.node-tag { background: #e9ecef; padding: 4px 8px; border-radius: 4px; font-size: 14px; color: #495057; }' +
            
            
            // 滚动条美化
            '::-webkit-scrollbar { width: 8px; }' +
            '::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; }' +
            '::-webkit-scrollbar-thumb { background: #888; border-radius: 4px; }' +
            '::-webkit-scrollbar-thumb:hover { background: #555; }' +
            
            // 响应式布局
            '@media (max-width: 768px) {' +
                '.container { flex-direction: column; }' +
                '.section { height: auto; min-height: 500px; }' +
                '.input-group { flex-wrap: wrap; }' +
                'input[type="text"] { width: 100% !important; }' +
            '}' +
        '</style>' +
        '</head>' +
        '<body>' +
            '<div class="container">' +
            '<div class="section">' +
            '<h2>节点管理</h2>' +
            '<div class="input-group">' +  // 添加 input-group 类
                '<input type="text" id="nodeName" placeholder="节点名称">' +
                '<input type="text" id="nodeUrl" placeholder="节点URL">' +
                '<button onclick="addNode()" class="button">添加节点</button>' +
                
            '</div>' +
            
            '<div id="nodeList"></div>' +
        '</div>' +
                
                '<div class="section">' +
                '<h2>集合管理</h2>' +
                '<div class="input-group">' +
                    '<input type="text" id="collectionName" placeholder="集合名称">' +
                    '<button onclick="addCollection()" class="button">创建集合</button>' +
                    '<button onclick="openSubscriber()" class="button" style="background-color: #ff6b6b;">外部订阅器</button>' +
                '</div>' +
                '<div id="nodeSelection" class="node-selection"></div>' +
                '<div id="collectionList"></div>' +
            '</div>' +
            '</div>' +
            '<script>' +
                'const SUB_WORKER_URL = document.querySelector(\'meta[name="sub-worker-url"]\').content;' +

                'async function loadNodes() {' +
                'try {' +
                    'const response = await fetch("/api/nodes", {' +
                        'headers: {' +
                            '"Authorization": document.querySelector("meta[name=\\"auth\\"]").content' +
                        '}' +
                    '});' +
                    'const nodes = await response.json();' +
                    
                    'const nodeList = document.getElementById("nodeList");' +
                    'const nodeSelection = document.getElementById("nodeSelection");' +
                    
                    'nodeList.innerHTML = nodes.map(node => `' +
                        '<div class="node-item">' +
                            '<h3>${node.name}</h3>' +
                            '<div class="node-content">${node.content || node.url}</div>' +
                            '<div class="button-group">' +  // 添加按钮组
                                '<button onclick="editNode(\'${node.id}\')" class="button edit-btn">编辑</button>' +
                                '<button onclick="copyNode(\'${node.id}\')" class="button">复制</button>' +
                                '<button onclick="deleteNode(\'${node.id}\')" class="button delete-btn">删除</button>' +
                            '</div>' +
                        '</div>' +
                    '`).join("");' +
                    
                    'nodeSelection.innerHTML = nodes.map(node => `' +
                        '<div>' +
                            '<input type="checkbox" value="${node.id}" id="node_${node.id}">' +
                            '<label for="node_${node.id}">${node.name}</label>' +
                        '</div>' +
                    '`).join("");' +
                '} catch (e) {' +
                    'console.error("Error loading nodes:", e);' +
                    'alert("加载节点失败");' +
                '}' +
            '}' +

            'async function loadCollections() {' +
                'try {' +
                    'const [collectionsResponse, nodesResponse] = await Promise.all([' +
                        'fetch("/api/collections", {' +
                            'headers: {' +
                                '"Authorization": document.querySelector("meta[name=\\"auth\\"]").content' +
                            '}' +
                        '}),' +
                        'fetch("/api/nodes", {' +
                            'headers: {' +
                                '"Authorization": document.querySelector("meta[name=\\"auth\\"]").content' +
                            '}' +
                        '})' +
                    ']);' +
                    
                    'const collections = await collectionsResponse.json();' +
                    'const nodes = await nodesResponse.json();' +
                    
                    'const collectionList = document.getElementById("collectionList");' +
                    'collectionList.innerHTML = collections.map(collection => {' +
                            'const collectionNodes = nodes.filter(node => ' +
                                'collection.nodeIds.includes(node.id)' +
                            ');' +
                            'return `' +
                                '<div class="collection-item">' +
                                    '<h3>${collection.name}</h3>' +
                                    '<div class="node-content">' +
                                        '<div class="node-tags">' +
                                            '${collectionNodes.map(node => ' +
                                                '`<span class="node-tag">${node.name}</span>`' +  // 使用 node-tag 类
                                            ').join("")}' +
                                    '</div>' +
                                '</div>' +
                                '<div class="button-group">' +  // 添加按钮组
                                    '<button onclick="shareCollection(\'${collection.id}\')" class="button">分享</button>' +
                                    '<button onclick="universalSubscription(\'${collection.id}\')" class="button universal-btn">通用订阅</button>' +
                                    '<button onclick="editCollection(\'${collection.id}\')" class="button edit-btn">编辑</button>' +
                                    '<button onclick="copyCollection(\'${collection.id}\')" class="button">复制</button>' +
                                    '<button onclick="deleteCollection(\'${collection.id}\')" class="button delete-btn">删除</button>' +
                                '</div>' +
                            '</div>' +
                        '`;' +
                    '}).join("");' +
                '} catch (e) {' +
                    'console.error("Error loading collections:", e);' +
                    'alert("加载集合失败");' +
                '}' +
            '}' +
            'async function addNode() {' +
                'const name = document.getElementById("nodeName").value;' +
                'const url = document.getElementById("nodeUrl").value;' +
                
                'if (!name || !url) {' +
                    'alert("请填写完整信息");' +
                    'return;' +
                '}' +
                
                'try {' +
                    'const response = await fetch("/api/nodes", {' +
                        'method: "POST",' +
                        'headers: { ' +
                            '"Content-Type": "application/json",' +
                            '"Authorization": document.querySelector("meta[name=\\"auth\\"]").content' +
                        '},' +
                        'body: JSON.stringify({ name, url })' +
                    '});' +
                    
                    'if (response.ok) {' +
                        'document.getElementById("nodeName").value = "";' +
                        'document.getElementById("nodeUrl").value = "";' +
                        'await loadNodes();' +
                        'await loadCollections();' +
                    '}' +
                '} catch (e) {' +
                    'alert("添加节点失败");' +
                '}' +
            '}' +

        'async function addCollection() {' +
            'const name = document.getElementById("collectionName").value;' +
            'const nodeIds = Array.from(document.querySelectorAll("#nodeSelection input:checked"))' +
                '.map(checkbox => checkbox.value);' +
            
            'if (!name) {' +
                'alert("请输入集合名称");' +
                'return;' +
            '}' +
            
            'if (nodeIds.length === 0) {' +
                'alert("请选择至少一个节点");' +
                'return;' +
            '}' +

            'try {' +
                'const response = await fetch("/api/collections", {' +
                    'method: "POST",' +
                    'headers: { ' +
                        '"Content-Type": "application/json",' +
                        '"Authorization": document.querySelector("meta[name=\\"auth\\"]").content' +
                    '},' +
                    'body: JSON.stringify({ name, nodeIds })' +
                '});' +
                
                'if (response.ok) {' +
                    'document.getElementById("collectionName").value = "";' +
                    'document.querySelectorAll("#nodeSelection input").forEach(' +
                        'checkbox => checkbox.checked = false' +
                    ');' +
                    'await loadCollections();' +
                '}' +
            '} catch (e) {' +
                'alert("创建集合失败");' +
            '}' +
        '}' +

        'async function shareCollection(id) {' +
            'const shareUrl = window.location.origin + "/api/share/" + id;' +
            'try {' +
                'await navigator.clipboard.writeText(shareUrl);' +
                'alert("分享链接已复制到剪贴板");' +
            '} catch (e) {' +
                'alert("复制分享链接失败");' +
            '}' +
        '}' +

        'async function universalSubscription(id) {' +
            'const shareUrl = window.location.origin + "/api/share/" + id;' +
            'const subUrl = SUB_WORKER_URL + "?url=" + encodeURIComponent(shareUrl);' +
            'try {' +
                'await navigator.clipboard.writeText(subUrl);' +
                'alert("通用订阅链接已复制到剪贴板");' +
            '} catch (e) {' +
                'alert("复制通用订阅链接失败");' +
            '}' +
        '}' +

        'async function editNode(id) {' +
            'try {' +
                'const response = await fetch("/api/nodes", {' +
                    'headers: {' +
                        '"Authorization": document.querySelector("meta[name=\\"auth\\"]").content' +
                    '}' +
                '});' +
                'const nodes = await response.json();' +
                'const node = nodes.find(n => n.id === id);' +
                'if (node) {' +
                    'const newUrl = prompt("请输入新的节点URL:", node.url);' +
                    'if (newUrl && newUrl !== node.url) {' +  // 只有当URL确实改变时才更新
                        'const updateResponse = await fetch("/api/nodes", {' +
                            'method: "PUT",' +
                            'headers: { ' +
                                '"Content-Type": "application/json",' +
                                '"Authorization": document.querySelector("meta[name=\\"auth\\"]").content' +
                            '},' +
                            'body: JSON.stringify({ ' +
                                'id: id,' +
                                'name: node.name,' +  // 保持原有名称
                                'url: newUrl' +
                            '})' +
                        '});' +
                        'if (updateResponse.ok) {' +
                            'await loadNodes();' +
                            'await loadCollections();' +
                            'alert("更新成功");' +
                        '}' +
                    '}' +
                '}' +
            '} catch (e) {' +
                'alert("编辑节点失败");' +
            '}' +
        '}' +

        'async function copyCollection(id) {' +
        'try {' +
            'const [collectionsResponse, nodesResponse] = await Promise.all([' +
                'fetch("/api/collections", {' +
                    'headers: {' +
                        '"Authorization": document.querySelector("meta[name=\\"auth\\"]").content' +
                    '}' +
                '}),' +
                'fetch("/api/nodes", {' +
                    'headers: {' +
                        '"Authorization": document.querySelector("meta[name=\\"auth\\"]").content' +
                    '}' +
                '})' +
            ']);' +
            
            'const collections = await collectionsResponse.json();' +
            'const nodes = await nodesResponse.json();' +
            
            'const collection = collections.find(c => c.id === id);' +
            'if (collection) {' +
                'const collectionNodes = nodes.filter(node => ' +
                    'collection.nodeIds.includes(node.id)' +
                ');' +
                'const urls = collectionNodes.map(node => node.url).join("\\n");' +
                'await navigator.clipboard.writeText(urls);' +
                'alert("已复制到剪贴板");' +
            '}' +
        '} catch (e) {' +
            'alert("复制失败");' +
        '}' +
    '}' +

        'async function deleteCollection(id) {' +
            'if (!confirm("确定要删除这个集合吗？")) return;' +
            
            'try {' +
                'const response = await fetch("/api/collections", {' +
                    'method: "DELETE",' +
                    'headers: { ' +
                        '"Content-Type": "application/json",' +
                        '"Authorization": document.querySelector("meta[name=\\"auth\\"]").content' +
                    '},' +
                    'body: JSON.stringify({ id })' +
                '});' +
                'if (response.ok) {' +
                    'await loadCollections();' +
                '}' +
            '} catch (e) {' +
                'alert("删除集合失败");' +
            '}' +
        '}' +

        'async function deleteNode(id) {' +
            'if (!confirm("确定要删除这个节点吗？")) return;' +
            
            'try {' +
                'const response = await fetch("/api/nodes", {' +
                    'method: "DELETE",' +
                    'headers: { ' +
                        '"Content-Type": "application/json",' +
                        '"Authorization": document.querySelector("meta[name=\\"auth\\"]").content' +
                    '},' +
                    'body: JSON.stringify({ id })' +
                '});' +
                'if (response.ok) {' +
                    'await loadNodes();' +
                    'await loadCollections();' +
                '}' +
            '} catch (e) {' +
                'alert("删除节点失败");' +
            '}' +
        '}' +

        'async function copyNode(id) {' +
            'try {' +
                'const response = await fetch("/api/nodes", {' +
                    'headers: {' +
                        '"Authorization": document.querySelector("meta[name=\\"auth\\"]").content' +
                    '}' +
                '});' +
                'const nodes = await response.json();' +
                'const node = nodes.find(n => n.id === id);' +
                'if (node) {' +
                    'await navigator.clipboard.writeText(node.url);' +
                    'alert("已复制到剪贴板");' +
                '}' +
            '} catch (e) {' +
                'alert("复制失败");' +
            '}' +
        '}' +
        'async function editCollection(id) {' +
        'try {' +
            'const [collectionsResponse, nodesResponse] = await Promise.all([' +
                'fetch("/api/collections", {' +
                    'headers: {' +
                        '"Authorization": document.querySelector("meta[name=\\"auth\\"]").content' +
                    '}'  +
                '}),' +
                'fetch("/api/nodes", {' +
                    'headers: {' +
                        '"Authorization": document.querySelector("meta[name=\\"auth\\"]").content' +
                    '}'  +
                '})' +
            ']);' +
            
            'const collections = await collectionsResponse.json();' +
            'const nodes = await nodesResponse.json();' +
            'const collection = collections.find(c => c.id === id);' +
            
            'if (collection) {' +
                // 创建一个临时的选择框
                'let checkboxHtml = nodes.map(node => `' +
                    '<div>' +
                        '<input type="checkbox" id="edit_${node.id}" value="${node.id}" ' +
                        '${collection.nodeIds.includes(node.id) ? "checked" : ""}>' +
                        '<label for="edit_${node.id}">${node.name}</label>' +
                    '</div>' +
                '`).join("");' +
                
                'const dialogHtml = `' +
                    '<div style="background: white; padding: 20px; border-radius: 5px; max-width: 500px;">' +
                        '<h3>编辑集合: ${collection.name}</h3>' +
                        '<div style="max-height: 300px; overflow-y: auto;">' +
                            '${checkboxHtml}' +
                        '</div>' +
                        '<div style="margin-top: 10px;">' +
                            '<button onclick="updateCollection(\'${id}\')">保存</button>' +
                            '<button onclick="closeDialog()">取消</button>' +
                        '</div>' +
                    '</div>' +
                '`;' +
                
                // 创建并显示对话框
                'const dialog = document.createElement("div");' +
                'dialog.id = "editDialog";' +
                'dialog.style.cssText = "position: fixed; top: 0; left: 0; right: 0; bottom: 0; ' +
                    'background: rgba(0,0,0,0.5); display: flex; align-items: center; ' +
                    'justify-content: center; z-index: 1000;";' +
                'dialog.innerHTML = dialogHtml;' +
                'document.body.appendChild(dialog);' +
                    '}' +
                '} catch (e) {' +
                    'alert("编辑集合失败");' +
                '}' +
            '}' +

            'async function updateCollection(id) {' +
                'try {' +
                    'const nodeIds = Array.from(document.querySelectorAll("#editDialog input:checked"))' +
                        '.map(checkbox => checkbox.value);' +
                    
                    'if (nodeIds.length === 0) {' +
                        'alert("请至少选择一个节点");' +
                        'return;' +
                    '}' +
                    
                    'const response = await fetch("/api/collections", {' +
                        'method: "PUT",' +
                        'headers: { ' +
                            '"Content-Type": "application/json",' +
                            '"Authorization": document.querySelector("meta[name=\\"auth\\"]").content' +
                        '},' +
                        'body: JSON.stringify({ id, nodeIds })' +
                    '});' +
                    
                    'if (response.ok) {' +
                        'closeDialog();' +
                        'await loadCollections();' +
                        'alert("更新成功");' +
                    '}' +
                '} catch (e) {' +
                    'alert("更新集合失败");' +
                '}' +
            '}' +

            'function closeDialog() {' +
                'const dialog = document.getElementById("editDialog");' +
                'if (dialog) {' +
                    'dialog.remove();' +
                '}' +
            '}' +

            'function openSubscriber() {' +
            'const subscriberUrl = "' + CONFIG.SUBSCRIBER_URL + '";' +  // 直接从CONFIG注入URL
            'if (subscriberUrl) {' +
                'window.open(subscriberUrl, "_blank");' +  // 使用双引号
            '} else {' +
                'alert("无法获取订阅器链接");' +  // 使用双引号
            '}' +
        '} ' +

                // 页面加载时初始化
                'loadNodes();' +
                'loadCollections();' +
'</script>' +
'</body>' +
'</html>',
{
headers: { 'Content-Type': 'text/html;charset=utf-8' }
}
);
}
