/**
 * i18n 번역 파일 무결성 테스트
 *
 * 11개 언어 파일의 구조 일관성과 값 유효성을 검증한다.
 */
import * as fs from 'fs';
import * as path from 'path';
import { locales, defaultLocale } from '@/i18n/config';

const MESSAGES_DIR = path.resolve(__dirname, '../../../messages');

/** 지원 언어 목록 */
const EXPECTED_LOCALES = ['en', 'ko', 'zh', 'es', 'ar', 'pt', 'id', 'fr', 'ja', 'ru', 'de'];

/** JSON 파일 로드 헬퍼 */
function loadMessages(locale: string): Record<string, unknown> {
  const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

/** 객체에서 모든 키 경로를 재귀적으로 추출 */
function getAllKeyPaths(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = [];
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...getAllKeyPaths(value as Record<string, unknown>, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys.sort();
}

/** 객체에서 빈 문자열 값의 키 경로를 재귀적으로 탐색 */
function findEmptyValues(obj: Record<string, unknown>, prefix = ''): string[] {
  const emptyKeys: string[] = [];
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      emptyKeys.push(...findEmptyValues(value as Record<string, unknown>, fullKey));
    } else if (value === '') {
      emptyKeys.push(fullKey);
    }
  }
  return emptyKeys;
}

describe('i18n 번역 파일 무결성', () => {
  // ─── 파일 존재 및 파싱 ──────────────────────────────────────
  it('11개 언어 파일이 모두 존재하고 JSON 파싱이 가능해야 한다', () => {
    for (const locale of EXPECTED_LOCALES) {
      const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
      expect(fs.existsSync(filePath)).toBe(true);

      // 파싱 에러 없이 객체를 반환해야 한다
      const messages = loadMessages(locale);
      expect(typeof messages).toBe('object');
      expect(messages).not.toBeNull();
    }
  });

  // ─── 최상위 키 일관성 ───────────────────────────────────────
  it('모든 언어 파일이 동일한 최상위 키를 보유해야 한다', () => {
    const referenceMessages = loadMessages('en');
    const referenceTopKeys = Object.keys(referenceMessages).sort();

    for (const locale of EXPECTED_LOCALES) {
      if (locale === 'en') continue;
      const messages = loadMessages(locale);
      const topKeys = Object.keys(messages).sort();

      expect(topKeys).toEqual(referenceTopKeys);
    }
  });

  // ─── 중첩 키 구조 동일성 ────────────────────────────────────
  it('모든 언어 파일의 중첩 키 구조가 동일해야 한다', () => {
    const referenceMessages = loadMessages('en');
    const referenceKeyPaths = getAllKeyPaths(referenceMessages);

    for (const locale of EXPECTED_LOCALES) {
      if (locale === 'en') continue;
      const messages = loadMessages(locale);
      const keyPaths = getAllKeyPaths(messages);

      // 누락 키 확인
      const missingKeys = referenceKeyPaths.filter((k) => !keyPaths.includes(k));
      const extraKeys = keyPaths.filter((k) => !referenceKeyPaths.includes(k));

      expect(missingKeys).toEqual([]);
      expect(extraKeys).toEqual([]);
    }
  });

  // ─── 빈 문자열 값 검사 ─────────────────────────────────────
  it('빈 문자열("") 값이 없어야 한다', () => {
    for (const locale of EXPECTED_LOCALES) {
      const messages = loadMessages(locale);
      const emptyKeys = findEmptyValues(messages);

      expect(emptyKeys).toEqual([]);
    }
  });

  // ─── i18n config 검증 ──────────────────────────────────────
  it('i18n config에 11개 locale이 정의되어 있어야 한다', () => {
    expect(locales).toHaveLength(11);

    for (const locale of EXPECTED_LOCALES) {
      expect(locales).toContain(locale);
    }
  });

  it('defaultLocale이 en이어야 한다', () => {
    expect(defaultLocale).toBe('en');
  });
});
