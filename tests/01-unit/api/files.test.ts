/**
 * Files API 단위 테스트
 *
 * GET/POST /api/files/[fileId] 엔드포인트의 파일 조회 및 비밀번호 확인 검증
 */

import { createHash } from 'crypto';

// R2 및 AWS SDK mock
jest.mock('@/lib/r2', () => ({
  r2Client: { send: jest.fn() },
  R2_BUCKET_NAME: 'test-bucket',
  R2_PUBLIC_URL: 'https://test.r2.dev',
}));

jest.mock('@aws-sdk/client-s3', () => ({
  GetObjectCommand: jest.fn(),
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

import { GET, POST } from '@/app/api/files/[fileId]/route';
import { r2Client } from '@/lib/r2';

// 비밀번호 해시 헬퍼
function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

// 요청 객체 헬퍼
function createRequest(body?: Record<string, unknown>) {
  return {
    json: jest.fn().mockResolvedValue(body || {}),
    url: 'https://example.com/api/files/12345-abc.jpg',
  } as unknown as Request;
}

// params 헬퍼
function createParams(fileId: string) {
  return { params: Promise.resolve({ fileId }) };
}

describe('Files API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/files/[fileId]', () => {
    it('정상 파일 조회 시 파일 정보를 반환해야 함', async () => {
      const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      (r2Client.send as jest.Mock).mockResolvedValue({
        Metadata: {
          'original-name': encodeURIComponent('테스트.jpg'),
          'expires-at': futureDate,
        },
        ContentType: 'image/jpeg',
        ContentLength: 1024,
      });

      const request = createRequest();
      const response = await GET(request as any, createParams('12345-abc.jpg') as any);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('fileId', '12345-abc.jpg');
      expect(response.body).toHaveProperty('originalName', '테스트.jpg');
      expect(response.body).toHaveProperty('contentType', 'image/jpeg');
      expect(response.body).toHaveProperty('hasPassword', false);
      expect(response.body).toHaveProperty('expiresAt');
    });

    it('파일 미존재 시 404를 반환해야 함', async () => {
      (r2Client.send as jest.Mock).mockRejectedValue(
        new Error('NoSuchKey')
      );

      const request = createRequest();
      const response = await GET(request as any, createParams('nonexistent.jpg') as any);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('만료된 파일 조회 시 410을 반환해야 함', async () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      (r2Client.send as jest.Mock).mockResolvedValue({
        Metadata: {
          'original-name': 'expired.jpg',
          'expires-at': pastDate,
        },
        ContentType: 'image/jpeg',
        ContentLength: 512,
      });

      const request = createRequest();
      const response = await GET(request as any, createParams('expired.jpg') as any);

      expect(response.status).toBe(410);
      expect(response.body).toHaveProperty('error');
    });

    it('비밀번호가 있는 파일은 directUrl이 null이어야 함', async () => {
      const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      (r2Client.send as jest.Mock).mockResolvedValue({
        Metadata: {
          'original-name': 'secret.jpg',
          'expires-at': futureDate,
          'password-hash': hashPassword('mypassword'),
        },
        ContentType: 'image/jpeg',
        ContentLength: 2048,
      });

      const request = createRequest();
      const response = await GET(request as any, createParams('secret.jpg') as any);

      expect(response.status).toBe(200);
      expect(response.body.hasPassword).toBe(true);
      expect(response.body.directUrl).toBeNull();
    });
  });

  describe('POST /api/files/[fileId]', () => {
    it('비밀번호 정상 확인 시 URL을 반환해야 함', async () => {
      const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      (r2Client.send as jest.Mock).mockResolvedValue({
        Metadata: {
          'password-hash': hashPassword('correctpass'),
          'expires-at': futureDate,
        },
        ContentType: 'image/jpeg',
      });

      const request = createRequest({ password: 'correctpass' });
      const response = await POST(request as any, createParams('12345-abc.jpg') as any);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('url');
    });

    it('비밀번호 불일치 시 401을 반환해야 함', async () => {
      const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      (r2Client.send as jest.Mock).mockResolvedValue({
        Metadata: {
          'password-hash': hashPassword('correctpass'),
          'expires-at': futureDate,
        },
        ContentType: 'image/jpeg',
      });

      const request = createRequest({ password: 'wrongpassword' });
      const response = await POST(request as any, createParams('12345-abc.jpg') as any);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('비밀번호 누락 시 401을 반환해야 함', async () => {
      const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      (r2Client.send as jest.Mock).mockResolvedValue({
        Metadata: {
          'password-hash': hashPassword('somepass'),
          'expires-at': futureDate,
        },
        ContentType: 'image/jpeg',
      });

      const request = createRequest({});
      const response = await POST(request as any, createParams('12345-abc.jpg') as any);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('비밀번호가 없는 파일은 비밀번호 없이도 접근 가능해야 함', async () => {
      const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      (r2Client.send as jest.Mock).mockResolvedValue({
        Metadata: {
          'expires-at': futureDate,
        },
        ContentType: 'image/jpeg',
      });

      const request = createRequest({});
      const response = await POST(request as any, createParams('12345-abc.jpg') as any);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });

    it('만료된 파일 접근 시 410을 반환해야 함', async () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      (r2Client.send as jest.Mock).mockResolvedValue({
        Metadata: {
          'expires-at': pastDate,
          'password-hash': hashPassword('pass'),
        },
        ContentType: 'image/jpeg',
      });

      const request = createRequest({ password: 'pass' });
      const response = await POST(request as any, createParams('expired.jpg') as any);

      expect(response.status).toBe(410);
      expect(response.body).toHaveProperty('error');
    });
  });
});
