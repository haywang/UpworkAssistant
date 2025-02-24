chrome.runtime.onInstalled.addListener(() => {
    chrome.declarativeNetRequest.updateDynamicRules({
        addRules: [{
            id: 1,
            priority: 1,
            action: { type: 'modifyHeaders', requestHeaders: [{ header: 'X-My-Header', operation: 'set', value: 'myValue' }] },
            condition: { urlFilter: '*://*.upwork.com/*', resourceTypes: ['xmlhttprequest'] }
        }],
        removeRuleIds: [1]
    });
});

// 如果需要在请求完成后处理数据，可以在内容脚本中实现