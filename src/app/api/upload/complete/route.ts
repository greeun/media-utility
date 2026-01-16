import { NextRequest, NextResponse } from 'next/server';
import { HeadObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from '@/lib/r2';

export async function POST(request: NextRequest) {
  try {
    const { key } = await request.json();

    if (!key) {
      return NextResponse.json(
        { error: '파일 키가 필요합니다.' },
        { status: 400 }
      );
    }

    // 파일 메타데이터 확인
    let hasPassword = false;
    try {
      const headResponse = await r2Client.send(
        new HeadObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: key,
        })
      );
      hasPassword = !!headResponse.Metadata?.['password-hash'];
    } catch {
      return NextResponse.json(
        { error: '파일을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 공개 URL 생성 (R2 직접 접근)
    const publicUrl = R2_PUBLIC_URL
      ? `${R2_PUBLIC_URL}/${key}`
      : `https://${R2_BUCKET_NAME}.r2.dev/${key}`;

    // 파일 ID 추출 (uploads/ 제거)
    const fileId = key.replace('uploads/', '');

    // 뷰어 URL 생성 (비밀번호 확인 페이지)
    const baseUrl = request.headers.get('origin') || '';
    const viewUrl = `${baseUrl}/view/${fileId}`;

    return NextResponse.json({
      url: hasPassword ? viewUrl : publicUrl,
      viewUrl,
      directUrl: publicUrl,
      key,
      hasPassword,
    });
  } catch (error) {
    console.error('업로드 완료 처리 오류:', error);
    return NextResponse.json(
      { error: '업로드 완료 처리에 실패했습니다.' },
      { status: 500 }
    );
  }
}
