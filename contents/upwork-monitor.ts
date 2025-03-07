import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["https://www.upwork.com/*"],
  all_frames: true
}

let observer: MutationObserver | null = null;

// 创建一个防抖函数来避免过多的检查
function debounce(func: Function, wait: number) {
    let timeout: number;
    return function executedFunction(...args: any[]) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = window.setTimeout(later, wait);
    };
}

// 创建信息卡片
function createInfoCard(container: Element) {
    // 解析预算信息
    const budgetElement = container.querySelector('[data-test="BudgetAmount"]');
    let budget = '预算未知';

    if (budgetElement) {
        // 检查是否有多个预算金额（时薪范围）
        const budgetAmounts = container.querySelectorAll('[data-test="BudgetAmount"] strong');
        if (budgetAmounts.length > 1) {
            // 时薪范围的情况
            const minRate = budgetAmounts[0]?.textContent?.trim();
            const maxRate = budgetAmounts[1]?.textContent?.trim();
            budget = `${minRate} - ${maxRate}`;
        } else {
            // 单一预算的情况
            budget = budgetElement.querySelector('strong')?.textContent?.trim() || '预算未知';
        }
    }

    // 检查是否为时薪制
    const isHourly = container.querySelector('.description')?.textContent?.includes('Hourly') || false;
    if (isHourly && budget !== '预算未知') {
        budget = `${budget}/小时`;
    }

    // 解析投标信息
    const proposals = container.querySelector('.ca-item:nth-child(1) .value')?.textContent?.trim() || '未知';
    const interviewing = container.querySelector('.ca-item:nth-child(3) .value')?.textContent?.trim() || '0';
    const invitesSent = container.querySelector('.ca-item:nth-child(4) .value')?.textContent?.trim() || '0';
    const lastViewed = container.querySelector('.ca-item:nth-child(2) .value')?.textContent?.trim() || '未知';

    // 解析客户信息
    const clientLocation = container.querySelector('[data-qa="client-location"] strong')?.textContent?.trim() || '未知';
    const clientCity = container.querySelector('[data-qa="client-location"] .nowrap:first-child')?.textContent?.trim() || '';
    const clientTime = container.querySelector('[data-test="LocalTime"]')?.textContent?.trim() || '';
    const totalSpent = container.querySelector('[data-qa="client-spend"] span span')?.textContent?.trim() || '未知';

    // 解析雇佣率
    const hireRateText = container.querySelector('[data-qa="client-job-posting-stats"] div')?.textContent?.trim() || '';
    const hireRate = hireRateText.match(/(\d+)%\s*hire rate/)?.[ 1 ] || '未知';

    const jobInfo = {
        budget,
        proposals,
        interviewing,
        invitesSent,
        lastViewed,
        location: `${clientLocation} ${clientCity} ${clientTime}`.trim(),
        totalSpent,
        hireRate: `${hireRate}%`
    };

    // 检查是否所有重要信息都已获取
    if (budget === '预算未知' && proposals === '未知' && totalSpent === '未知') {
        console.log('重要信息未加载完成，将重试...');
        // 如果重要信息都未获取到，再等待1秒后重试
        setTimeout(() => createInfoCard(container), 1000);
        return;
    }

    console.log('提取的工作信息:', jobInfo);

    // 创建卡片元素
    const card = document.createElement('div');
    card.className = 'air3-card-section mt-4 p-4 job-info-card';
    card.style.cssText = `
        background-color: #f8f9fa;
        border: 1px solid #e9ecef;
        border-radius: 8px;
        margin-bottom: 16px;
        font-family: 'Neue Montreal', sans-serif;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    `;

    // 设置卡片内容
    card.innerHTML = `
        <div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px; color: #14a800; font-weight: bold; font-size: 16px;">
                <span>&#128176; 预算: ${jobInfo.budget}</span>
            </div>

            <div style="display: flex; justify-content: space-between; margin-bottom: 12px; color: #001e00;">
                <span style="font-weight: 500;">&#128202; 投标情况:</span>
                <span>
                    <span style="margin-right: 12px;">总数: ${jobInfo.proposals}</span>
                    <span style="margin-right: 12px;">面试中: ${jobInfo.interviewing}</span>
                    <span>已邀请: ${jobInfo.invitesSent}</span>
                </span>
            </div>

            <div style="display: flex; justify-content: space-between; margin-bottom: 12px; color: #001e00;">
                <span style="font-weight: 500;">&#128100; 雇主信息:</span>
                <span>
                    <span style="margin-right: 12px">${jobInfo.location}</span>
                    <span style="margin-right: 12px">总支出: ${jobInfo.totalSpent}</span>
                    <span>雇佣率: ${jobInfo.hireRate}</span>
                </span>
            </div>

            <div style="display: flex; justify-content: space-between; color: #001e00;">
                <span style="font-weight: 500;">&#128337; 最后查看:</span>
                <span>${jobInfo.lastViewed}</span>
            </div>
        </div>
    `;

    // 找到所有的air3-card-section
    const sections = container.querySelectorAll('.air3-card-section');
    // 如果存在第二个section，就插入到它前面
    if (sections.length >= 2) {
        sections[1].parentElement?.insertBefore(card, sections[1]);
    } else {
        // 如果找不到第二个section，就插入到第一个section前面（作为后备方案）
        const firstSection = container.querySelector('section');
        if (firstSection) {
            firstSection.parentElement?.insertBefore(card, firstSection);
        }
    }
}

// 检查slider的函数
const checkForSlider = debounce(() => {
    const sliders = document.querySelectorAll('.air3-slider-content[modaltitle="Job Details"]');
    if (sliders.length > 0) {
        console.log("找到slider!");
        showNotification();

        // 为每个找到的slider添加信息卡片
        sliders.forEach(slider => {
            // 确保卡片只添加一次
            if (!slider.querySelector('.job-info-card')) {
                // 延迟1秒后获取信息并创建卡片
                setTimeout(() => {
                    console.log("开始获取工作信息...");
                    createInfoCard(slider);
                }, 1000);
            }
        });
    }
}, 500);

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
const observerConfig: MutationObserverInit = {
    childList: true,
    subtree: true,
    attributes: true
};

// 创建观察者
function createObserver() {
    if (observer) {
        observer.disconnect();
    }

    observer = new MutationObserver((mutations) => {
        let shouldCheck = false;

        for (const mutation of mutations) {
            // 如果是节点添加
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                shouldCheck = true;
                break;
            }
            // 如果是属性变化，且是相关属性
            if (mutation.type === 'attributes' &&
                mutation.target instanceof Element &&
                (mutation.attributeName === 'class' || mutation.attributeName === 'modaltitle')) {
                shouldCheck = true;
                break;
            }
        }

        if (shouldCheck) {
            checkForSlider();
        }
    });

    observer.observe(document.body, observerConfig);
    console.log("Observer已启动");
}

// 初始化函数
function init() {
    console.log("Upwork Monitor 初始化");
    createObserver();

    // 初始检查
    checkForSlider();
}

// 页面加载完成后初始化
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}

// 处理页面可见性变化
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        console.log("页面变为可见，重新初始化observer");
        init();
    }
});

// 确保在页面卸载时清理observer
window.addEventListener('unload', () => {
    if (observer) {
        observer.disconnect();
        observer = null;
    }
});