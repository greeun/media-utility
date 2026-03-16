/**
 * R2 스토리지 유틸리티 단위 테스트
 *
 * src/lib/r2.ts의 S3Client 생성 및 환경 변수 처리 검증
 */

// S3Client 모킹
const mockS3Client = jest.fn();
jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: mockS3Client,
}));

// 환경 변수 저장/복원
const originalEnv = process.env;

describe('R2 스토리지 유틸리티', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('환경 변수가 설정된 경우 S3Client가 올바르게 생성되어야 함', () => {
    process.env.R2_ACCOUNT_ID = 'test-account-id';
    process.env.R2_ACCESS_KEY_ID = 'test-access-key';
    process.env.R2_SECRET_ACCESS_KEY = 'test-secret-key';
    process.env.R2_BUCKET_NAME = 'test-bucket';
    process.env.R2_PUBLIC_URL = 'https://cdn.example.com';

    require('@/lib/r2');

    expect(mockS3Client).toHaveBeenCalledWith({
      region: 'auto',
      endpoint: 'https://test-account-id.r2.cloudflarestorage.com',
      credentials: {
        accessKeyId: 'test-access-key',
        secretAccessKey: 'test-secret-key',
      },
    });
  });

  it('R2_BUCKET_NAME이 올바르게 내보내져야 함', () => {
    process.env.R2_ACCOUNT_ID = 'test-id';
    process.env.R2_BUCKET_NAME = 'my-bucket';

    const { R2_BUCKET_NAME } = require('@/lib/r2');
    expect(R2_BUCKET_NAME).toBe('my-bucket');
  });

  it('R2_PUBLIC_URL이 올바르게 내보내져야 함', () => {
    process.env.R2_ACCOUNT_ID = 'test-id';
    process.env.R2_PUBLIC_URL = 'https://cdn.example.com';

    const { R2_PUBLIC_URL } = require('@/lib/r2');
    expect(R2_PUBLIC_URL).toBe('https://cdn.example.com');
  });

  it('환경 변수가 없을 때 빈 문자열이 기본값이어야 함', () => {
    delete process.env.R2_BUCKET_NAME;
    delete process.env.R2_PUBLIC_URL;
    delete process.env.R2_ACCESS_KEY_ID;
    delete process.env.R2_SECRET_ACCESS_KEY;
    process.env.R2_ACCOUNT_ID = 'test-id';

    const { R2_BUCKET_NAME, R2_PUBLIC_URL } = require('@/lib/r2');
    expect(R2_BUCKET_NAME).toBe('');
    expect(R2_PUBLIC_URL).toBe('');
  });

  it('R2_ACCOUNT_ID가 없을 때 경고가 출력되어야 함', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    delete process.env.R2_ACCOUNT_ID;

    require('@/lib/r2');

    expect(consoleSpy).toHaveBeenCalledWith('R2_ACCOUNT_ID 환경 변수가 설정되지 않았습니다.');
    consoleSpy.mockRestore();
  });

  it('r2Client가 내보내져야 함', () => {
    process.env.R2_ACCOUNT_ID = 'test-id';

    const { r2Client } = require('@/lib/r2');
    expect(r2Client).toBeDefined();
  });
});
