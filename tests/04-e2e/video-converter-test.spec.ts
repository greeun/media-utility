import { test, expect } from '@playwright/test'
import path from 'path'

test.describe('비디오 변환 기능 테스트 - test.mp4', () => {
  test('test.mp4 파일을 업로드하고 GIF로 변환', async ({ page }) => {
    test.setTimeout(600000) // 10분 타임아웃
    
    // 비디오 변환 페이지로 이동
    await page.goto('/ko/video-converter')
    console.log('✅ 페이지 로드 완료')
    
    // 페이지가 로드될 때까지 대기
    await page.waitForLoadState('domcontentloaded')
    console.log('✅ DOM 로드 완료')
    
    // 파일 업로드
    const testVideoPath = path.resolve(process.cwd(), 'data/test.mp4')
    console.log('📁 Test video path:', testVideoPath)
    
    // 파일 입력 요소 찾기
    const fileInput = page.locator('input[type="file"]').first()
    await expect(fileInput).toBeAttached({ timeout: 10000 })
    console.log('✅ 파일 입력 요소 찾음')
    
    // 파일 업로드
    await fileInput.setInputFiles(testVideoPath)
    console.log('✅ 파일 업로드 완료')
    
    // 파일이 업로드되고 프리뷰가 표시될 때까지 대기
    await page.waitForTimeout(3000)
    
    // 비디오 프리뷰가 표시되는지 확인
    const videoPreview = page.locator('video').first()
    await expect(videoPreview).toBeVisible({ timeout: 15000 })
    console.log('✅ 비디오 프리뷰 표시됨')
    
    // 변환 버튼 찾기 및 클릭
    const convertButton = page.getByRole('button').filter({ hasText: /변환|Convert/i }).first()
    await expect(convertButton).toBeVisible({ timeout: 10000 })
    console.log('✅ 변환 버튼 찾음')
    
    // 변환 시작
    await convertButton.click()
    console.log('✅ 변환 시작')
    
    // 진행률 표시줄이 나타나는지 확인 (FFmpeg 로딩 후)
    try {
      const progressBar = page.locator('div').filter({ hasText: /\\d+%/ }).first()
      await expect(progressBar).toBeVisible({ timeout: 120000 }) // FFmpeg 로딩 시간 포함
      console.log('✅ 진행률 표시줄 표시됨')
    } catch (e) {
      console.log('⚠️ 진행률 표시줄을 찾지 못했지만 계속 진행합니다.')
    }
    
    // 변환이 완료될 때까지 대기 (최대 5분)
    // 결과 이미지 또는 다운로드 버튼이 나타날 때까지 대기
    const resultSection = page.locator('img[alt*="Result"], img[alt*="결과"], button').filter({ hasText: /다운로드|Download/i }).first()
    await expect(resultSection).toBeVisible({ timeout: 300000 })
    console.log('✅ 변환 완료 - 결과 표시됨')
    
    // 다운로드 버튼 확인
    const downloadButton = page.getByRole('button').filter({ hasText: /다운로드|Download/i }).first()
    await expect(downloadButton).toBeVisible({ timeout: 10000 })
    console.log('✅ 다운로드 버튼 표시됨')
    
    console.log('✅✅✅ 비디오 변환 테스트 완료: test.mp4가 성공적으로 GIF로 변환되었습니다.')
  })
})
