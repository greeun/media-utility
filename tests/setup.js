/**
 * Jest Setup File for Media Utility
 *
 * 모든 테스트에서 사용되는 전역 mock 및 환경 설정
 */

require('@testing-library/jest-dom')

// ============================================================================
// Browser API Mocks (jsdom 환경에서만)
// ============================================================================

const isJsdom = typeof window !== 'undefined'

if (isJsdom) {
  /**
   * URL.createObjectURL / revokeObjectURL Mock
   */
  global.URL.createObjectURL = jest.fn(() => 'blob:mock-url')
  global.URL.revokeObjectURL = jest.fn()

  /**
   * FileReader Mock
   */
  global.FileReader = class {
    constructor() {
      this.readyState = 0
      this.result = null
      this.error = null
    }

    readAsDataURL(blob) {
      this.readyState = 2
      this.result = 'data:image/png;base64,mockBase64Data'
      setTimeout(() => this.onload?.({ target: this }), 0)
    }

    readAsArrayBuffer(blob) {
      this.readyState = 2
      this.result = new ArrayBuffer(8)
      setTimeout(() => this.onload?.({ target: this }), 0)
    }

    readAsText(blob) {
      this.readyState = 2
      this.result = 'mock text content'
      setTimeout(() => this.onload?.({ target: this }), 0)
    }
  }

  /**
   * Canvas Mock
   */
  HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
    drawImage: jest.fn(),
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    putImageData: jest.fn(),
    getImageData: jest.fn(() => ({
      data: new Uint8ClampedArray(4),
      width: 100,
      height: 100,
    })),
    createImageData: jest.fn(),
    scale: jest.fn(),
    rotate: jest.fn(),
    translate: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    beginPath: jest.fn(),
    closePath: jest.fn(),
    stroke: jest.fn(),
    fill: jest.fn(),
    arc: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    measureText: jest.fn(() => ({ width: 0 })),
    fillText: jest.fn(),
    canvas: {
      width: 100,
      height: 100,
    },
  }))

  HTMLCanvasElement.prototype.toBlob = jest.fn((callback, type, quality) => {
    callback(new Blob(['mock'], { type: type || 'image/png' }))
  })

  HTMLCanvasElement.prototype.toDataURL = jest.fn(() => 'data:image/png;base64,mockDataURL')

  /**
   * Image Mock
   */
  global.Image = class {
    constructor() {
      this.width = 100
      this.height = 100
      setTimeout(() => this.onload?.(), 0)
    }
  }

  /**
   * Worker Mock (gif.js 등에서 사용)
   */
  global.Worker = class {
    constructor(url) {
      this.url = url
    }
    postMessage(data) {
      setTimeout(() => this.onmessage?.({ data: {} }), 0)
    }
    terminate() {}
  }

  /**
   * Blob Mock 확장
   */
  if (global.Blob.prototype.arrayBuffer === undefined) {
    global.Blob.prototype.arrayBuffer = jest.fn(() => Promise.resolve(new ArrayBuffer(8)))
  }
  if (global.Blob.prototype.text === undefined) {
    global.Blob.prototype.text = jest.fn(() => Promise.resolve('mock text'))
  }
}

/**
 * fetch Mock
 */
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob()),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
  })
)

// ============================================================================
// Router Mock
// ============================================================================

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
}

jest.mock('next/navigation', () => ({
  useRouter() {
    return mockRouter
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
  useParams() {
    return {}
  },
}))

// ============================================================================
// Environment Setup
// ============================================================================

jest.setTimeout(10000)
process.env.NODE_ENV = 'test'

// ============================================================================
// Global Hooks
// ============================================================================

const originalError = console.error
const originalWarn = console.warn

beforeAll(() => {
  console.error = (...args) => {
    if (typeof args[0] === 'string') {
      const suppress = [
        'Warning: ReactDOM.render is deprecated',
        'Warning: An update to',
        'act(...)',
      ]
      if (suppress.some((msg) => args[0].includes(msg))) return
    }
    originalError.call(console, ...args)
  }

  console.warn = (...args) => {
    if (typeof args[0] === 'string') {
      const suppress = ['Warning:']
      if (suppress.some((msg) => args[0].includes(msg))) return
    }
    originalWarn.call(console, ...args)
  }
})

afterEach(() => {
  jest.clearAllMocks()
})

afterAll(async () => {
  console.error = originalError
  console.warn = originalWarn
  jest.clearAllTimers()
  await new Promise((resolve) => setTimeout(resolve, 0))
})

// ============================================================================
// Global Test Mocks Export
// ============================================================================

global.__testMocks__ = {
  router: mockRouter,
}
