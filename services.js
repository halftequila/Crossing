import { CONFIG } from './config.js';

// 基础服务类
class BaseService {
    constructor(env, config) {
        this.env = env;
        this.config = config;
    }

    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    handleOptions() {
        return new Response(null, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        });
    }
}

// 节点服务
export class NodesService extends BaseService {
    async getNodes() {
        if (!this.env?.NODE_STORE) {
            return [];
        }
        const data = await this.env.NODE_STORE.get(this.config.KV_KEY);
        return data ? JSON.parse(data) : [];
    }

    async setNodes(nodes) {
        if (!this.env?.NODE_STORE) {
            throw new Error('KV store not available');
        }
        await this.env.NODE_STORE.put(this.config.KV_KEY, JSON.stringify(nodes));
    }

    async handleRequest(request) {
        const method = request.method;
        switch (method) {
            case 'GET': return this.handleGet();
            case 'POST': return this.handlePost(request);
            case 'PUT': return this.handlePut(request);
            case 'DELETE': return this.handleDelete(request);
            case 'OPTIONS': return this.handleOptions();
            default: return new Response('Method not allowed', { status: 405 });
        }
    }

    // 节点服务的处理方法
    async handleGet() {
        const nodes = await this.getNodes();
        return new Response(JSON.stringify(nodes), {
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }

    async handlePost(request) {
        try {
            const data = await request.json();
            if (!data.name || !data.url) {
                throw new Error('Missing required fields');
            }
            
            const nodes = await this.getNodes();
            const newNode = {
                id: this.generateUUID(),
                name: data.name,
                url: data.url,
                createdAt: new Date().toISOString()
            };
            
            nodes.push(newNode);
            await this.setNodes(nodes);
            
            return new Response(JSON.stringify(newNode), {
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (e) {
            return new Response(JSON.stringify({ error: e.message }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    async handlePut(request) {
        try {
            const data = await request.json();
            if (!data.id || !data.name || !data.url) {
                throw new Error('Missing required fields');
            }
            
            const nodes = await this.getNodes();
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
            
            await this.setNodes(nodes);
            return new Response(JSON.stringify(nodes[nodeIndex]), {
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (e) {
            return new Response(JSON.stringify({ error: e.message }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    async handleDelete(request) {
        try {
            const { id } = await request.json();
            const nodes = await this.getNodes();
            const newNodes = nodes.filter(node => node.id !== id);
            await this.setNodes(newNodes);
            return new Response(JSON.stringify({ success: true }));
        } catch (e) {
            return new Response(JSON.stringify({ error: e.message }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    // ... 节点的其他处理方法 ...
}

// 集合服务
export class CollectionsService extends BaseService {
    async getCollections() {
        if (!this.env?.NODE_STORE) {
            return [];
        }
        const data = await this.env.NODE_STORE.get(this.config.COLLECTIONS_KEY);
        return data ? JSON.parse(data) : [];
    }

    async setCollections(collections) {
        if (!this.env?.NODE_STORE) {
            throw new Error('KV store not available');
        }
        await this.env.NODE_STORE.put(this.config.COLLECTIONS_KEY, JSON.stringify(collections));
    }

    async handleRequest(request) {
        const method = request.method;
        const url = new URL(request.url);
        const path = url.pathname;

        // 处理获取用户令牌请求
        if (method === 'GET' && path.startsWith('/api/collections/token/')) {
            const collectionId = path.split('/').pop();
            const tokensData = await this.env.NODE_STORE.get(CONFIG.USER_TOKENS_KEY) || '[]';
            const tokens = JSON.parse(tokensData);
            const token = tokens.find(t => t.collectionId === collectionId);
            
            return new Response(JSON.stringify(token || {}), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 处理密码验证路由
        if (method === 'POST' && path.endsWith('/verify')) {
            try {
                const { username, password } = await request.json();
                const userToken = await this.verifyUserAccess(username, password);
                
                if (userToken) {
                    // 创建会话令牌
                    const sessionToken = this.generateUUID();
                    const session = {
                        token: sessionToken,
                        username,
                        collectionId: userToken.collectionId,
                        expiresAt: Date.now() + (CONFIG.USER_SESSION_EXPIRE * 1000)
                    };

                    // 保存会话
                    const sessionsData = await this.env.NODE_STORE.get(CONFIG.USER_SESSION_KEY) || '{}';
                    const sessions = JSON.parse(sessionsData);
                    sessions[sessionToken] = session;
                    await this.env.NODE_STORE.put(CONFIG.USER_SESSION_KEY, JSON.stringify(sessions));

                    return new Response(JSON.stringify({ 
                        success: true,
                        collectionId: userToken.collectionId,
                        sessionToken
                    }), {
                        headers: { 
                            'Content-Type': 'application/json',
                            'Set-Cookie': `session=${sessionToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${CONFIG.USER_SESSION_EXPIRE}`
                        }
                    });
                } else {
                    return new Response('Invalid credentials', { status: 401 });
                }
            } catch (e) {
                return new Response('Error verifying credentials', { status: 500 });
            }
        }

        // 处理常规请求
        switch (method) {
            case 'GET': return this.handleGet();
            case 'POST': return this.handlePost(request);
            case 'PUT': return this.handlePut(request);
            case 'DELETE': return this.handleDelete(request);
            case 'OPTIONS': return this.handleOptions();
            default: return new Response('Method not allowed', { status: 405 });
        }
    }

    // 集合服务的处理方法
    async handleGet() {
        const collections = await this.getCollections();
        return new Response(JSON.stringify(collections), {
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }

    async handlePost(request) {
        try {
            const data = await request.json();
            if (!data.name || !data.nodeIds || !Array.isArray(data.nodeIds)) {
                throw new Error('Missing required fields');
            }
            
            const collections = await this.getCollections();
            const newCollection = {
                id: this.generateUUID(),
                name: data.name,
                nodeIds: data.nodeIds,
                createdAt: new Date().toISOString(),
                userId: data.userId // 支持用户关联
            };
            
            collections.push(newCollection);
            await this.setCollections(collections);
            
            return new Response(JSON.stringify(newCollection), {
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (e) {
            return new Response(JSON.stringify({ error: e.message }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    async handlePut(request) {
        try {
            const { id, nodeIds, username, password, name } = await request.json();
            if (!id) {
                throw new Error('Missing collection id');
            }

            const collections = await this.getCollections();
            const collectionIndex = collections.findIndex(c => c.id === id);
            
            if (collectionIndex === -1) {
                throw new Error('Collection not found');
            }

            // 更新集合信息
            collections[collectionIndex] = {
                ...collections[collectionIndex],
                name: name || collections[collectionIndex].name,
                nodeIds: nodeIds || collections[collectionIndex].nodeIds,
                updatedAt: new Date().toISOString()
            };

            // 如果提供了密码，更新访问凭证
            if (password) {
                await this.setCollectionPassword(id, username, password);
            }

            await this.setCollections(collections);
            return new Response(JSON.stringify(collections[collectionIndex]), {
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (e) {
            return new Response(JSON.stringify({ error: e.message }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    async handleDelete(request) {
        try {
            const { id } = await request.json();
            const collections = await this.getCollections();
            const newCollections = collections.filter(collection => collection.id !== id);
            await this.setCollections(newCollections);
            return new Response(JSON.stringify({ success: true }));
        } catch (e) {
            return new Response(JSON.stringify({ error: e.message }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    async setCollectionPassword(id, username, password) {
        const tokensData = await this.env.NODE_STORE.get(CONFIG.USER_TOKENS_KEY) || '[]';
        const tokens = JSON.parse(tokensData);
        
        // 添加或更新户令牌
        const tokenIndex = tokens.findIndex(t => t.collectionId === id);
        const token = {
            username: username || `user_${id.slice(0, 6)}`,  // 如果没有提供用户名，生成一个
            password,
            collectionId: id,
            createdAt: new Date().toISOString()
        };

        if (tokenIndex >= 0) {
            tokens[tokenIndex] = token;
        } else {
            tokens.push(token);
        }

        await this.env.NODE_STORE.put(CONFIG.USER_TOKENS_KEY, JSON.stringify(tokens));
        return token;
    }

    async verifyUserAccess(username, password) {
        const tokensData = await this.env.NODE_STORE.get(CONFIG.USER_TOKENS_KEY) || '[]';
        const tokens = JSON.parse(tokensData);
        return tokens.find(t => t.username === username && t.password === password);
    }

    async verifySession(sessionToken) {
        if (!sessionToken) return null;

        const sessionsData = await this.env.NODE_STORE.get(CONFIG.USER_SESSION_KEY) || '{}';
        const sessions = JSON.parse(sessionsData);
        const session = sessions[sessionToken];

        if (!session || session.expiresAt < Date.now()) {
            return null;
        }

        return session;
    }

    // ... 集合的其他处理方法 ...
}

// 分享服务增强
export class ShareService extends BaseService {
    constructor(env, config, nodesService, collectionsService) {
        super(env, config);
        this.nodesService = nodesService;
        this.collectionsService = collectionsService;
    }

    async handleRequest(request) {
        const url = new URL(request.url);
        const path = url.pathname;
        
        // 修改ID提取逻辑
        const pathParts = path.split('/');
        let id;
        
        // 处理带有订阅类型的路径 (如 /api/share/{id}/base)
        if (this.isSubscriptionPath(path)) {
            id = pathParts[pathParts.length - 2];  // 获取倒数第二个部分作为ID
        } else {
            id = pathParts[pathParts.length - 1];  // 获取最后一个部分作为ID
        }

        try {
            // 处理订阅请求
            if (this.isSubscriptionPath(path)) {
                return this.handleSubscription(request, id);
            }

            // 处理普通分享请求
            return this.handleShare(id);
        } catch (e) {
            console.error('Share service error:', e);
            return new Response('Error processing request', { status: 500 });
        }
    }

    async handleShare(id) {
        try {
            const collection = await this.getCollection(id);
            if (!collection) {
                console.error('Collection not found:', id);
                return new Response('Collection not found', { status: 404 });
            }

            const nodes = await this.getCollectionNodes(collection);
            if (!nodes || nodes.length === 0) {
                console.error('No nodes found for collection:', id);
                return new Response('No nodes found', { status: 404 });
            }

            const urls = nodes.map(node => node.url).join('\n');
            
            return new Response(urls, {
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        } catch (e) {
            console.error('Error in handleShare:', e);
            return new Response('Internal Server Error', { status: 500 });
        }
    }

    async handleSubscription(request, id) {
        const url = new URL(request.url);
        const collection = await this.getCollection(id);
        
        if (!collection) {
            return new Response('Collection not found', { status: 404 });
        }

        const nodes = await this.getCollectionNodes(collection);
        
        // 检查是否���置了外部订阅转换器
        const externalConverter = this.env.SUB_WORKER_URL || this.config.SUB_WORKER_URL;
        const useInternal = url.searchParams.get('internal') === '1';

        if (externalConverter && !useInternal) {
            // 使用外部订阅转换器
            return this.handleExternalSubscription(request, nodes);
        } else {
            // 使用内部订阅转换器
            return this.handleInternalSubscription(request, nodes);
        }
    }

    async handleInternalSubscription(request, nodes) {
        const url = new URL(request.url);
        const path = url.pathname;

        // 导入相应的处理函数
        if (path.endsWith('/base')) {
            const { handleConvertRequest } = await import('./subscription/base.js');
            // 使用自定义头部传递节点数据
            const headers = new Headers(request.headers);
            headers.set('X-Node-Data', JSON.stringify(nodes));
            const newRequest = new Request(request.url, {
                ...request,
                headers
            });
            return handleConvertRequest(newRequest, this.env);
        } 
        else if (path.endsWith('/singbox')) {
            const { handleSingboxRequest } = await import('./subscription/singbox.js');
            const newRequest = new Request(request.url, {
                ...request,
                nodeData: nodes
            });
            return handleSingboxRequest(newRequest, this.env);
        } 
        else if (path.endsWith('/clash')) {
            const { handleClashRequest } = await import('./subscription/clash.js');
            const newRequest = new Request(request.url, {
                ...request,
                nodeData: nodes
            });
            return handleClashRequest(newRequest, this.env);
        }

        return new Response('Invalid subscription type', { status: 400 });
    }

    async handleExternalSubscription(request, nodes) {
        const url = new URL(request.url);
        const shareUrl = `${url.origin}${url.pathname}`;
        const templateParam = url.searchParams.get('template') ? 
            `&template=${encodeURIComponent(url.searchParams.get('template'))}` : '';
        
        let converterUrl;
        if (url.pathname.endsWith('/base')) {
            converterUrl = `${this.config.SUB_WORKER_URL}/base?url=${encodeURIComponent(shareUrl)}`;
        } else if (url.pathname.endsWith('/singbox')) {
            converterUrl = `${this.config.SUB_WORKER_URL}/singbox?url=${encodeURIComponent(shareUrl)}${templateParam}`;
        } else if (url.pathname.endsWith('/clash')) {
            converterUrl = `${this.config.SUB_WORKER_URL}/clash?url=${encodeURIComponent(shareUrl)}${templateParam}`;
        }

        return fetch(converterUrl);
    }

    async getCollection(id) {
        try {
            const collections = await this.collectionsService.getCollections();
            const collection = collections.find(c => c.id === id);
            if (!collection) {
                console.error('Collection not found in getCollection:', id);
            }
            return collection;
        } catch (e) {
            console.error('Error in getCollection:', e);
            return null;
        }
    }

    async getCollectionNodes(collection) {
        try {
            if (!collection || !collection.nodeIds || !Array.isArray(collection.nodeIds)) {
                console.error('Invalid collection:', collection);
                return [];
            }

            const nodes = await this.nodesService.getNodes();
            const collectionNodes = nodes.filter(node => collection.nodeIds.includes(node.id));
            
            if (collectionNodes.length === 0) {
                console.error('No nodes found for collection:', collection.id);
            }
            
            return collectionNodes;
        } catch (e) {
            console.error('Error in getCollectionNodes:', e);
            return [];
        }
    }

    isSubscriptionPath(path) {
        return ['/base', '/singbox', '/clash'].some(type => path.endsWith(type));
    }
}

// 认证服务
export class AuthService extends BaseService {
    checkAuth(authHeader) {
        try {
            const [scheme, encoded] = authHeader.split(' ');
            if (!encoded || scheme !== 'Basic') {
                return false;
            }
            
            const decoded = atob(encoded);
            const [username, password] = decoded.split(':');
            
            const validUsername = this.env.ADMIN_USERNAME || this.config.DEFAULT_USERNAME;
            const validPassword = this.env.ADMIN_PASSWORD || this.config.DEFAULT_PASSWORD;
            
            return username === validUsername && password === validPassword;
        } catch (e) {
            return false;
        }
    }
} 