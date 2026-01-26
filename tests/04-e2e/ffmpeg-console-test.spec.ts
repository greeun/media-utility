import { test, expect } from '@playwright/test'

test.describe('FFmpeg WASM 콘솔 로그 확인', () => {
  test('브라우저 콘솔에서 FFmpeg 초기화 및 실행 로그 확인', async ({ page }) => {
    test.setTimeout(180000) // 3분 타임아웃
    
    // 콘솔 로그 수집
    const logs: Array<{ type: string; text: string }> = []
    
    page.on('console', (msg) => {
      const text = msg.text()
      const type = msg.type()
      logs.push({ type, text })
      
      // FFmpeg 관련 로그만 출력
      if (text.includes('FFmpeg') || text.includes('ffmpeg') || text.includes('WASM') || 
          text.includes('core') || text.includes('wasm') || text.includes('[FFmpeg]')) {
        console.log(`[${type.toUpperCase()}] ${text}`)
      }
    })
    
    // 페이지 에러 수집
    page.on('pageerror', (error) => {
      console.log(`[PAGE ERROR] ${error.message}`)
      logs.push({ type: 'error', text: error.message })
    })
    
    // 비디오 변환 페이지로 이동
    await page.goto('/ko/video-converter')
    await page.waitForLoadState('domcontentloaded')
    
    // 파일 업로드
    const testVideoPath = require('path').resolve(process.cwd(), 'data/test.mp4')
    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(testVideoPath)
    await page.waitForTimeout(2000)
    
    // 비디오 프리뷰 확인
    const videoPreview = page.locator('video').first()
    await expect(videoPreview).toBeVisible({ timeout: 15000 })
    
    // 변환 시작 전 로그 확인
    console.log('\n📋 변환 시작 전 로그:')
    const beforeLogs = logs.filter(l => 
      l.text.includes('FFmpeg') || l.text.includes('ffmpeg') || 
      l.text.includes('WASM') || l.text.includes('core')
    )
    console.log('FFmpeg 관련 로그:', beforeLogs.length > 0 ? beforeLogs.map(l => l.text).join('\n') : '없음')
    
    // 변환 버튼 클릭
    const convertButton = page.getByRole('button').filter({ hasText: /변환|Convert/i }).first()
    await convertButton.click()
    
    // FFmpeg 로딩 및 변환 대기 (최대 2분)
    let ffmpegInitialized = false
    let conversionStarted = false
    let conversionCompleted = false
    
    for (let i = 0; i < 120; i++) {
      await page.waitForTimeout(1000)
      
      // 최신 로그 확인
      const recentLogs = logs.slice(-20)
      const ffmpegLogs = recentLogs.filter(l => 
        l.text.includes('FFmpeg') || l.text.includes('ffmpeg') || 
        l.text.includes('WASM') || l.text.includes('core') ||
        l.text.includes('[FFmpeg]') || l.text.includes('ffmpeg-core')
      )
      
      if (ffmpegLogs.length > 0 && !ffmpegInitialized) {
        console.log('\n✅ FFmpeg 초기화 로그 발견:')
        ffmpegLogs.forEach(log => console.log(`  [${log.type}] ${log.text.substring(0, 200)}`))
        ffmpegInitialized = true
      }
      
      // 진행률 확인
      const progressText = await page.locator('body').textContent()
      if (progressText && progressText.includes('%')) {
        if (!conversionStarted) {
          const progress = progressText.match(/\d+%/)?.[0]
          console.log(`\n🔄 변환 진행 중: ${progress}`)
          conversionStarted = true
        }
      }
      
      // 결과 확인
      const resultImage = page.locator('img').filter({ hasNot: page.locator('video') }).first()
      if (await resultImage.isVisible().catch(() => false)) {
        console.log('\n✅✅✅ 변환 완료!')
        conversionCompleted = true
        break
      }
    }
    
    // 최종 로그 분석
    console.log('\n📊 최종 분석:')
    console.log('- FFmpeg 초기화:', ffmpegInitialized ? '✅' : '❌')
    console.log('- 변환 시작:', conversionStarted ? '✅' : '❌')
    console.log('- 변환 완료:', conversionCompleted ? '✅' : '❌')
    
    // 모든 FFmpeg 관련 로그 출력
    const allFFmpegLogs = logs.filter(l => 
      l.text.includes('FFmpeg') || l.text.includes('ffmpeg') || 
      l.text.includes('WASM') || l.text.includes('core') ||
      l.text.includes('[FFmpeg]')
    )
    
    if (allFFmpegLogs.length > 0) {
      console.log('\n📝 전체 FFmpeg 관련 로그:')
      allFFmpegLogs.forEach((log, idx) => {
        console.log(`${idx + 1}. [${log.type}] ${log.text.substring(0, 300)}`)
      })
    } else {
      console.log('\n⚠️ FFmpeg 관련 로그를 찾지 못했습니다.')
      console.log('전체 로그 샘플 (최근 10개):')
      logs.slice(-10).forEach((log, idx) => {
        console.log(`${idx + 1}. [${log.type}] ${log.text.substring(0, 100)}`)
      })
    }
    
    // 최소한 진행률이 표시되었는지 확인
    expect(conversionStarted || ffmpegInitialized).toBeTruthy()
  })
})
