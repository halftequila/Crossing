// sub-converter.js 通用订阅转换后端，链接+/?url= 的方式获得


export default {
  async fetch(request, env) {
      const url = new URL(request.url);
      const sourceUrl = url.searchParams.get('url');
      
      if (!sourceUrl) {
          return generateHomePage();
      }

      try {
          const nodes = await getAllNodes(sourceUrl);
          
          if (nodes.length === 0) {
              throw new Error('No valid nodes found');
          }
          
          const finalContent = btoa(nodes.join('\n'));
          
          return new Response(finalContent, {
              headers: {
                  'Content-Type': 'text/plain;charset=utf-8',
                  'Profile-Update-Interval': '6',
                  'Access-Control-Allow-Origin': '*',
                  'Cache-Control': 'no-cache'
              }
          });
      } catch (e) {
          console.error('Error:', e);
          return new Response(`Error: ${e.message}`, { 
              status: 500,
              headers: {
                  'Content-Type': 'text/plain;charset=utf-8',
                  'Access-Control-Allow-Origin': '*'
              }
          });
      }
  }
};

// 区域识别配置
const REGION_PATTERNS = {
  '🇺🇸': [/美|美国|美國|US|United States|USA/i],
  '🇯🇵': [/日|日本|JP|Japan/i],
  '🇭🇰': [/港|香港|HK|Hong Kong/i],
  '🇨🇳': [/中国|中國|CN|China/i],
  '🇸🇬': [/新|新加坡|狮城|SG|Singapore/i],
  '🇹🇼': [/台|台湾|台灣|TW|Taiwan/i],
  '🇬🇧': [/英|英国|UK|United Kingdom/i],
  '🇰🇷': [/韩|韩国|南朝鲜|KR|Korea/i],
  '🇩🇪': [/德|德国|DE|Germany/i],
  '🇮🇳': [/印|印度|IN|India/i],
  '🇫🇷': [/法|法国|FR|France/i],
  '🇦🇺': [/澳|澳洲|澳大利亚|AU|Australia/i],
  '🇨🇦': [/加拿大|CA|Canada/i],
  '🇷🇺': [/俄|俄罗斯|RU|Russia/i],
  '🇮🇹': [/意|意大利|IT|Italy/i]
};

// 添加区域标识
function addRegionFlag(nodeName) {
  if (!nodeName) return nodeName;
  
  // 检查是否已有国旗emoji
  if (/[\uD83C][\uDDE6-\uDDFF][\uD83C][\uDDE6-\uDDFF]/.test(nodeName)) {
      return nodeName;
  }

  for (const [flag, patterns] of Object.entries(REGION_PATTERNS)) {
      for (const pattern of patterns) {
          if (pattern.test(nodeName)) {
              return `${flag}${nodeName}`;
          }
      }
  }

  return nodeName;
}

// 处理不同协议的节点
function processNode(url) {
  try {
      const protocol = url.toLowerCase().split('://')[0];
      
      switch (protocol) {
          case 'vmess':
              return processVmessLink(url);
          case 'vless':
              return processVlessLink(url);
          case 'trojan':
              return processTrojanLink(url);
          case 'ss':
              return processShadowsocksLink(url);
          case 'hysteria2':
              return processHysteria2Link(url);
          default:
              return url;
      }
  } catch (e) {
      console.error('Error processing node:', e);
      return url;
  }
}

// 处理 VMess 链接
function processVmessLink(url) {
  try {
      const content = atob(url.substring(8));
      const config = JSON.parse(content);
      config.ps = addRegionFlag(config.ps);
      return 'vmess://' + btoa(JSON.stringify(config));
  } catch (e) {
      console.error('Failed to process vmess link:', e);
      return url;
  }
}

// 处理 VLESS 链接
function processVlessLink(url) {
  try {
      const content = url.substring(8);
      const parsedUrl = new URL('http://' + content);
      let remarks = decodeURIComponent(parsedUrl.hash.substring(1) || '');
      remarks = addRegionFlag(remarks);
      return url.replace(parsedUrl.hash, '#' + encodeURIComponent(remarks));
  } catch (e) {
      console.error('Failed to process vless link:', e);
      return url;
  }
}

// 处理 Trojan 链接
function processTrojanLink(url) {
  try {
      const parsedUrl = new URL(url);
      let remarks = decodeURIComponent(parsedUrl.hash.substring(1) || '');
      remarks = addRegionFlag(remarks);
      return url.replace(parsedUrl.hash, '#' + encodeURIComponent(remarks));
  } catch (e) {
      console.error('Failed to process trojan link:', e);
      return url;
  }
}

// 处理 Shadowsocks 链接
function processShadowsocksLink(url) {
  try {
      const parsedUrl = new URL(url);
      let remarks = decodeURIComponent(parsedUrl.hash.substring(1) || '');
      remarks = addRegionFlag(remarks);
      return url.replace(parsedUrl.hash, '#' + encodeURIComponent(remarks));
  } catch (e) {
      console.error('Failed to process shadowsocks link:', e);
      return url;
  }
}

// 处理 Hysteria2 链接
function processHysteria2Link(url) {
  try {
      const content = url.substring(11);
      const parsedUrl = new URL('http://' + content);
      let remarks = decodeURIComponent(parsedUrl.hash.substring(1) || '');
      remarks = addRegionFlag(remarks);
      return url.replace(parsedUrl.hash, '#' + encodeURIComponent(remarks));
  } catch (e) {
      console.error('Failed to process hysteria2 link:', e);
      return url;
  }
}

// 获取所有节点
async function getAllNodes(url) {
  const nodes = new Set();
  const processedUrls = new Set();
  
  try {
      if (url.startsWith('http')) {
          await processUrl(url, nodes, processedUrls);
      } else {
          const urlContent = decodeURIComponent(url);
          const protocolRegex = /(vmess|vless|trojan|ss|hysteria2):\/\/[^\s\n]+/g;
          const matches = urlContent.match(protocolRegex);
          
          if (matches) {
              for (const node of matches) {
                  const processedNode = processNode(node);
                  if (processedNode) {
                      nodes.add(processedNode);
                  }
              }
          }
      }
  } catch (e) {
      console.error('Failed to process URL content:', e);
  }

  return Array.from(nodes);
}

// 处理URL
// 处理URL
async function processUrl(url, nodes, processedUrls) {
  if (processedUrls.has(url)) {
      return;
  }
  processedUrls.add(url);

  try {
      const response = await fetch(url, {
          headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Accept': '*/*'
          }
      });

      // 处理404和其他错误状态
      if (response.status === 404) {
          console.warn(`Subscription link not found (404): ${url}`);
          return; // 静默处理404错误
      }

      if (!response.ok) {
          console.error(`HTTP error! status: ${response.status} for URL: ${url}`);
          return; // 继续处理其他URL，而不是抛出错误
      }

      let content = await response.text();
      
      // 尝试base64解码
      try {
          const decoded = atob(content);
          content = decoded;
      } catch (e) {
          // 不是base64编码，使用原始内容
      }

      const lines = content.split(/[\s\n]+/)
          .map(line => line.trim())
          .filter(line => line);

      for (const line of lines) {
          if (isProxyLink(line)) {
              const processedNode = processNode(line);
              if (processedNode) {
                  nodes.add(processedNode);
              }
          } else if (line.startsWith('http') && !processedUrls.has(line)) {
              await processUrl(line, nodes, processedUrls);
          }
      }
  } catch (e) {
      console.warn(`Error processing URL: ${url}`, e);
      // 继续处理其他URL，而不是中断整个过程
  }
}
// 检查是否为代理链接
function isProxyLink(url) {
  const protocols = ['vmess://', 'vless://', 'trojan://', 'ss://', 'hysteria2://'];
  return protocols.some(protocol => url.toLowerCase().startsWith(protocol));
}

// 生成首页
function generateHomePage() {
  return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
          <title>订阅转换</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
              body { 
                  font-family: Arial, sans-serif;
                  max-width: 800px;
                  margin: 20px auto;
                  padding: 0 20px;
                  line-height: 1.6;
              }
              .example {
                  background: #f5f5f5;
                  padding: 15px;
                  border-radius: 5px;
                  margin: 10px 0;
              }
              .note {
                  color: #666;
                  font-size: 0.9em;
                  margin-top: 20px;
              }
          </style>
      </head>
      <body>
          <h1>订阅转换</h1>
          <p>使用方法：</p>
          <div class="example">
              <code>/?url=订阅链接</code>
          </div>
          <p>支持：</p>
          <ul>
              <li>订阅链接</li>
              <li>直接节点链接：
                  <ul>
                      <li>vmess://</li>
                      <li>vless:// (支持 Reality)</li>
                      <li>trojan://</li>
                      <li>ss://</li>
                      <li>hysteria2://</li>
                  </ul>
              </li>
              <li>Base64编码内容</li>
          </ul>
          <div class="note">
              <p>注意：</p>
              <ul>
                  <li>链接必须可以正常访问</li>
                  <li>返回内容为 base64 编码</li>
                  <li>支持多种代理协议</li>
                  <li>自动处理嵌套订阅</li>
                  <li>自动添加区域标识</li>
              </ul>
          </div>
      </body>
      </html>
  `, {
      headers: { 'Content-Type': 'text/html;charset=utf-8' }
  });
}
