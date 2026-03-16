/**
 * 파일 뷰어 페이지 E2E 테스트
 *
 * /view/[fileId] 페이지의 파일 조회, 비밀번호 인증, 미리보기 검증
 */
import { test, expect } from '@playwright/test';

test.describe('파일 뷰어 페이지', () => {
  test('존재하지 않는 fileId로 접속 시 오류가 표시되어야 함', async ({ page }) => {
    // API 모킹을 page.goto 전에 설정해야 함
    await page.route('**/api/files/nonexistent-file-id', async (route) => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: '파일을 찾을 수 없습니다.' }),
      });
    });

    await page.goto('/view/nonexistent-file-id');

    // 오류 메시지가 표시될 때까지 대기 (strict mode: 구체적 텍스트 사용)
    await expect(
      page.getByText('파일을 찾을 수 없습니다.')
    ).toBeVisible({ timeout: 10000 });
  });

  test('로딩 중 스피너가 표시되어야 함', async ({ page }) => {
    // API 응답 지연
    await page.route('**/api/files/**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: '파일을 찾을 수 없습니다.' }),
      });
    });

    await page.goto('/view/test-file-id');

    // 로딩 스피너(animate-spin) 확인
    const spinner = page.locator('.animate-spin');
    await expect(spinner).toBeVisible({ timeout: 3000 });
  });

  test('비밀번호 보호 파일 접근 시 비밀번호 입력 폼이 표시되어야 함', async ({ page }) => {
    // 비밀번호 보호 파일 API 모킹
    await page.route('**/api/files/protected-file', async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            fileId: 'protected-file',
            originalName: 'secret-image.png',
            contentType: 'image/png',
            contentLength: 1024000,
            hasPassword: true,
          }),
        });
      }
    });

    await page.goto('/view/protected-file');

    await expect(page.getByText('비밀번호 필요')).toBeVisible({ timeout: 10000 });
    await expect(page.getByPlaceholder('비밀번호 입력')).toBeVisible();
    await expect(page.getByText('secret-image.png')).toBeVisible();
  });

  test('이미지 파일이 미리보기로 표시되어야 함', async ({ page }) => {
    // 공개 이미지 파일 API 모킹
    await page.route('**/api/files/public-image', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          fileId: 'public-image',
          originalName: 'test-photo.jpg',
          contentType: 'image/jpeg',
          contentLength: 2048000,
          hasPassword: false,
          directUrl: 'https://example.com/test-photo.jpg',
        }),
      });
    });

    await page.goto('/view/public-image');

    // 파일명 표시
    await expect(page.getByText('test-photo.jpg')).toBeVisible({ timeout: 10000 });

    // 다운로드 버튼 표시
    await expect(page.getByText('다운로드')).toBeVisible();

    // img 요소 존재
    const img = page.locator('img[alt="test-photo.jpg"]');
    await expect(img).toBeVisible();
  });

  test('비디오 파일이 플레이어로 표시되어야 함', async ({ page }) => {
    await page.route('**/api/files/public-video', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          fileId: 'public-video',
          originalName: 'test-video.mp4',
          contentType: 'video/mp4',
          contentLength: 10485760,
          hasPassword: false,
          directUrl: 'https://example.com/test-video.mp4',
        }),
      });
    });

    await page.goto('/view/public-video');

    await expect(page.getByText('test-video.mp4')).toBeVisible({ timeout: 10000 });

    // video 요소 존재
    const video = page.locator('video');
    await expect(video).toBeVisible();
    await expect(video).toHaveAttribute('controls');
  });

  test('지원되지 않는 파일 형식은 다운로드 안내가 표시되어야 함', async ({ page }) => {
    await page.route('**/api/files/public-doc', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          fileId: 'public-doc',
          originalName: 'document.pdf',
          contentType: 'application/pdf',
          contentLength: 5242880,
          hasPassword: false,
          directUrl: 'https://example.com/document.pdf',
        }),
      });
    });

    await page.goto('/view/public-doc');

    await expect(page.getByText('document.pdf')).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByText('미리보기를 지원하지 않는 파일 형식입니다.')
    ).toBeVisible();
  });

  test('만료일이 표시되어야 함', async ({ page }) => {
    await page.route('**/api/files/expiring-file', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          fileId: 'expiring-file',
          originalName: 'temp-image.png',
          contentType: 'image/png',
          contentLength: 1024000,
          hasPassword: false,
          directUrl: 'https://example.com/temp-image.png',
          expiresAt: '2026-04-01T00:00:00.000Z',
        }),
      });
    });

    await page.goto('/view/expiring-file');

    await expect(page.getByText('temp-image.png')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/만료/)).toBeVisible();
  });

  test('잘못된 비밀번호 입력 시 오류가 표시되어야 함', async ({ page }) => {
    // API 모킹을 page.goto 전에 설정해야 함
    await page.route('**/api/files/pw-file', async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            fileId: 'pw-file',
            originalName: 'secret.png',
            contentType: 'image/png',
            contentLength: 1024,
            hasPassword: true,
          }),
        });
      } else if (method === 'POST') {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: '비밀번호가 일치하지 않습니다.' }),
        });
      }
    });

    await page.goto('/view/pw-file');

    await expect(page.getByPlaceholder('비밀번호 입력')).toBeVisible({ timeout: 10000 });

    const pwInput = page.getByPlaceholder('비밀번호 입력');
    await pwInput.click();
    await pwInput.fill('wrong-password');
    await expect(page.locator('button[type="submit"]')).toBeEnabled({ timeout: 5000 });
    await page.locator('button[type="submit"]').click();

    await expect(
      page.getByText('비밀번호가 일치하지 않습니다.')
    ).toBeVisible({ timeout: 15000 });
  });
});
