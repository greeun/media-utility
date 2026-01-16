import { S3Client } from '@aws-sdk/client-s3';

if (!process.env.R2_ACCOUNT_ID) {
  console.warn('R2_ACCOUNT_ID 환경 변수가 설정되지 않았습니다.');
}

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || '';
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || '';
