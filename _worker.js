// CFSUB.js
import { CONFIG } from './config.js';
import { NodesService, CollectionsService, ShareService, AuthService } from './services.js';
import { generateManagementPage } from './management.js';
import { isSubscriptionPath } from './utils.js';
import { ErrorHandler } from './middleware.js';
import { generateUserPage } from './user.js';

export default {
    async fetch(request, env, ctx) {
        try {
            const services = initializeServices(env);
            return await handleRequest(request, env, services);
        } catch (err) {
            return ErrorHandler.handle(err, request);
        }
    }
};

function initializeServices(env) {
    const nodesService = new NodesService(env, CONFIG);
    const collectionsService = new CollectionsService(env, CONFIG);
    const shareService = new ShareService(env, CONFIG, nodesService, collectionsService);
    const authService = new AuthService(env, CONFIG);

    return {
        nodes: nodesService,
        collections: collectionsService,
        share: shareService,
        auth: authService
    };
}

async function handleRequest(request, env, services) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS 预检请求处理
    if (method === 'OPTIONS') {
        return handleCORS();
    }

    // 处理 favicon.ico 请求
    if (path === '/favicon.ico') {
        return new Response(null, { status: 204 });  // 返回空响应
    }

    // 用户页面路由处理
    if (path.startsWith('/user')) {
        const collectionId = path.split('/')[2];
        if (!collectionId) {
            return generateUserPage(env);
        }

        // 检查集合是否存在
        const collections = await services.collections.getCollections();
        const collection = collections.find(c => c.id === collectionId);
        if (!collection) {
            return new Response('Collection not found', { status: 404 });
        }

        // 检查是否需要验证
        const tokensData = await env.NODE_STORE.get(CONFIG.USER_TOKENS_KEY) || '[]';
        const tokens = JSON.parse(tokensData);
        const hasToken = tokens.some(t => t.collectionId === collectionId);

        if (!hasToken) {
            // 如果集合没有设置用户名密码，直接显示集合页面
            return generateUserPage(env, collectionId);
        }

        // 检查用户凭证
        const userAuth = request.headers.get('Authorization');
        if (!userAuth) {
            // 没有凭证，返回 401 触发浏览器的登录框
            return new Response('Authentication required', {
                status: 401,
                headers: {
                    'WWW-Authenticate': 'Basic realm="User Access"',
                    'Content-Type': 'text/plain'
                }
            });
        }

        try {
            const [username, password] = atob(userAuth.split(' ')[1]).split(':');
            const userToken = await services.collections.verifyUserAccess(username, password);
            
            if (userToken && userToken.collectionId === collectionId) {
                // 凭证有效且匹配当前集合，显示集合页面
                return generateUserPage(env, collectionId);
            }
        } catch (e) {
            console.error('验证用户凭证失败:', e);
        }

        // 凭证无效或不匹配，返回 401 触发浏览器的登录框
        return new Response('Invalid credentials', {
            status: 401,
            headers: {
                'WWW-Authenticate': 'Basic realm="User Access"',
                'Content-Type': 'text/plain'
            }
        });
    }

    // 公开路径不需要认证
    if (isPublicPath(path)) {
        if (path.startsWith('/api/')) {
            return handleAPIRequest(request, path, services);
        }
        return null;  // 继续处理其他路由
    }

    // 管理员认证检查
    const auth = request.headers.get('Authorization');
    if (!auth || !services.auth.checkAuth(auth)) {
        return new Response('Unauthorized', {
            status: 401,
            headers: {
                'WWW-Authenticate': 'Basic realm="Admin Access"',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }

    // API 路由处理
    if (path.startsWith('/api/')) {
        return handleAPIRequest(request, path, services);
    }

    // 返回管理界面
    return generateManagementPage(env, CONFIG);
}

function isPublicPath(path) {
    return path.startsWith(CONFIG.API.SHARE) || 
           isSubscriptionPath(path) || 
           path.startsWith('/user') ||  // 用户页面路径
           path === '/api/collections/verify' ||  // 用户验证接口
           path.startsWith('/api/collections/token/') ||  // 用户令牌接口
           path === '/api/collections' ||  // 允许获取集合列表
           path === '/favicon.ico';  // 允许访问网站图标
}

function handleCORS() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '86400'
        }
    });
}

async function handleAPIRequest(request, path, services) {
    // 节点API
    if (path.startsWith(CONFIG.API.NODES)) {
        return services.nodes.handleRequest(request);
    }
    
    // 集合API
    if (path.startsWith(CONFIG.API.COLLECTIONS)) {
        return services.collections.handleRequest(request);
    }
    
    // 分享API
    if (path.startsWith(CONFIG.API.SHARE)) {
        return services.share.handleRequest(request);
    }

    return new Response('Not Found', { status: 404 });
}