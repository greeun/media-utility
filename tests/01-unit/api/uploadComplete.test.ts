/**
 * Upload Complete API 단위 테스트
 *
 * POST /api/upload/complete 엔드포인트의 업로드 완료 처리 검증
 */

// R2 및 AWS SDK mock
jest.mock('@/lib/r2', () => ({
  r2Client: { send: jest.fn() },
  R2_BUCKET_NAME: 'test-bucket',
  R2_PUBLIC_URL: 'https://test.r2.dev',
}));

jest.mock('@aws-sdk/client-s3', () => ({
  HeadObjectCommand: jest.fn(),
}));

// NextResponse mock
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((body: unknown, init?: { status?: number }) => ({
      body,
      status: init?.status || 200,
    })),
  },
  NextRequest: jest.fn(),
}));

import { POST } from '@/app/api/upload/complete/route';
import { r2Client } from '@/lib/r2';

// 요청 객체 헬퍼
function createRequest(body: Record<string, unknown>, origin = 'https://example.com') {
  return {
    json: jest.fn().mockResolvedValue(body),
    headers: {
      get: jest.fn((name: string) => {
        if (name === 'origin') return origin;
        return null;
      }),
    },
  } as unknown as Request;
}

describe('Upload Complete API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/upload/complete', () => {
    it('key 누락 시 400을 반환해야 함', async () => {
      const request = createRequest({});

      const response = await POST(request as any);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('정상 처리 시 url을 반환해야 함', async () => {
      // 비밀번호 없는 파일
      (r2Client.send as jest.Mock).mockResolvedValue({
        Metadata: {
          'original-name': 'test.jpg',
        },
        ContentType: 'image/jpeg',
      });

      const request = createRequest({ key: 'uploads/12345-abc.jpg' });

      const response = await POST(request as any);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('url');
      expect(response.body).toHaveProperty('viewUrl');
      expect(response.body).toHaveProperty('directUrl');
      expect(response.body).toHaveProperty('key');
      expect(response.body.hasPassword).toBe(false);
    });

    it('비밀번호 있는 파일은 hasPassword가 true여야 함', async () => {
      // 비밀번호가 있는 파일
      (r2Client.send as jest.Mock).mockResolvedValue({
        Metadata: {
          'original-name': 'secret.jpg',
          'password-hash': 'abc123hash',
        },
        ContentType: 'image/jpeg',
      });

      const request = createRequest({ key: 'uploads/12345-abc.jpg' });

      const response = await POST(request as any);

      expect(response.status).toBe(200);
      expect(response.body.hasPassword).toBe(true);
      // 비밀번호 있는 파일은 viewUrl이 url로 설정됨
      expect(response.body.url).toBe(response.body.viewUrl);
    });

    it('파일을 찾을 수 없으면 404를 반환해야 함', async () => {
      // HeadObjectCommand 실패 시뮬레이션
      (r2Client.send as jest.Mock).mockRejectedValue(
        new Error('NoSuchKey')
      );

      const request = createRequest({ key: 'uploads/nonexistent.jpg' });

      const response = await POST(request as any);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });
});
