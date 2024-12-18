import { CONFIG } from './config.js';

export function generateUserPage(env, collectionId) {
    // 如果没有collectionId，显示登录页面
    if (!collectionId) {
        return generateLoginPage(env);
    }

    // 显示集合订阅页面
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>订阅管理</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://unpkg.com/tailwindcss@2/dist/tailwind.min.css" rel="stylesheet">
        </head>
        <body class="bg-gray-100 min-h-screen">
            <header class="bg-white shadow">
                <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <h1 class="text-3xl font-bold text-gray-900">我的订阅</h1>
                </div>
            </header>

            <main class="container mx-auto px-4 py-8">
                <div id="collectionList" class="space-y-4">
                    <!-- 集合信息将通过 JavaScript 动态加载 -->
                </div>
            </main>

            ${generateScripts(env, collectionId)}
        </body>
        </html>
    `;

    return new Response(html, {
        headers: { 'Content-Type': 'text/html;charset=utf-8' }
    });
}

function generateLoginPage(env) {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>订阅访问</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://unpkg.com/tailwindcss@2/dist/tailwind.min.css" rel="stylesheet">
        </head>
        <body class="bg-gray-100 min-h-screen flex items-center justify-center">
            <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h1 class="text-2xl font-bold text-center mb-8">订阅访问</h1>
                <form id="loginForm" class="space-y-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">用户名</label>
                        <input type="text" id="username" required
                            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">访问密码</label>
                        <input type="password" id="password" required
                            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                    </div>
                    <button type="submit"
                        class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        访问
                    </button>
                </form>
            </div>

            <script>
                // 保存用户凭证
                function saveUserAuth(username, password) {
                    const auth = btoa(username + ':' + password);
                    localStorage.setItem('user_auth', auth);
                    return auth;
                }

                document.getElementById('loginForm').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const username = document.getElementById('username').value;
                    const password = document.getElementById('password').value;

                    try {
                        const response = await fetch('/api/collections/verify', {
                            method: 'POST',
                            headers: { 
                                'Content-Type': 'application/json',
                                'Authorization': 'Basic ' + btoa(username + ':' + password)
                            },
                            body: JSON.stringify({ username, password })
                        });

                        if (response.ok) {
                            const { collectionId } = await response.json();
                            // 保存用户凭证并直接设置 Authorization 头
                            saveUserAuth(username, password);
                            // 使用 replace 而不是 href，避免浏览器历史记录
                            window.location.replace('/user/' + collectionId);
                        } else {
                            alert('用户名或密码错误');
                        }
                    } catch (error) {
                        alert('访问失败，请稍后重试');
                    }
                });
            </script>
        </body>
        </html>
    `;

    return new Response(html, {
        headers: { 'Content-Type': 'text/html;charset=utf-8' }
    });
}

function generateScripts(env, collectionId) {
    return `
        <script>
            const CONFIG = {
                SUB_WORKER_URL: '${env.SUB_WORKER_URL || CONFIG.SUB_WORKER_URL}'
            };

            // 获取用户凭证
            function getUserAuth() {
                return localStorage.getItem('user_auth');
            }

            // 添加用户凭证到请求头
            async function fetchWithUserAuth(url, options = {}) {
                const auth = getUserAuth();
                if (auth) {
                    options.headers = {
                        ...options.headers,
                        'Authorization': 'Basic ' + auth
                    };
                }
                return fetch(url, options);
            }

            // 加载集合信息
            async function loadCollection() {
                const auth = getUserAuth();
                if (!auth) {
                    window.location.replace('/user');
                    return;
                }

                try {
                    const response = await fetchWithUserAuth('/api/collections');
                    if (response.ok) {
                        const collections = await response.json();
                        const collection = collections.find(c => c.id === '${collectionId}');
                        if (collection) {
                            renderCollection(collection);
                        } else {
                            showError('找不到集合');
                            setTimeout(() => window.location.replace('/user'), 2000);
                        }
                    } else if (response.status === 401) {
                        localStorage.removeItem('user_auth');
                        window.location.replace('/user');
                    }
                } catch (e) {
                    console.error('加载集合失败:', e);
                    showError('加载失败，请刷新重试');
                }
            }

            // 页面加载时直接获取集合信息
            loadCollection();

            function renderCollection(collection) {
                const collectionList = document.getElementById('collectionList');
                collectionList.innerHTML = \`
                    <div class="bg-white rounded-lg shadow-md p-6 space-y-4">
                        <div class="flex justify-between items-center">
                            <h2 class="text-xl font-semibold text-gray-800">\${collection.name}</h2>
                            <span class="text-sm text-gray-500">
                                节点数量: \${collection.nodeIds?.length || 0}
                            </span>
                        </div>
                        <div class="space-y-3">
                            <div class="flex flex-wrap gap-3">
                                <button onclick="copySubscription('\${collection.id}', 'base')"
                                    class="inline-flex items-center px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition duration-200">
                                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                                    </svg>
                                    通用订阅
                                </button>
                                <button onclick="copySubscription('\${collection.id}', 'singbox')"
                                    class="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200">
                                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                    </svg>
                                    SingBox订阅
                                </button>
                                <button onclick="copySubscription('\${collection.id}', 'clash')"
                                    class="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200">
                                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                    </svg>
                                    Clash订阅
                                </button>
                            </div>
                            <div class="text-sm text-gray-500">
                                更新时间: \${new Date(collection.updatedAt || collection.createdAt).toLocaleString()}
                            </div>
                        </div>
                    </div>
                \`;
            }

            function copySubscription(id, type) {
                const shareUrl = \`\${window.location.origin}/api/share/\${id}\`;
                let subUrl;
                
                switch (type) {
                    case 'base':
                        subUrl = CONFIG.SUB_WORKER_URL ? 
                            \`\${CONFIG.SUB_WORKER_URL}/base?url=\${encodeURIComponent(shareUrl)}\` :
                            \`\${shareUrl}/base?internal=1\`;
                        break;
                    case 'singbox':
                        subUrl = CONFIG.SUB_WORKER_URL ? 
                            \`\${CONFIG.SUB_WORKER_URL}/singbox?url=\${encodeURIComponent(shareUrl)}\` :
                            \`\${shareUrl}/singbox?internal=1\`;
                        break;
                    case 'clash':
                        subUrl = CONFIG.SUB_WORKER_URL ? 
                            \`\${CONFIG.SUB_WORKER_URL}/clash?url=\${encodeURIComponent(shareUrl)}\` :
                            \`\${shareUrl}/clash?internal=1\`;
                        break;
                }

                copyToClipboard(subUrl, '订阅链接已复制到剪贴板');
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

            function showError(message) {
                const error = document.createElement('div');
                error.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg';
                error.textContent = message;
                document.body.appendChild(error);
                setTimeout(() => error.remove(), 3000);
            }
        </script>
    `;
} 