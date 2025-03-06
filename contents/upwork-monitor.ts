import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["https://www.upwork.com/*"]
}

// 创建一个MutationObserver来监听DOM变化
const observer = new MutationObserver((mutations) => {
    console.log("MutationObserver触发", mutations.length, "个变化");

    mutations.forEach((mutation) => {
        console.log("mutation类型:", mutation.type);
        console.log("新增节点数量:", mutation.addedNodes.length);

        // 检查新增的节点
        mutation.addedNodes.forEach((node) => {
            console.log("检查节点:", node);

            // 检查当前节点
            if (node instanceof Element) {
                console.log("是Element节点，检查当前节点");
                if (node.classList.contains('air3-slider-content') && node.getAttribute('modaltitle') === "Job Details") {
                    console.log("直接匹配到slider!");
                    showNotification();
                    return;
                }
            }

            // 在整个文档中查找
            const sliders = document.querySelectorAll('.air3-slider-content[modaltitle="Job Details"]');
            console.log("找到的sliders数量:", sliders.length);
            if (sliders.length > 0) {
                console.log("找到slider!");
                showNotification();
            }
        });
    });
});

function showNotification() {
    console.log("准备显示通知");
    if (Notification.permission === "granted") {
        new Notification("Upwork Assistant", {
            body: "新的工作详情已打开！",
            icon: "assets/icon.png"
        });
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                new Notification("Upwork Assistant", {
                    body: "新的工作详情已打开！",
                    icon: "assets/icon.png"
                });
            }
        });
    }
}

// 配置观察选项
const observerConfig = {
    childList: true, // 观察目标子节点的变化
    subtree: true, // 观察所有后代节点
    attributes: true, // 观察属性变化
    characterData: true // 观察节点内容或文本变化
};

// 初始化函数
function init() {
    console.log("Upwork Monitor 初始化");

    // 检查是否已经存在slider
    const existingSliders = document.querySelectorAll('.air3-slider-content[modaltitle="Job Details"]');
    console.log("初始化时找到的sliders数量:", existingSliders.length);

    // 开始观察整个document
    observer.observe(document.body, observerConfig);
    console.log("Observer已启动");
}

// 确保DOM加载完成后再初始化
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}