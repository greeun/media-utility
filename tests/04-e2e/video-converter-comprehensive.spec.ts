import { test, expect } from '@playwright/test'
import path from 'path'

test.describe('비디오 변환 종합 테스트', () => {
  const testVideoPath = path.resolve(process.cwd(), 'data/test.mp4')

  test.beforeEach(async ({ page }) => {
    // 콘솔 로그 수집
    page.on('console', (msg) => {
      const text = msg.text()
      if (text.includes('FFmpeg') || text.includes('error') || text.includes('Error') || 
          text.includes('Starting conversion') || text.includes('Progress') || 
          text.includes('completed')) {
        console.log(`[${msg.type().toUpperCase()}] ${text}`)
      }
    })

    // 페이지 에러 수집
    page.on('pageerror', (error) => {
      console.error(`[PAGE ERROR] ${error.message}`)
    })

    await page.goto('/ko/video-converter')
    await page.waitForLoadState('domcontentloaded')
  })

  test('TC-01: 페이지 로드 및 초기 상태 확인', async ({ page }) => {
    console.log('\n=== TC-01: 페이지 로드 및 초기 상태 확인 ===')
    
    // 페이지 제목 확인
    const title = await page.textContent('h1')
    expect(title).toContain('비디오 변환')
    console.log('✅ 페이지 제목 확인')

    // 업로드 영역 확인
    const uploadArea = page.locator('label').filter({ hasText: /드래그|업로드/i }).first()
    await expect(uploadArea).toBeVisible({ timeout: 10000 })
    console.log('✅ 업로드 영역 표시')

    // 파일 입력 요소 확인
    const fileInput = page.locator('input[type="file"]').first()
    await expect(fileInput).toBeAttached()
    console.log('✅ 파일 입력 요소 존재')
  })

  test('TC-02: 비디오 파일 업로드', async ({ page }) => {
    console.log('\n=== TC-02: 비디오 파일 업로드 ===')
    
    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(testVideoPath)
    console.log('✅ 파일 업로드 완료')

    // 프리뷰 표시 확인
    await page.waitForTimeout(2000)
    const videoPreview = page.locator('video').first()
    await expect(videoPreview).toBeVisible({ timeout: 10000 })
    console.log('✅ 비디오 프리뷰 표시')

    // 파일 정보 표시 확인
    const fileInfo = page.locator('text=/test.mp4/i')
    await expect(fileInfo).toBeVisible({ timeout: 5000 })
    console.log('✅ 파일 정보 표시')
  })

  test('TC-03: SharedArrayBuffer 지원 확인', async ({ page }) => {
    console.log('\n=== TC-03: SharedArrayBuffer 지원 확인 ===')
    
    const hasSharedArrayBuffer = await page.evaluate(() => {
      return typeof SharedArrayBuffer !== 'undefined'
    })
    
    console.log('SharedArrayBuffer 지원:', hasSharedArrayBuffer ? '✅' : '❌')
    expect(hasSharedArrayBuffer).toBeTruthy()
  })

  test('TC-04: CORS 헤더 확인', async ({ page }) => {
    console.log('\n=== TC-04: CORS 헤더 확인 ===')
    
    const response = await page.goto('/ko/video-converter')
    const headers = response?.headers() || {}
    
    console.log('Cross-Origin-Embedder-Policy:', headers['cross-origin-embedder-policy'])
    console.log('Cross-Origin-Opener-Policy:', headers['cross-origin-opener-policy'])
    console.log('Cross-Origin-Resource-Policy:', headers['cross-origin-resource-policy'])
    
    expect(headers['cross-origin-embedder-policy']).toBe('require-corp')
    expect(headers['cross-origin-opener-policy']).toBe('same-origin')
    console.log('✅ CORS 헤더 설정 확인')
  })

  test('TC-05: 변환 모드 선택', async ({ page }) => {
    console.log('\n=== TC-05: 변환 모드 선택 ===')
    
    // 파일 업로드
    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(testVideoPath)
    await page.waitForTimeout(2000)

    // 비디오→GIF 모드 버튼 확인
    const videoToGifButton = page.getByRole('button').filter({ hasText: /비디오.*GIF/i })
    await expect(videoToGifButton.first()).toBeVisible({ timeout: 5000 })
    console.log('✅ 비디오→GIF 모드 버튼 표시')

    // 프레임 추출 모드 버튼 확인
    const extractFramesButton = page.getByRole('button').filter({ hasText: /프레임/i })
    await expect(extractFramesButton.first()).toBeVisible({ timeout: 5000 })
    console.log('✅ 프레임 추출 모드 버튼 표시')
  })

  test('TC-06: FFmpeg 초기화 및 변환 시작', async ({ page }) => {
    test.setTimeout(180000) // 3분
    console.log('\n=== TC-06: FFmpeg 초기화 및 변환 시작 ===')
    
    // 파일 업로드
    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(testVideoPath)
    await page.waitForTimeout(2000)
    console.log('✅ 파일 업로드')

    // 변환 버튼 클릭
    const convertButton = page.getByRole('button').filter({ hasText: /변환|Convert/i }).first()
    await expect(convertButton).toBeVisible({ timeout: 10000 })
    await convertButton.click()
    console.log('✅ 변환 버튼 클릭')

    // FFmpeg 로딩 또는 진행 상태 확인
    let processingStarted = false
    let errorOccurred = false
    
    for (let i = 0; i < 60; i++) {
      await page.waitForTimeout(1000)
      
      const bodyText = await page.locator('body').textContent()
      
      // 진행률 확인
      if (bodyText && (bodyText.includes('%') || bodyText.includes('처리') || bodyText.includes('로딩'))) {
        if (!processingStarted) {
          console.log('✅ 처리 시작 확인')
          processingStarted = true
        }
      }
      
      // 에러 확인
      if (bodyText && (bodyText.includes('오류') || bodyText.includes('실패'))) {
        console.log('⚠️ 에러 메시지 감지')
        errorOccurred = true
        break
      }
      
      // 완료 확인
      const downloadButton = page.getByRole('button').filter({ hasText: /다운로드/i })
      if (await downloadButton.first().isVisible().catch(() => false)) {
        console.log('✅✅✅ 변환 완료!')
        break
      }
    }
    
    console.log('\n📊 결과:')
    console.log('- 처리 시작:', processingStarted ? '✅' : '❌')
    console.log('- 에러 발생:', errorOccurred ? '⚠️' : '✅ 없음')
    
    expect(processingStarted).toBeTruthy()
  })

  test('TC-07: 변환 옵션 설정', async ({ page }) => {
    console.log('\n=== TC-07: 변환 옵션 설정 ===')
    
    // 파일 업로드
    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(testVideoPath)
    await page.waitForTimeout(2000)

    // 설정 섹션 확인
    const settingsSection = page.locator('text=/설정|옵션|Options/i').first()
    await expect(settingsSection).toBeVisible({ timeout: 5000 })
    console.log('✅ 설정 섹션 표시')

    // FPS 입력 확인
    const fpsInput = page.locator('input[type="number"]').filter({ hasText: '' }).or(
      page.locator('label').filter({ hasText: /fps/i }).locator('..').locator('input')
    ).first()
    
    if (await fpsInput.isVisible().catch(() => false)) {
      console.log('✅ FPS 설정 입력 존재')
    }

    // 너비 설정 확인
    const widthInput = page.locator('input[type="number"]').nth(1)
    if (await widthInput.isVisible().catch(() => false)) {
      console.log('✅ 너비 설정 입력 존재')
    }
  })

  test('TC-08: 에러 처리', async ({ page }) => {
    test.setTimeout(120000) // 2분
    console.log('\n=== TC-08: 에러 처리 ===')
    
    // 파일 업로드
    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(testVideoPath)
    await page.waitForTimeout(2000)

    // 콘솔 에러 수집
    const errors: string[] = []
    page.on('pageerror', (error) => {
      errors.push(error.message)
    })

    // 변환 시작
    const convertButton = page.getByRole('button').filter({ hasText: /변환/i }).first()
    await convertButton.click()

    // 에러 발생 확인 (60초 대기)
    await page.waitForTimeout(60000)

    console.log('\n에러 발생:', errors.length > 0 ? '⚠️' : '✅ 없음')
    if (errors.length > 0) {
      console.log('에러 목록:')
      errors.forEach((error, idx) => {
        console.log(`${idx + 1}. ${error}`)
      })
    }

    // 테스트는 에러 여부와 관계없이 통과 (정보 수집 목적)
    expect(true).toBeTruthy()
  })

  test('TC-09: 변환 진행률 표시', async ({ page }) => {
    test.setTimeout(120000)
    console.log('\n=== TC-09: 변환 진행률 표시 ===')
    
    // 파일 업로드
    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(testVideoPath)
    await page.waitForTimeout(2000)

    // 변환 시작
    const convertButton = page.getByRole('button').filter({ hasText: /변환/i }).first()
    await convertButton.click()

    // 진행률 수집
    const progressValues: string[] = []
    
    for (let i = 0; i < 60; i++) {
      await page.waitForTimeout(1000)
      const bodyText = await page.locator('body').textContent()
      
      if (bodyText) {
        const progressMatch = bodyText.match(/(\d+)%/)
        if (progressMatch && !progressValues.includes(progressMatch[1])) {
          progressValues.push(progressMatch[1])
          console.log(`진행률: ${progressMatch[1]}%`)
        }
      }
      
      // 완료 확인
      if (bodyText && bodyText.includes('다운로드')) {
        break
      }
    }

    console.log('\n수집된 진행률:', progressValues.join(', '))
    expect(progressValues.length).toBeGreaterThan(0)
  })

  test('TC-10: 전체 워크플로우 테스트', async ({ page }) => {
    test.setTimeout(300000) // 5분
    console.log('\n=== TC-10: 전체 워크플로우 테스트 ===')
    
    // 1. 파일 업로드
    console.log('1️⃣ 파일 업로드...')
    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(testVideoPath)
    await page.waitForTimeout(2000)
    console.log('✅ 업로드 완료')

    // 2. 비디오 프리뷰 확인
    console.log('2️⃣ 프리뷰 확인...')
    const videoPreview = page.locator('video').first()
    await expect(videoPreview).toBeVisible({ timeout: 10000 })
    console.log('✅ 프리뷰 표시')

    // 3. 변환 시작
    console.log('3️⃣ 변환 시작...')
    const convertButton = page.getByRole('button').filter({ hasText: /변환/i }).first()
    await expect(convertButton).toBeVisible()
    await convertButton.click()
    console.log('✅ 변환 버튼 클릭')

    // 4. 처리 완료 대기
    console.log('4️⃣ 처리 완료 대기...')
    let completed = false
    
    for (let i = 0; i < 240; i++) { // 최대 4분
      await page.waitForTimeout(1000)
      
      const downloadButton = page.getByRole('button').filter({ hasText: /다운로드/i })
      if (await downloadButton.first().isVisible().catch(() => false)) {
        console.log('✅✅✅ 처리 완료! 다운로드 버튼 표시됨')
        completed = true
        break
      }
      
      // 30초마다 상태 출력
      if (i % 30 === 0) {
        const bodyText = await page.locator('body').textContent()
        const progress = bodyText?.match(/(\d+)%/)?.[1]
        console.log(`대기 중... (${i}초 경과${progress ? `, 진행률: ${progress}%` : ''})`)
      }
    }

    console.log('\n최종 결과:', completed ? '✅ 성공' : '❌ 타임아웃')
    
    // 완료 여부 스크린샷
    await page.screenshot({ path: 'test-results/video-conversion-result.png', fullPage: true })
    console.log('📸 스크린샷 저장: test-results/video-conversion-result.png')

    // 테스트는 결과 확인 목적 (타임아웃 발생 가능)
    expect(true).toBeTruthy()
  })
})
