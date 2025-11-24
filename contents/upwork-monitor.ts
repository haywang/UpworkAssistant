import type { PlasmoCSConfig } from "plasmo"
import { Logger } from "./utils/logger"
import { getLanguageResources } from "./i18n"

export const config: PlasmoCSConfig = {
  matches: ["https://www.upwork.com/*"],
  all_frames: true
}

let sliderObserver: MutationObserver | null = null;  // 第一层：监听 slider 出现
let dataObserver: MutationObserver | null = null;    // 第二层：监听 slider 内数据加载
let isSliderOpen = false;

// 数据加载超时时间（毫秒）
const DATA_LOAD_TIMEOUT = 5000;

// 语言配置
const i18n = {
  zh: {
    budget: "预算",
    proposals: "投标情况",
    totalProposals: "总数",
    interviewing: "面试中",
    invitesSent: "已邀请",
    unansweredInvites: "未回复邀请",
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
    unansweredInvites: "Unanswered invites",
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
  },
  // 第一优先级语言
  es: {
    budget: "Presupuesto",
    proposals: "Propuestas",
    totalProposals: "Total",
    interviewing: "Entrevistando",
    invitesSent: "Invitaciones enviadas",
    unansweredInvites: "Invitaciones sin respuesta",
    connectsRequired: "Connects",
    hires: "Contratos",
    clientInfo: "Información del cliente",
    totalSpent: "Total gastado",
    hireRate: "Tasa de contratación",
    lastViewed: "Última vista",
    hourly: "hora",
    unknown: "Desconocido",
    notification: {
      title: "Upwork Assistant",
      body: "¡Nuevos detalles del trabajo abiertos!"
    }
  },
  hi: {
    budget: "बजट",
    proposals: "प्रस्ताव",
    totalProposals: "कुल",
    interviewing: "साक्षार्कार",
    invitesSent: "निमंत्रण भेजे गए",
    unansweredInvites: "उत्तर न दिए गए निमंत्रण",
    connectsRequired: "Connects",
    hires: "नियुक्तियाँ",
    clientInfo: "ग्राहक जानकारी",
    totalSpent: "कुल खर्च",
    hireRate: "नियुक्ति दर",
    lastViewed: "अंतिम दृश्य",
    hourly: "घंटा",
    unknown: "अज्ञात",
    notification: {
      title: "Upwork Assistant",
      body: "नए कार्य विवरण खोले गए!"
    }
  },
  pt: {
    budget: "Orçamento",
    proposals: "Propostas",
    totalProposals: "Total",
    interviewing: "Entrevistando",
    invitesSent: "Convites enviados",
    unansweredInvites: "Convites não respondidos",
    connectsRequired: "Connects",
    hires: "Contratações",
    clientInfo: "Informações do cliente",
    totalSpent: "Total gasto",
    hireRate: "Taxa de contratação",
    lastViewed: "Última visualização",
    hourly: "hora",
    unknown: "Desconhecido",
    notification: {
      title: "Upwork Assistant",
      body: "Novos detalhes do trabalho abertos!"
    }
  },
  bn: {
    budget: "বাজেট",
    proposals: "প্রস্তাব",
    totalProposals: "মোট",
    interviewing: "সাক্ষাৎকার",
    invitesSent: "আমন্ত্রণ পাঠানো হয়েছে",
    unansweredInvites: "উত্তরহীন আমন্ত্রণ",
    connectsRequired: "Connects",
    hires: "নিয়োগ",
    clientInfo: "ক্লায়েন্ট তথ্য",
    totalSpent: "মোট ব্যয়",
    hireRate: "নিয়োগের হার",
    lastViewed: "সর্বশেষ দেখা",
    hourly: "ঘন্টা",
    unknown: "অজানা",
    notification: {
      title: "Upwork Assistant",
      body: "নতুন কাজের বিবরণ খোলা হয়েছে!"
    }
  },
  // 第二优先级语言
  uk: {
    budget: "Бюджет",
    proposals: "Пропозиції",
    totalProposals: "Всього",
    interviewing: "Співбесіда",
    invitesSent: "Запрошення надіслано",
    unansweredInvites: "Запрошення без відповіді",
    connectsRequired: "Connects",
    hires: "Найми",
    clientInfo: "Інформація про клієнта",
    totalSpent: "Загальна сума",
    hireRate: "Рівень найму",
    lastViewed: "Останній перегляд",
    hourly: "година",
    unknown: "Невідомо",
    notification: {
      title: "Upwork Assistant",
      body: "Нові деталі роботи відкрито!"
    }
  },
  tl: {
    budget: "Badyet",
    proposals: "Mga panukla",
    totalProposals: "Kabuuan",
    interviewing: "Panayam",
    invitesSent: "Mga imbitasyon na ipinadala",
    unansweredInvites: "Mga imbitasyon walang sagot",
    connectsRequired: "Connects",
    hires: "Mga hire",
    clientInfo: "Impormasyon ng kliyente",
    totalSpent: "Kabuuang gastusin",
    hireRate: "Rate ng pag-hire",
    lastViewed: "Huling tingin",
    hourly: "oras",
    unknown: "Hindi alam",
    notification: {
      title: "Upwork Assistant",
      body: "Mga bagong detalye ng trabaho ay binuksan!"
    }
  },
  ru: {
    budget: "Бюджет",
    proposals: "Предложения",
    totalProposals: "Всего",
    interviewing: "Собеседование",
    invitesSent: "Приглашения отправлены",
    unansweredInvites: "Приглашения без ответа",
    connectsRequired: "Connects",
    hires: "Наймы",
    clientInfo: "Информация о клиенте",
    totalSpent: "Всего потрачено",
    hireRate: "Рейтинг найма",
    lastViewed: "Последний просмотр",
    hourly: "час",
    unknown: "Неизвестно",
    notification: {
      title: "Upwork Assistant",
      body: "Новые детали работы открыты!"
    }
  },
  ar: {
    budget: "الميزانية",
    proposals: "الاقتراحات",
    totalProposals: "المجموع",
    interviewing: "المقابلة",
    invitesSent: "الدعوات المرسلة",
    unansweredInvites: "الدعوات без ответа",
    connectsRequired: "Connects",
    hires: "التوظيف",
    clientInfo: "معلومات العميل",
    totalSpent: "إجمالي الإنفاق",
    hireRate: "معدل التوظيف",
    lastViewed: "آخر مشاهدة",
    hourly: "ساعة",
    unknown: "غير معروف",
    notification: {
      title: "Upwork Assistant",
      body: "تم فتح تفاصيل وظيفة جديدة!"
    }
  },
  // 第三优先级语言
  ja: {
    budget: "予算",
    proposals: "提案",
    totalProposals: "合計",
    interviewing: "面接中",
    invitesSent: "招待送信済み",
    unansweredInvites: "未返信の招待",
    connectsRequired: "Connects",
    hires: "採用",
    clientInfo: "クライアント情報",
    totalSpent: "総支出額",
    hireRate: "採用率",
    lastViewed: "最終閲覧",
    hourly: "時間",
    unknown: "不明",
    notification: {
      title: "Upwork Assistant",
      body: "新しい仕事詳細が開かれました！"
    }
  },
  ko: {
    budget: "예산",
    proposals: "제안",
    totalProposals: "총계",
    interviewing: "면접 중",
    invitesSent: "초대장 전송됨",
    unansweredInvites: "답변 없는 초대",
    connectsRequired: "Connects",
    hires: "채용",
    clientInfo: "클라이언트 정보",
    totalSpent: "총 지출액",
    hireRate: "채용률",
    lastViewed: "마지막 조회",
    hourly: "시간",
    unknown: "알 수 없음",
    notification: {
      title: "Upwork Assistant",
      body: "새로운 작업 세부 정보가 열렸습니다!"
    }
  },
  de: {
    budget: "Budget",
    proposals: "Vorschläge",
    totalProposals: "Gesamt",
    interviewing: "Im Gespräch",
    invitesSent: "Einladungen gesendet",
    unansweredInvites: "Unbeantwortete Einladungen",
    connectsRequired: "Connects",
    hires: "Einstellungen",
    clientInfo: "Kundeninformationen",
    totalSpent: "Gesamtausgaben",
    hireRate: "Einstellungsrate",
    lastViewed: "Zuletzt angesehen",
    hourly: "Stunde",
    unknown: "Unbekannt",
    notification: {
      title: "Upwork Assistant",
      body: "Neue Job-Details geöffnet!"
    }
  },
  fr: {
    budget: "Budget",
    proposals: "Propositions",
    totalProposals: "Total",
    interviewing: "Entretien",
    invitesSent: "Invitations envoyées",
    unansweredInvites: "Invitations sans réponse",
    connectsRequired: "Connects",
    hires: "Embauches",
    clientInfo: "Informations client",
    totalSpent: "Dépenses totales",
    hireRate: "Taux d'embauche",
    lastViewed: "Dernière consultation",
    hourly: "heure",
    unknown: "Inconnu",
    notification: {
      title: "Upwork Assistant",
      body: "Nouveaux détails de l'emploi ouverts!"
    }
  }
};


// 创建信息卡片
async function createInfoCard(container: Element) {
    // 再次检查是否已经存在卡片
    if (document.querySelector('.job-info-card')) {
        Logger.log('卡片已存在，跳过创建');
        return;
    }

    // 获取当前语言资源
    const t = await getLanguageResources();

    // 获取简短版本文本，如果没有则使用完整版本
    const s = t.short || t;

    // 解析预算信息
    let budget = t.unknown;

    // 尝试获取预算信息 - 方法1: 通过BudgetAmount标签
    const budgetElement = container.querySelector('[data-test="BudgetAmount"]');
    if (budgetElement) {
        // Logger.log('使用data-test="BudgetAmount"获取预算');
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
        // Logger.log('使用data-cy="fixed-price"获取预算');
        const fixedPriceIcon = container.querySelector('[data-cy="fixed-price"]');
        if (fixedPriceIcon) {
            const budgetText = fixedPriceIcon.parentElement?.querySelector('strong')?.textContent?.trim();
            if (budgetText) {
                budget = budgetText;
            }
        }
    }

    // 方法3: 通过时薪图标查找 (data-cy="clock-timelog")
    if (budget === t.unknown) {
        const hourlyIcon = container.querySelector('[data-cy="clock-timelog"]');
        if (hourlyIcon) {
            const parentLi = hourlyIcon.closest('li');
            const strongElements = parentLi?.querySelectorAll('strong');
            if (strongElements && strongElements.length >= 2) {
                const minRate = strongElements[0]?.textContent?.trim();
                const maxRate = strongElements[1]?.textContent?.trim();
                budget = `${minRate} - ${maxRate}`;
            } else if (strongElements && strongElements.length === 1) {
                budget = strongElements[0]?.textContent?.trim() || t.unknown;
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
    let clientActivityItems = container.querySelector('.client-activity-items');
    Logger.log('clientActivityItems', clientActivityItems);

    // 获取所有活动项
    const activityItems = clientActivityItems?.querySelectorAll('.ca-item') || [];
    Logger.log('activityItems', activityItems);

    // 遍历所有活动项，根据标题提取值
    activityItems.length > 0 && activityItems.forEach(item => {
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

    // 如果没有找到任何活动项，记录警告
    if (activityItems.length === 0) {
        Logger.warn('未找到任何客户活动项');
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
                <span style="font-weight: 500;">&#128202; ${s.proposals}:</span>
                <span>
                    <span style="margin-right: 12px; color: ${parseInt(jobInfo.hires) > 0 ? '#14a800' : '#001e00'};">${s.hires}: ${jobInfo.hires}</span>
                    <span style="margin-right: 12px;">${s.totalProposals}: ${jobInfo.proposals}</span>
                    <span style="margin-right: 12px;">${s.interviewing}: ${jobInfo.interviewing}</span>
                    <span style="margin-right: 12px;">${s.invitesSent}: ${jobInfo.invitesSent}</span>
                    <span style="margin-right: 12px;">${s.unansweredInvites}: ${jobInfo.unansweredInvites}</span>
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

// 检查关键数据是否已加载
function isDataReady(slider: Element): boolean {
    const hasActivity = slider.querySelector('.client-activity-items');
    const hasBudget = slider.querySelector('[data-cy="clock-timelog"], [data-cy="fixed-price"], [data-test="BudgetAmount"]');
    return !!(hasActivity && hasBudget);
}

// 第二层：监听 slider 内部数据加载
function waitForData(slider: Element) {
    // 清理之前的数据观察者
    if (dataObserver) {
        dataObserver.disconnect();
        dataObserver = null;
    }

    // 如果数据已经就绪，直接创建卡片
    if (isDataReady(slider)) {
        Logger.log("数据已就绪，立即创建卡片");
        if (!document.querySelector('.job-info-card')) {
            createInfoCard(slider);
        }
        return;
    }

    Logger.log("等待数据加载...");

    // 设置超时保护
    const timeoutId = setTimeout(() => {
        Logger.log("数据加载超时，强制创建卡片");
        if (dataObserver) {
            dataObserver.disconnect();
            dataObserver = null;
        }
        if (!document.querySelector('.job-info-card')) {
            createInfoCard(slider);
        }
    }, DATA_LOAD_TIMEOUT);

    // 创建数据观察者，监听 slider 内部变化
    dataObserver = new MutationObserver(() => {
        if (isDataReady(slider)) {
            Logger.log("数据加载完成");
            clearTimeout(timeoutId);
            dataObserver?.disconnect();
            dataObserver = null;
            if (!document.querySelector('.job-info-card')) {
                createInfoCard(slider);
            }
        }
    });

    dataObserver.observe(slider, {
        childList: true,
        subtree: true
    });
}

// 处理 slider 打开
function handleSliderOpen(slider: Element) {
    if (isSliderOpen && document.querySelector('.job-info-card')) {
        return;
    }

    Logger.log("找到 slider!");
    isSliderOpen = true;
    waitForData(slider);
}

// 处理 slider 关闭
function handleSliderClose() {
    Logger.log("Slider 已关闭");
    isSliderOpen = false;

    // 清理数据观察者
    if (dataObserver) {
        dataObserver.disconnect();
        dataObserver = null;
    }

    // 移除旧卡片
    const oldCards = document.querySelectorAll('.job-info-card');
    oldCards.forEach(card => card.remove());
}

// 第一层：监听 slider 出现/消失
function createSliderObserver() {
    if (sliderObserver) {
        sliderObserver.disconnect();
    }

    sliderObserver = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.type !== 'childList') continue;

            // 检查是否有 slider 被添加
            for (const node of mutation.addedNodes) {
                if (!(node instanceof Element)) continue;

                const slider = node.matches('.air3-slider-content[modaltitle="Job Details"]')
                    ? node
                    : node.querySelector('.air3-slider-content[modaltitle="Job Details"]');

                if (slider) {
                    handleSliderOpen(slider);
                    return;
                }
            }

            // 检查是否有 slider 被移除
            for (const node of mutation.removedNodes) {
                if (!(node instanceof Element)) continue;

                const wasSlider = node.matches('.air3-slider-content[modaltitle="Job Details"]')
                    || node.querySelector('.air3-slider-content[modaltitle="Job Details"]');

                if (wasSlider && isSliderOpen) {
                    handleSliderClose();
                    return;
                }
            }
        }
    });

    sliderObserver.observe(document.body, {
        childList: true,
        subtree: true
    });

    Logger.log("Slider Observer 已启动");

    // 检查当前是否已有 slider
    const existingSlider = document.querySelector('.air3-slider-content[modaltitle="Job Details"]');
    if (existingSlider) {
        handleSliderOpen(existingSlider);
    }
}

// 初始化函数
function init() {
    Logger.log("Upwork Monitor 初始化");
    // 确保初始状态正确
    isSliderOpen = false;
    createSliderObserver();
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

// 确保在页面卸载时清理 observer
window.addEventListener('unload', () => {
    if (sliderObserver) {
        sliderObserver.disconnect();
        sliderObserver = null;
    }
    if (dataObserver) {
        dataObserver.disconnect();
        dataObserver = null;
    }
});