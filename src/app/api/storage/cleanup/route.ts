import { NextRequest, NextResponse } from 'next/server';
import { ListObjectsV2Command, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, R2_BUCKET_NAME } from '@/lib/r2';

// 만료된 파일 정리 (cron job 또는 수동 호출)
export async function POST(request: NextRequest) {
  try {
    // 선택적 API 키 검증 (cron job에서 호출 시)
    const authHeader = request.headers.get('authorization');
    const cleanupApiKey = process.env.CLEANUP_API_KEY;

    if (cleanupApiKey && authHeader !== `Bearer ${cleanupApiKey}`) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }

    if (!R2_BUCKET_NAME) {
      return NextResponse.json(
        { error: 'R2 버킷이 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    const now = new Date();
    let deletedCount = 0;
    let deletedBytes = 0;
    const deletedFiles: string[] = [];
    let continuationToken: string | undefined;

    // 모든 파일 순회
    do {
      const listCommand = new ListObjectsV2Command({
        Bucket: R2_BUCKET_NAME,
        Prefix: 'uploads/',
        ContinuationToken: continuationToken,
      });

      const listResponse = await r2Client.send(listCommand);

      if (listResponse.Contents) {
        for (const object of listResponse.Contents) {
          if (!object.Key) continue;

          try {
            // 파일의 메타데이터 조회
            const headCommand = new HeadObjectCommand({
              Bucket: R2_BUCKET_NAME,
              Key: object.Key,
            });

            const headResponse = await r2Client.send(headCommand);
            const expiresAt = headResponse.Metadata?.['expires-at'];

            // 만료일 확인
            if (expiresAt) {
              const expirationDate = new Date(expiresAt);

              if (expirationDate <= now) {
                // 만료된 파일 삭제
                await r2Client.send(
                  new DeleteObjectCommand({
                    Bucket: R2_BUCKET_NAME,
                    Key: object.Key,
                  })
                );

                deletedCount++;
                deletedBytes += object.Size || 0;
                deletedFiles.push(object.Key);
              }
            }
          } catch (err) {
            console.error(`파일 처리 오류 (${object.Key}):`, err);
          }
        }
      }

      continuationToken = listResponse.NextContinuationToken;
    } while (continuationToken);

    return NextResponse.json({
      message: '정리 완료',
      deletedCount,
      deletedBytes,
      deletedFiles,
      cleanedAt: now.toISOString(),
    });
  } catch (error) {
    console.error('파일 정리 오류:', error);
    return NextResponse.json(
      { error: '파일 정리에 실패했습니다.' },
      { status: 500 }
    );
  }
}
