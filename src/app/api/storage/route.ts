import { NextRequest, NextResponse } from 'next/server';
import { ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from '@/lib/r2';

const MAX_STORAGE_BYTES = 10 * 1024 * 1024 * 1024; // 10GB

export interface StorageFile {
  key: string;
  size: number;
  lastModified: Date;
  url: string;
  expiresAt?: string;
}

export interface StorageInfo {
  usedBytes: number;
  maxBytes: number;
  usedPercent: number;
  fileCount: number;
  files: StorageFile[];
}

// 저장소 정보 조회
export async function GET(request: NextRequest) {
  try {
    if (!R2_BUCKET_NAME) {
      return NextResponse.json(
        { error: 'R2 버킷이 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const includeFiles = searchParams.get('includeFiles') === 'true';

    let usedBytes = 0;
    let fileCount = 0;
    const files: StorageFile[] = [];
    let continuationToken: string | undefined;

    // 모든 파일 목록 조회
    do {
      const command = new ListObjectsV2Command({
        Bucket: R2_BUCKET_NAME,
        Prefix: 'uploads/',
        ContinuationToken: continuationToken,
      });

      const response = await r2Client.send(command);

      if (response.Contents) {
        for (const object of response.Contents) {
          if (object.Key && object.Size !== undefined) {
            usedBytes += object.Size;
            fileCount++;

            if (includeFiles) {
              const publicUrl = R2_PUBLIC_URL
                ? `${R2_PUBLIC_URL}/${object.Key}`
                : `https://${R2_BUCKET_NAME}.r2.dev/${object.Key}`;

              files.push({
                key: object.Key,
                size: object.Size,
                lastModified: object.LastModified || new Date(),
                url: publicUrl,
              });
            }
          }
        }
      }

      continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    // 파일을 최신순으로 정렬
    if (includeFiles) {
      files.sort((a, b) =>
        new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
      );
    }

    const storageInfo: StorageInfo = {
      usedBytes,
      maxBytes: MAX_STORAGE_BYTES,
      usedPercent: Math.round((usedBytes / MAX_STORAGE_BYTES) * 100 * 100) / 100,
      fileCount,
      files: includeFiles ? files : [],
    };

    return NextResponse.json(storageInfo);
  } catch (error) {
    console.error('저장소 정보 조회 오류:', error);
    return NextResponse.json(
      { error: '저장소 정보 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// 파일 삭제
export async function DELETE(request: NextRequest) {
  try {
    const { key } = await request.json();

    if (!key) {
      return NextResponse.json(
        { error: '파일 키가 필요합니다.' },
        { status: 400 }
      );
    }

    if (!R2_BUCKET_NAME) {
      return NextResponse.json(
        { error: 'R2 버킷이 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
      })
    );

    return NextResponse.json({ message: '파일이 삭제되었습니다.', key });
  } catch (error) {
    console.error('파일 삭제 오류:', error);
    return NextResponse.json(
      { error: '파일 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}
