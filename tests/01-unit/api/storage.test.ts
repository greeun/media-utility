/**
 * Storage API 단위 테스트
 *
 * GET /api/storage: 스토리지 정보 조회
 * DELETE /api/storage: 파일 삭제
 */

// R2 및 AWS SDK mock
jest.mock('@/lib/r2', () => ({
  r2Client: { send: jest.fn() },
  R2_BUCKET_NAME: 'test-bucket',
  R2_PUBLIC_URL: 'https://test.r2.dev',
}));

jest.mock('@aws-sdk/client-s3', () => ({
  ListObjectsV2Command: jest.fn(),
  DeleteObjectCommand: jest.fn(),
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

import { GET, DELETE } from '@/app/api/storage/route';
import { r2Client } from '@/lib/r2';

// GET 요청 헬퍼
function createGetRequest(includeFiles = false) {
  return {
    url: `https://example.com/api/storage${includeFiles ? '?includeFiles=true' : ''}`,
  } as unknown as Request;
}

// DELETE 요청 헬퍼
function createDeleteRequest(body: Record<string, unknown>) {
  return {
    json: jest.fn().mockResolvedValue(body),
  } as unknown as Request;
}

describe('Storage API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/storage', () => {
    it('스토리지 정보를 정상 조회해야 함', async () => {
      (r2Client.send as jest.Mock).mockResolvedValue({
        Contents: [
          { Key: 'uploads/file1.jpg', Size: 1024 },
          { Key: 'uploads/file2.png', Size: 2048 },
        ],
        NextContinuationToken: undefined,
      });

      const request = createGetRequest();
      const response = await GET(request as any);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('usedBytes', 3072);
      expect(response.body).toHaveProperty('maxBytes');
      expect(response.body).toHaveProperty('usedPercent');
      expect(response.body).toHaveProperty('fileCount', 2);
    });

    it('빈 버킷의 스토리지 정보를 조회해야 함', async () => {
      (r2Client.send as jest.Mock).mockResolvedValue({
        Contents: [],
        NextContinuationToken: undefined,
      });

      const request = createGetRequest();
      const response = await GET(request as any);

      expect(response.status).toBe(200);
      expect(response.body.usedBytes).toBe(0);
      expect(response.body.fileCount).toBe(0);
      expect(response.body.usedPercent).toBe(0);
    });

    it('R2_BUCKET_NAME 없으면 500을 반환해야 함', async () => {
      jest.resetModules();
      jest.mock('@/lib/r2', () => ({
        r2Client: { send: jest.fn() },
        R2_BUCKET_NAME: '',
        R2_PUBLIC_URL: 'https://test.r2.dev',
      }));
      jest.mock('@aws-sdk/client-s3', () => ({
        ListObjectsV2Command: jest.fn(),
        DeleteObjectCommand: jest.fn(),
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

      const { GET: GET2 } = require('@/app/api/storage/route');
      const request = createGetRequest();
      const response = await GET2(request);

      expect(response.status).toBe(500);
    });
  });

  describe('DELETE /api/storage', () => {
    it('파일 삭제가 정상 수행되어야 함', async () => {
      (r2Client.send as jest.Mock).mockResolvedValue({});

      const request = createDeleteRequest({ key: 'uploads/file1.jpg' });
      const response = await DELETE(request as any);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('key', 'uploads/file1.jpg');
    });

    it('key 누락 시 400을 반환해야 함', async () => {
      const request = createDeleteRequest({});
      const response = await DELETE(request as any);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('R2 삭제 실패 시 500을 반환해야 함', async () => {
      (r2Client.send as jest.Mock).mockRejectedValue(
        new Error('R2 삭제 실패')
      );

      const request = createDeleteRequest({ key: 'uploads/file1.jpg' });
      const response = await DELETE(request as any);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });
});
