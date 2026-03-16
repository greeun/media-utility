/**
 * Health API 단위 테스트
 *
 * GET /api/health 엔드포인트의 응답 검증
 */

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

import { GET } from '@/app/api/health/route';
import { NextResponse } from 'next/server';

describe('Health API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/health', () => {
    it('200 상태와 status:"ok"을 반환해야 함', async () => {
      const response = await GET();

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'ok' }),
        { status: 200 }
      );
      expect(response.status).toBe(200);
    });

    it('응답에 timestamp가 포함되어야 함', async () => {
      const before = new Date().toISOString();
      await GET();
      const after = new Date().toISOString();

      const calledWith = (NextResponse.json as jest.Mock).mock.calls[0][0];
      expect(calledWith).toHaveProperty('timestamp');

      // timestamp가 유효한 ISO 문자열인지 확인
      const timestamp = new Date(calledWith.timestamp);
      expect(timestamp.toISOString()).toBe(calledWith.timestamp);

      // 호출 전후 사이의 시간인지 확인
      expect(calledWith.timestamp >= before).toBe(true);
      expect(calledWith.timestamp <= after).toBe(true);
    });

    it('응답 형식이 JSON이어야 함', async () => {
      await GET();

      const calledWith = (NextResponse.json as jest.Mock).mock.calls[0][0];

      // JSON 직렬화 가능 확인
      expect(() => JSON.stringify(calledWith)).not.toThrow();

      // 올바른 구조 확인
      expect(calledWith).toEqual(
        expect.objectContaining({
          status: expect.any(String),
          timestamp: expect.any(String),
        })
      );
    });
  });
});
