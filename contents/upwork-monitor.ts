import type { PlasmoCSConfig } from "plasmo"
import { Storage } from "@plasmohq/storage"

export const config: PlasmoCSConfig = {
  matches: ["https://www.upwork.com/*"],
  all_frames: true
}

let observer: MutationObserver | null = null;
let isSliderOpen = false;  // 添加状态标记
const storage = new Storage();

// 语言配置
const i18n = {
  zh: {
    budget: "预算",
    proposals: "投标情况",
    totalProposals: "总数",
    interviewing: "面试中",
    invitesSent: "已邀请",
    clientInfo: "雇主信息",
    totalSpent: "总支出",
    hireRate: "雇佣率",
    lastViewed: "最后查看",
    hourly: "小时",
    unknown: "未知",
    notification: {
      title: "Upwork Assistant",
      body: "新的工作详情已打开！"
    }
  },
  en: {
    budget: "Budget",
    proposals: "Proposals",
    totalProposals: "Total",
    interviewing: "Interviewing",
    invitesSent: "Invites Sent",
    clientInfo: "Client Info",
    totalSpent: "Total Spent",
    hireRate: "Hire Rate",
    lastViewed: "Last Viewed",
    hourly: "hour",
    unknown: "Unknown",
    notification: {
      title: "Upwork Assistant",
      body: "New job details opened!"
    }
  }
};

// 获取当前语言
async function getCurrentLanguage(): Promise<"zh" | "en"> {
  const lang = await storage.get("upwork-language");
  return lang === "en" ? "en" : "zh";
}

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
async function createInfoCard(container: Element) {
    const lang = await getCurrentLanguage();
    const t = i18n[lang];

    // 解析预算信息
    const budgetElement = container.querySelector('[data-test="BudgetAmount"]');
    let budget = t.unknown;

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
            budget = budgetElement.querySelector('strong')?.textContent?.trim() || t.unknown;
        }
    }

    // 检查是否为时薪制
    const isHourly = container.querySelector('.description')?.textContent?.includes('Hourly') || false;
    if (isHourly && budget !== t.unknown) {
        budget = `${budget}/${t.hourly}`;
    }

    // 解析投标信息
    const proposals = container.querySelector('.ca-item:nth-child(1) .value')?.textContent?.trim() || t.unknown;
    const interviewing = container.querySelector('.ca-item:nth-child(3) .value')?.textContent?.trim() || '0';
    const invitesSent = container.querySelector('.ca-item:nth-child(4) .value')?.textContent?.trim() || '0';
    const lastViewed = container.querySelector('.ca-item:nth-child(2) .value')?.textContent?.trim() || t.unknown;

    // 解析客户信息
    const clientLocation = container.querySelector('[data-qa="client-location"] strong')?.textContent?.trim() || t.unknown;
    const clientCity = container.querySelector('[data-qa="client-location"] .nowrap:first-child')?.textContent?.trim() || '';
    const clientTime = container.querySelector('[data-test="LocalTime"]')?.textContent?.trim() || '';
    const totalSpent = container.querySelector('[data-qa="client-spend"] span span')?.textContent?.trim() || t.unknown;

    // 解析雇佣率
    const hireRateText = container.querySelector('[data-qa="client-job-posting-stats"] div')?.textContent?.trim() || '';
    const hireRate = hireRateText.match(/(\d+)%\s*hire rate/)?.[ 1 ] || t.unknown;

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
    if (budget === t.unknown && proposals === t.unknown && totalSpent === t.unknown) {
        console.log('重要信息未加载完成，将重试...');
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
        width: 80%;
        margin: 0 auto;
    `;

    // 设置卡片内容
    card.innerHTML = `
        <div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px; color: #14a800; font-weight: bold; font-size: 16px;">
                <span>&#128176; ${t.budget}: ${jobInfo.budget}</span>
            </div>

            <div style="display: flex; justify-content: space-between; margin-bottom: 12px; color: #001e00;">
                <span style="font-weight: 500;">&#128202; ${t.proposals}:</span>
                <span>
                    <span style="margin-right: 12px;">${t.totalProposals}: ${jobInfo.proposals}</span>
                    <span style="margin-right: 12px;">${t.interviewing}: ${jobInfo.interviewing}</span>
                    <span>${t.invitesSent}: ${jobInfo.invitesSent}</span>
                </span>
            </div>

            <div style="display: flex; justify-content: space-between; margin-bottom: 12px; color: #001e00;">
                <span style="font-weight: 500;">&#128100; ${t.clientInfo}:</span>
                <span>
                    <span style="margin-right: 12px">${jobInfo.location}</span>
                    <span style="margin-right: 12px">${t.totalSpent}: ${jobInfo.totalSpent}</span>
                    <span>${t.hireRate}: ${jobInfo.hireRate}</span>
                </span>
            </div>

            <div style="display: flex; justify-content: space-between; color: #001e00;">
                <span style="font-weight: 500;">&#128337; ${t.lastViewed}:</span>
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
    // 如果slider已经打开，不需要检查
    if (isSliderOpen) {
        return;
    }

    const sliders = document.querySelectorAll('.air3-slider-content[modaltitle="Job Details"]');
    if (sliders.length > 0) {
        console.log("找到slider!");
        isSliderOpen = true;  // 标记slider已打开
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

            // 监听关闭按钮的点击事件
            const closeButton = slider.querySelector('[data-test="slider-close-mobile"]');
            if (closeButton) {
                // 移除旧的事件监听器（如果存在）
                closeButton.removeEventListener('click', handleSliderClose);
                // 添加新的事件监听器
                closeButton.addEventListener('click', handleSliderClose);
            }

            // 监听返回按钮的点击事件
            const backButton = slider.querySelector('.air3-slider-prev-btn');
            if (backButton) {
                backButton.removeEventListener('click', handleSliderClose);
                backButton.addEventListener('click', handleSliderClose);
            }
        });

        // 暂停DOM监听
        if (observer) {
            console.log("暂停DOM监听");
            observer.disconnect();
        }
    }
}, 500);

// 处理slider关闭的函数
function handleSliderClose() {
    console.log("Slider已关闭");
    isSliderOpen = false;  // 重置状态

    // 移除可能存在的旧卡片
    const oldCards = document.querySelectorAll('.job-info-card');
    oldCards.forEach(card => card.remove());

    // 重新开始监听
    setTimeout(() => {
        if (!observer) {
            createObserver();
        } else {
            observer.observe(document.body, observerConfig);
        }
        console.log("恢复DOM监听");
    }, 500); // 延迟500ms后恢复监听，确保DOM已更新
}

// 修改通知函数以支持多语言
async function showNotification() {
    const lang = await getCurrentLanguage();
    const t = i18n[lang].notification;

    console.log("准备显示通知");
    if (Notification.permission === "granted") {
        new Notification(t.title, {
            body: t.body,
            icon: "assets/icon.png"
        });
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                new Notification(t.title, {
                    body: t.body,
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
        // 如果slider已经打开，不需要处理mutations
        if (isSliderOpen) {
            return;
        }

        let shouldCheck = false;

        for (const mutation of mutations) {
            // 如果是节点添加或移除
            if (mutation.type === 'childList') {
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
            // 检查slider是否真的已经关闭
            const existingSlider = document.querySelector('.air3-slider-content[modaltitle="Job Details"]');
            if (!existingSlider) {
                isSliderOpen = false;
            }
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