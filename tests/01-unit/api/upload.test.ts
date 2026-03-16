/**
 * Upload API 단위 테스트
 *
 * POST /api/upload 엔드포인트의 Presigned URL 생성 검증
 */

// R2 및 AWS SDK mock
jest.mock('@/lib/r2', () => ({
  r2Client: { send: jest.fn() },
  R2_BUCKET_NAME: 'test-bucket',
  R2_PUBLIC_URL: 'https://test.r2.dev',
}));

jest.mock('@aws-sdk/client-s3', () => ({
  PutObjectCommand: jest.fn(),
  ListObjectsV2Command: jest.fn(),
}));

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(() =>
    Promise.resolve('https://signed-url.example.com')
  ),
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

import { POST } from '@/app/api/upload/route';
import { NextResponse } from 'next/server';
import { r2Client } from '@/lib/r2';

// 요청 객체 헬퍼
function createRequest(body: Record<string, unknown>) {
  return {
    json: jest.fn().mockResolvedValue(body),
  } as unknown as Request;
}

describe('Upload API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // 기본 R2 응답: 빈 버킷
    (r2Client.send as jest.Mock).mockResolvedValue({
      Contents: [],
      NextContinuationToken: undefined,
    });
  });

  describe('POST /api/upload', () => {
    it('정상 업로드 시 signedUrl을 반환해야 함', async () => {
      const request = createRequest({
        fileName: 'test.jpg',
        contentType: 'image/jpeg',
      });

      const response = await POST(request as any);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('signedUrl');
      expect(response.body).toHaveProperty('key');
      expect(response.body).toHaveProperty('expiresAt');
    });

    it('fileName 누락 시 400을 반환해야 함', async () => {
      const request = createRequest({
        contentType: 'image/jpeg',
      });

      const response = await POST(request as any);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('contentType 누락 시 400을 반환해야 함', async () => {
      const request = createRequest({
        fileName: 'test.jpg',
      });

      const response = await POST(request as any);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('비밀번호 포함 시 hasPassword가 true여야 함', async () => {
      const request = createRequest({
        fileName: 'test.jpg',
        contentType: 'image/jpeg',
        password: 'secret123',
      });

      const response = await POST(request as any);

      expect(response.status).toBe(200);
      expect(response.body.hasPassword).toBe(true);
    });

    it('비밀번호 미포함 시 hasPassword가 false여야 함', async () => {
      const request = createRequest({
        fileName: 'test.jpg',
        contentType: 'image/jpeg',
      });

      const response = await POST(request as any);

      expect(response.status).toBe(200);
      expect(response.body.hasPassword).toBe(false);
    });

    it('expiresInDays 미지정 시 기본값 30일이 적용되어야 함', async () => {
      const request = createRequest({
        fileName: 'test.jpg',
        contentType: 'image/jpeg',
      });

      const response = await POST(request as any);

      // 30일 후의 날짜 확인
      const expiresAt = new Date(response.body.expiresAt);
      const now = new Date();
      const diffDays = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

      // 약 30일 (±1일 허용)
      expect(diffDays).toBeGreaterThan(29);
      expect(diffDays).toBeLessThanOrEqual(31);
    });

    it('용량 초과 시 507을 반환해야 함', async () => {
      // 거의 꽉 찬 버킷 시뮬레이션
      (r2Client.send as jest.Mock).mockResolvedValue({
        Contents: [{ Key: 'uploads/big-file.dat', Size: 10 * 1024 * 1024 * 1024 }],
        NextContinuationToken: undefined,
      });

      const request = createRequest({
        fileName: 'test.jpg',
        contentType: 'image/jpeg',
        fileSize: 1024 * 1024, // 1MB
      });

      const response = await POST(request as any);

      expect(response.status).toBe(507);
      expect(response.body).toHaveProperty('error');
    });

    it('R2_BUCKET_NAME 없으면 500을 반환해야 함', async () => {
      // R2_BUCKET_NAME을 빈 문자열로 재설정
      jest.resetModules();
      jest.mock('@/lib/r2', () => ({
        r2Client: { send: jest.fn() },
        R2_BUCKET_NAME: '',
        R2_PUBLIC_URL: 'https://test.r2.dev',
      }));
      jest.mock('next/server', () => ({
        NextResponse: {
          json: jest.fn((body: unknown, init?: { status?: number }) => ({
            body,
            status: init?.status || 200,
          })),
        },
        NextRequest: jest.fn(),
      }));
      jest.mock('@aws-sdk/client-s3', () => ({
        PutObjectCommand: jest.fn(),
        ListObjectsV2Command: jest.fn(),
      }));
      jest.mock('@aws-sdk/s3-request-presigner', () => ({
        getSignedUrl: jest.fn(() => Promise.resolve('https://signed-url.example.com')),
      }));

      const { POST: POST2 } = require('@/app/api/upload/route');
      const request = createRequest({
        fileName: 'test.jpg',
        contentType: 'image/jpeg',
      });

      const response = await POST2(request);

      expect(response.status).toBe(500);
    });
  });
});
