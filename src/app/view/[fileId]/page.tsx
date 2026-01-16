'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Lock, FileIcon, Download, Loader2, AlertCircle, Image as ImageIcon, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatFileSize } from '@/services/urlGenerator';

interface FileInfo {
  fileId: string;
  originalName: string;
  contentType: string;
  contentLength: number;
  hasPassword: boolean;
  expiresAt?: string;
  directUrl?: string;
}

export default function FileViewPage() {
  const params = useParams();
  const router = useRouter();
  const fileId = params.fileId as string;

  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [authError, setAuthError] = useState('');
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  // 파일 정보 조회
  useEffect(() => {
    const fetchFileInfo = async () => {
      try {
        const response = await fetch(`/api/files/${fileId}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || '파일을 찾을 수 없습니다.');
          return;
        }

        setFileInfo(data);

        // 비밀번호가 없으면 바로 URL 설정
        if (!data.hasPassword && data.directUrl) {
          setFileUrl(data.directUrl);
        }
      } catch (err) {
        console.error('파일 정보 조회 오류:', err);
        setError('파일 정보를 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (fileId) {
      fetchFileInfo();
    }
  }, [fileId]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setVerifying(true);

    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setAuthError(data.error || '인증 실패');
        return;
      }

      setFileUrl(data.url);
    } catch (err) {
      console.error('비밀번호 확인 오류:', err);
      setAuthError('인증 처리 중 오류가 발생했습니다.');
    } finally {
      setVerifying(false);
    }
  };

  const isImage = fileInfo?.contentType.startsWith('image/');
  const isVideo = fileInfo?.contentType.startsWith('video/');

  // 로딩 중
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  // 오류
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-red-900 mb-2">오류</h1>
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 비밀번호 입력 필요
  if (fileInfo?.hasPassword && !fileUrl) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-slate-200">
          <CardHeader className="text-center">
            <div className="mx-auto inline-flex items-center justify-center w-12 h-12 bg-slate-100 rounded-full mb-4">
              <Lock className="w-6 h-6 text-slate-600" />
            </div>
            <CardTitle className="text-xl">비밀번호 필요</CardTitle>
            <p className="text-sm text-slate-500 mt-2">
              이 파일은 비밀번호로 보호되어 있습니다.
            </p>
          </CardHeader>
          <CardContent>
            {/* 파일 정보 */}
            <div className="mb-6 p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center">
                  {isImage ? (
                    <ImageIcon className="w-5 h-5 text-slate-500" />
                  ) : isVideo ? (
                    <Video className="w-5 h-5 text-slate-500" />
                  ) : (
                    <FileIcon className="w-5 h-5 text-slate-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate text-sm">
                    {fileInfo.originalName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatFileSize(fileInfo.contentLength)}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호 입력"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  autoFocus
                />
              </div>
              {authError && (
                <p className="text-sm text-red-500">{authError}</p>
              )}
              <Button
                type="submit"
                disabled={verifying || !password}
                className="w-full bg-rose-600 hover:bg-rose-700"
              >
                {verifying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    확인 중...
                  </>
                ) : (
                  '확인'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 파일 표시
  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="border-slate-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                  {isImage ? (
                    <ImageIcon className="w-5 h-5 text-slate-500" />
                  ) : isVideo ? (
                    <Video className="w-5 h-5 text-slate-500" />
                  ) : (
                    <FileIcon className="w-5 h-5 text-slate-500" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-lg">{fileInfo?.originalName}</CardTitle>
                  <p className="text-sm text-slate-500">
                    {formatFileSize(fileInfo?.contentLength || 0)}
                    {fileInfo?.expiresAt && (
                      <span className="ml-2">
                        | 만료: {new Date(fileInfo.expiresAt).toLocaleDateString('ko-KR')}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              {fileUrl && (
                <Button asChild className="bg-rose-600 hover:bg-rose-700">
                  <a href={fileUrl} download={fileInfo?.originalName}>
                    <Download className="w-4 h-4 mr-2" />
                    다운로드
                  </a>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {/* 미디어 프리뷰 */}
            {fileUrl && isImage && (
              <div className="rounded-lg overflow-hidden bg-slate-100">
                <img
                  src={fileUrl}
                  alt={fileInfo?.originalName}
                  className="max-w-full max-h-[70vh] mx-auto"
                />
              </div>
            )}
            {fileUrl && isVideo && (
              <div className="rounded-lg overflow-hidden bg-black">
                <video
                  src={fileUrl}
                  controls
                  className="max-w-full max-h-[70vh] mx-auto"
                />
              </div>
            )}
            {fileUrl && !isImage && !isVideo && (
              <div className="text-center py-12">
                <FileIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">미리보기를 지원하지 않는 파일 형식입니다.</p>
                <p className="text-sm text-slate-400 mt-1">다운로드 버튼을 클릭하여 파일을 받으세요.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
