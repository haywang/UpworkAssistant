import type { PlasmoCSConfig } from "plasmo"
import { Storage } from "@plasmohq/storage"
import { Logger } from "./utils/logger"

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
    connectsRequired: "Connects",
    hires: "已雇佣",
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
    connectsRequired: "Connects",
    hires: "Hires",
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
    // 再次检查是否已经存在卡片
    if (document.querySelector('.job-info-card')) {
        Logger.log('卡片已存在，跳过创建');
        return;
    }

    const lang = await getCurrentLanguage();
    const t = i18n[lang];

    // 解析预算信息
    let budget = t.unknown;

    // 尝试获取预算信息 - 方法1: 通过BudgetAmount标签
    const budgetElement = container.querySelector('[data-test="BudgetAmount"]');
    if (budgetElement) {
        Logger.log('使用data-test="BudgetAmount"获取预算');
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

    // 方法2: 通过固定价格图标查找
    if (budget === t.unknown) {
        Logger.log('使用data-cy="fixed-price"获取预算');
        const fixedPriceIcon = container.querySelector('[data-cy="fixed-price"]');
        if (fixedPriceIcon) {
            const budgetText = fixedPriceIcon.parentElement?.querySelector('strong')?.textContent?.trim();
            if (budgetText) {
                budget = budgetText;
            }
        }
    }


    // 检查工作类型
    let jobType = '';
    const hourlyElement = container.querySelector('.description');
    if (hourlyElement) {
        const descriptionText = hourlyElement.textContent?.trim() || '';
        // 检查是否为时薪制或固定价格
        if (descriptionText.includes('Hourly')) {
            jobType = 'hourly';
            if (budget !== t.unknown) {
                budget = `${budget}/${t.hourly}`;
            }
        } else if (descriptionText.includes('Fixed-price')) {
            jobType = 'fixed';
        }
    }

    Logger.log(`工作类型: ${jobType}, 预算: ${budget}`);

    // 使用标题查找投标信息，更加可靠
    let proposals = t.unknown;
    let lastViewed = t.unknown;
    let hires = '0';
    let interviewing = '0';
    let invitesSent = '0';
    let unansweredInvites = '0';

    // 查找所有客户活动项
    const clientActivitySection = container.querySelector('[data-test="ClientActivity"]');
    if (clientActivitySection) {
        Logger.log('使用title获取客户活动');
        // 获取所有活动项
        const activityItems = clientActivitySection.querySelectorAll('.ca-item');

        // 遍历所有活动项，根据标题提取值
        activityItems.forEach(item => {
            const titleElement = item.querySelector('.title');
            const valueElement = item.querySelector('.value');

            if (!titleElement || !valueElement) return;

            const titleText = titleElement.textContent?.trim() || '';
            const valueText = valueElement.textContent?.trim() || '';

            // 根据标题文本确定数据类型
            if (titleText.includes('Proposals')) {
                proposals = valueText;
            } else if (titleText.includes('Last viewed')) {
                lastViewed = valueText;
            } else if (titleText.includes('Hires')) {
                hires = valueText;
            } else if (titleText.includes('Interviewing')) {
                interviewing = valueText;
            } else if (titleText.includes('Invites sent')) {
                invitesSent = valueText;
            } else if (titleText.includes('Unanswered invites')) {
                unansweredInvites = valueText;
            }
        });
    }

    // 提取投标所需的Connects数量
    let connectsRequired = '';
    // 方法1: 通过text-light-on-muted类查找包含"Send a proposal for"文本的元素
    const proposalTextElement = container.querySelector('div[class*="text-light-on-muted"]');
    if (proposalTextElement) {
        const proposalText = proposalTextElement.textContent || '';

        // 尝试匹配"Send a proposal for: X Connects"格式
        let connectsMatch = proposalText.match(/Send a proposal for: (\d+) Connects/);
        if (connectsMatch && connectsMatch[1]) {
            connectsRequired = connectsMatch[1];
        }

        // 尝试匹配"Required Connects to submit a proposal: X"格式
        if (!connectsRequired) {
            connectsMatch = proposalText.match(/Required Connects to submit a proposal: (\d+)/);
            if (connectsMatch && connectsMatch[1]) {
                connectsRequired = connectsMatch[1];
            }
        }

        // 如果还是找不到，尝试在文本中查找任何数字+Connects的组合
        if (!connectsRequired) {
            connectsMatch = proposalText.match(/(\d+)[ ]?Connects/);
            if (connectsMatch && connectsMatch[1]) {
                connectsRequired = connectsMatch[1];
            }
        }
    }

    // 方法2: 如果上面的方法找不到，尝试查找data-test="ConnectsDesktop"元素
    if (!connectsRequired) {
        const connectsDesktop = container.querySelector('[data-test="ConnectsDesktop"]');
        if (connectsDesktop) {
            const connectsText = connectsDesktop.textContent || '';
            const connectsMatch = connectsText.match(/Required Connects to submit a proposal: (\d+)/);
            if (connectsMatch && connectsMatch[1]) {
                connectsRequired = connectsMatch[1].trim();
            }
        }
    }

    // 方法3: 查找所有strong元素
    if (!connectsRequired) {
        const allStrongs = container.querySelectorAll('strong');
        for (const el of allStrongs) {
            const text = el.textContent?.trim() || '';
            // 如果是纯数字 + " Connects" 格式
            if (/^\d+ Connects$/.test(text)) {
                connectsRequired = text.replace(' Connects', '');
                break;
            }
        }
    }

    // 方法4: 最后尝试匹配任何数字后跟Connects的span元素
    if (!connectsRequired) {
        const spans = container.querySelectorAll('span');
        for (const span of spans) {
            const text = span.textContent?.trim() || '';
            if (/^\d+$/.test(text) &&
                span.nextElementSibling &&
                span.nextElementSibling.textContent?.includes('Connect')) {
                connectsRequired = text;
                break;
            }
        }
    }

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
        hires,
        interviewing,
        invitesSent,
        unansweredInvites,  // 新增未回复邀请数
        connectsRequired,
        lastViewed,
        location: `${clientLocation} ${clientCity} ${clientTime}`.trim(),
        totalSpent,
        hireRate: `${hireRate}%`
    };

    // 检查是否所有重要信息都已获取
    if (budget === t.unknown && proposals === t.unknown && totalSpent === t.unknown) {
        Logger.log('重要信息未加载完成，将重试...');
        setTimeout(() => createInfoCard(container), 1000);
        return;
    }

    Logger.log('提取的工作信息:', jobInfo);

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
        width: 90%;
        margin: 0 auto;
    `;

    // 设置卡片内容
    card.innerHTML = `
        <div>
            <div style="display: flex; justify-content: flex-start; gap: 12px; margin-bottom: 12px; color: #14a800; font-weight: bold; font-size: 16px;">
                <span>&#128176; ${t.budget}: ${jobInfo.budget}</span>
                ${jobInfo.connectsRequired ? `<span style="margin-right: 12px; color: #6600cc;">${t.connectsRequired}: ${jobInfo.connectsRequired}</span>` : ''}
            </div>

            <div style="display: flex; justify-content: space-between; margin-bottom: 12px; color: #001e00;">
                <span style="font-weight: 500;">&#128202; ${t.proposals}:</span>
                <span>
                    <span style="margin-right: 12px; color: ${parseInt(jobInfo.hires) > 0 ? '#14a800' : '#001e00'};">${t.hires}: ${jobInfo.hires}</span>
                    <span style="margin-right: 12px;">${t.totalProposals}: ${jobInfo.proposals}</span>
                    <span style="margin-right: 12px;">${t.interviewing}: ${jobInfo.interviewing}</span>
                    <span style="margin-right: 12px;">${t.invitesSent}: ${jobInfo.invitesSent}</span>
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

    // 在插入卡片之前再次检查是否已存在
    if (!document.querySelector('.job-info-card')) {
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
}

// 检查slider的函数
const checkForSlider = debounce(() => {
    const sliders = document.querySelectorAll('.air3-slider-content[modaltitle="Job Details"]');

    // 检查slider是否真的存在
    if (sliders.length === 0) {
        if (isSliderOpen) {
            Logger.log("Slider已关闭，重置状态");
            handleSliderClose();
        }
        return;
    }

    // 如果slider已经打开且已经添加了卡片，不需要重复处理
    const existingCard = document.querySelector('.job-info-card');
    if (isSliderOpen && existingCard) {
        return;
    }

    Logger.log("找到slider!");
    isSliderOpen = true;  // 标记slider已打开
    // showNotification();

    // 只处理第一个找到的slider
    const slider = sliders[0];
    // 确保卡片只添加一次
    if (!document.querySelector('.job-info-card')) {
        // 延迟1秒后获取信息并创建卡片
        setTimeout(() => {
            Logger.log("开始获取工作信息...");
            // 再次检查是否已经存在卡片
            if (!document.querySelector('.job-info-card')) {
                createInfoCard(slider);
            }
        }, 1000);
    }
}, 500);

// 处理slider关闭的函数
function handleSliderClose() {
    Logger.log("Slider已关闭");
    isSliderOpen = false;  // 重置状态

    // 移除可能存在的旧卡片
    const oldCards = document.querySelectorAll('.job-info-card');
    oldCards.forEach(card => card.remove());
}

// 修改通知函数以支持多语言
async function showNotification() {
    const lang = await getCurrentLanguage();
    const t = i18n[lang].notification;

    Logger.log("准备显示通知");
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
            checkForSlider();
        }
    });

    observer.observe(document.body, observerConfig);
    Logger.log("Observer已启动");
}

// 初始化函数
function init() {
    Logger.log("Upwork Monitor 初始化");
    // 确保初始状态正确
    isSliderOpen = false;
    createObserver();
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
        Logger.log("页面变为可见，重新初始化observer");
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