import type { LanguageResources, SupportedLanguage } from "./types";
import { Storage } from "@plasmohq/storage";

// 导入所有语言资源
import { zh } from "./zh";
import { en } from "./en";
import { es } from "./es";
import { hi } from "./hi";
import { pt } from "./pt";
import { bn } from "./bn";
import { uk } from "./uk";
import { tl } from "./tl";
import { ru } from "./ru";
import { ar } from "./ar";
import { ja } from "./ja";
import { ko } from "./ko";
import { de } from "./de";
import { fr } from "./fr";

// 语言资源映射
export const languages: Record<SupportedLanguage, LanguageResources> = {
  zh, en, es, hi, pt, bn, uk, tl, ru, ar, ja, ko, de, fr
};

// 存储实例
const storage = new Storage();

/**
 * 获取当前语言设置
 * @returns Promise<string> 当前语言代码
 */
export async function getCurrentLanguage(): Promise<SupportedLanguage> {
  const lang = await storage.get("upwork-language") as SupportedLanguage;
  // 如果没有设置语言，默认使用英文
  return lang || "en";
}

/**
 * 检查语言是否受支持
 * @param lang 语言代码
 * @returns boolean
 */
export function isSupportedLanguage(lang: string): lang is SupportedLanguage {
  return lang in languages;
}

/**
 * 获取语言资源
 * @param lang 语言代码，可选，不传则使用当前设置的语言
 * @returns LanguageResources 语言资源对象
 */
export async function getLanguageResources(lang?: SupportedLanguage): Promise<LanguageResources> {
  const currentLang = lang || await getCurrentLanguage();
  // 如果不支持该语言，回退到英文
  return isSupportedLanguage(currentLang) ? languages[currentLang] : languages["en"];
}

/**
 * 设置语言
 * @param lang 语言代码
 */
export async function setLanguage(lang: SupportedLanguage): Promise<void> {
  await storage.set("upwork-language", lang);
}

/**
 * 获取翻译文本（便捷函数）
 * @param key 翻译键名
 * @param lang 可选的语言代码
 * @returns Promise<string> 翻译文本
 */
export async function t(key: keyof LanguageResources, lang?: SupportedLanguage): Promise<string> {
  const resources = await getLanguageResources(lang);
  return resources[key];
}