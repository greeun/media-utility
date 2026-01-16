import { NextRequest, NextResponse } from 'next/server';
import { GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { createHash } from 'crypto';
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from '@/lib/r2';

// 비밀번호 해시 생성
function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

// GET: 파일 정보 조회 (비밀번호 필요 여부 확인)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;
    const key = `uploads/${fileId}`;

    const headResponse = await r2Client.send(
      new HeadObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
      })
    );

    const metadata = headResponse.Metadata || {};
    const hasPassword = !!metadata['password-hash'];
    const originalName = metadata['original-name']
      ? decodeURIComponent(metadata['original-name'])
      : fileId;
    const expiresAt = metadata['expires-at'];
    const contentType = headResponse.ContentType || 'application/octet-stream';
    const contentLength = headResponse.ContentLength || 0;

    // 만료 확인
    if (expiresAt && new Date(expiresAt) < new Date()) {
      return NextResponse.json(
        { error: '파일이 만료되었습니다.' },
        { status: 410 }
      );
    }

    // 공개 URL (비밀번호 없는 경우)
    const directUrl = R2_PUBLIC_URL
      ? `${R2_PUBLIC_URL}/${key}`
      : `https://${R2_BUCKET_NAME}.r2.dev/${key}`;

    return NextResponse.json({
      fileId,
      originalName,
      contentType,
      contentLength,
      hasPassword,
      expiresAt,
      directUrl: hasPassword ? null : directUrl,
    });
  } catch (error) {
    console.error('파일 정보 조회 오류:', error);
    return NextResponse.json(
      { error: '파일을 찾을 수 없습니다.' },
      { status: 404 }
    );
  }
}

// POST: 비밀번호 확인 후 파일 URL 반환
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;
    const key = `uploads/${fileId}`;
    const { password } = await request.json();

    const headResponse = await r2Client.send(
      new HeadObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
      })
    );

    const metadata = headResponse.Metadata || {};
    const storedHash = metadata['password-hash'];
    const expiresAt = metadata['expires-at'];

    // 만료 확인
    if (expiresAt && new Date(expiresAt) < new Date()) {
      return NextResponse.json(
        { error: '파일이 만료되었습니다.' },
        { status: 410 }
      );
    }

    // 비밀번호 확인
    if (storedHash) {
      if (!password) {
        return NextResponse.json(
          { error: '비밀번호가 필요합니다.' },
          { status: 401 }
        );
      }

      const inputHash = hashPassword(password);
      if (inputHash !== storedHash) {
        return NextResponse.json(
          { error: '비밀번호가 올바르지 않습니다.' },
          { status: 401 }
        );
      }
    }

    // 파일 URL 반환
    const directUrl = R2_PUBLIC_URL
      ? `${R2_PUBLIC_URL}/${key}`
      : `https://${R2_BUCKET_NAME}.r2.dev/${key}`;

    return NextResponse.json({
      success: true,
      url: directUrl,
    });
  } catch (error) {
    console.error('파일 접근 오류:', error);
    return NextResponse.json(
      { error: '파일을 찾을 수 없습니다.' },
      { status: 404 }
    );
  }
}
