export const CONFIG = {
    // KV 存储配置
    KV_NAMESPACE: 'NODE_STORE',
    KV_KEY: 'nodes',
    COLLECTIONS_KEY: 'collections',

    // 外部服务配置
    SUB_WORKER_URL: '',
    SUBSCRIBER_URL: 'https://bestipsub.8669.xyz/', //自选订阅外链，非必须
    QUICK_SUB_URL: 'https://resubname.8669.xyz/', //快速订阅外链，非必须

    // 默认模板配置
    DEFAULT_TEMPLATE_URL: 'https://raw.githubusercontent.com/Troywww/singbox_conf/main/singbox_clash_conf.txt',

    // 认证配置
    DEFAULT_USERNAME: 'admin',
    DEFAULT_PASSWORD: 'admin',

    // 订阅相关配置
    SUBSCRIPTION: {
        BASE_PATH: '/base',
        SINGBOX_PATH: '/singbox',
        CLASH_PATH: '/clash'
    },

    // API路径配置
    API: {
        NODES: '/api/nodes',
        COLLECTIONS: '/api/collections',
        SHARE: '/api/share',
        USER: '/api/user'
    },

    // 用户访问配置
    USER_TOKENS_KEY: 'user_tokens',  // 存储用户令牌的KV key

    // SingBox 基础配置
    SINGBOX_BASE_CONFIG: {
        dns: {
            servers: [
                {
                    tag: "dns_proxy",
                    address: "https://1.1.1.1/dns-query",
                    detour: "proxy"
                },
                {
                    tag: "dns_direct",
                    address: "https://223.5.5.5/dns-query",
                    detour: "direct"
                },
                {
                    tag: "dns_block",
                    address: "rcode://success"
                },
                {
                    tag: "dns_fakeip",
                    address: "fakeip"
                }
            ],
            rules: [
                {
                    geosite: ["category-ads-all"],
                    server: "dns_block",
                    disable_cache: true
                },
                {
                    geosite: ["geolocation-!cn"],
                    query_type: ["A", "AAAA"],
                    server: "dns_fakeip"
                },
                {
                    geosite: ["geolocation-!cn"],
                    server: "dns_proxy"
                }
            ],
            final: "dns_direct",
            independent_cache: true,
            fakeip: {
                enabled: true,
                inet4_range: "198.18.0.0/15"
            }
        },
        ntp: {
            enabled: true,
            server: "time.apple.com",
            server_port: 123,
            interval: "30m",
            detour: "direct"
        },
        inbounds: [
            {
                type: "mixed",
                tag: "mixed-in",
                listen: "0.0.0.0",
                listen_port: 2080
            },
            {
                type: "tun",
                tag: "tun-in",
                inet4_address: "172.19.0.1/30",
                auto_route: true,
                strict_route: true,
                stack: "system",
                sniff: true
            }
        ]
    },

    // Clash 基础配置
    CLASH_BASE_CONFIG: `port: 7890
socks-port: 7891
allow-lan: true
mode: rule
log-level: info
external-controller: :9090
dns:
  enable: true
  enhanced-mode: fake-ip
  fake-ip-range: 198.18.0.1/16
  nameserver:
    - 223.5.5.5
    - 119.29.29.29
  fallback:
    - 8.8.8.8
    - 8.8.4.4
  default-nameserver:
    - 223.5.5.5
    - 119.29.29.29
  fake-ip-filter:
    - '*.lan'
    - localhost.ptlogin2.qq.com
    - '+.srv.nintendo.net'
    - '+.stun.playstation.net'
    - '+.msftconnecttest.com'
    - '+.msftncsi.com'
    - '+.xboxlive.com'
    - 'msftconnecttest.com'
    - 'xbox.*.microsoft.com'
    - '*.battlenet.com.cn'
    - '*.battlenet.com'
    - '*.blzstatic.cn'
    - '*.battle.net'`,
}; 