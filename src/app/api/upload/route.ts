import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createHash } from 'crypto';
import { r2Client, R2_BUCKET_NAME } from '@/lib/r2';

const MAX_STORAGE_BYTES = 10 * 1024 * 1024 * 1024; // 10GB

// 비밀번호 해시 생성
function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

// 현재 사용량 조회
async function getCurrentUsage(): Promise<number> {
  let usedBytes = 0;
  let continuationToken: string | undefined;

  do {
    const command = new ListObjectsV2Command({
      Bucket: R2_BUCKET_NAME,
      Prefix: 'uploads/',
      ContinuationToken: continuationToken,
    });

    const response = await r2Client.send(command);

    if (response.Contents) {
      for (const object of response.Contents) {
        if (object.Size !== undefined) {
          usedBytes += object.Size;
        }
      }
    }

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  return usedBytes;
}

export async function POST(request: NextRequest) {
  try {
    const { fileName, contentType, fileSize, expiresInDays, password } = await request.json();

    if (!fileName || !contentType) {
      return NextResponse.json(
        { error: '파일명과 콘텐츠 타입이 필요합니다.' },
        { status: 400 }
      );
    }

    if (!R2_BUCKET_NAME) {
      return NextResponse.json(
        { error: 'R2 버킷이 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    // 용량 체크
    if (fileSize) {
      const currentUsage = await getCurrentUsage();
      const remainingBytes = MAX_STORAGE_BYTES - currentUsage;

      if (fileSize > remainingBytes) {
        return NextResponse.json(
          {
            error: '저장 용량이 부족합니다.',
            currentUsage,
            maxStorage: MAX_STORAGE_BYTES,
            remainingBytes,
            requestedSize: fileSize,
          },
          { status: 507 } // Insufficient Storage
        );
      }
    }

    // 고유 파일명 생성
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = fileName.split('.').pop() || '';
    const key = `uploads/${timestamp}-${randomStr}.${ext}`;

    // 유효기간 계산 (기본 30일)
    const days = expiresInDays || 30;
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    // 메타데이터 구성
    const metadata: Record<string, string> = {
      'original-name': encodeURIComponent(fileName),
      'expires-at': expiresAt.toISOString(),
      'uploaded-at': new Date().toISOString(),
    };

    // 비밀번호가 있으면 해시하여 저장
    if (password && password.trim()) {
      metadata['password-hash'] = hashPassword(password.trim());
    }

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
      Metadata: metadata,
    });

    // Presigned URL 생성 (1시간 유효)
    const signedUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });

    return NextResponse.json({
      signedUrl,
      key,
      expiresAt: expiresAt.toISOString(),
      hasPassword: !!password,
    });
  } catch (error) {
    console.error('Presigned URL 생성 오류:', error);
    return NextResponse.json(
      { error: 'Presigned URL 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}
