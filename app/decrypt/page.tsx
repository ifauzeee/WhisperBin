// /app/decrypt/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  KeyRound,
  FileText,
  Check,
  Download,
  Image as ImageIcon,
  Type,
  FileUp,
  ShieldCheck,
  ShieldOff,
} from 'lucide-react';
type StatusType = 'idle' | 'loading' | 'success' | 'error';

interface PreviewData {
  url: string;
  name: string;
  type: string;
}

export default function DecryptPage() {
  const [inputCode, setInputCode] = useState('');
  const [password, setPassword] = useState('');
  const [statusText, setStatusText] = useState('Menunggu kode...');
  const [statusType, setStatusType] = useState<StatusType>('idle');
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [decryptedText, setDecryptedText] = useState<string | null>(null);

  const [isPasswordRequired, setIsPasswordRequired] = useState<boolean | null>(
    null
  );

  const workerRef = useRef<Worker | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../../lib/crypto.worker.ts', import.meta.url)
    );

    workerRef.current.onmessage = (event: MessageEvent) => {
      const { type, action, payload, message } = event.data;

      if (type === 'status') {
        setStatusText(message);
      } else if (type === 'success' && action === 'decrypt') {
        const { decryptedBuffer, filename, fileType } = payload;

        if (fileType === 'text/plain') {
          const text = new TextDecoder().decode(decryptedBuffer);
          setDecryptedText(text);
          setStatusText(
            `Dekripsi Teks berhasil! Teks "${filename}" ditampilkan.`
          );
          setStatusType('success');
        } else {
          const blob = new Blob([decryptedBuffer], { type: fileType });
          const downloadUrl = URL.createObjectURL(blob);

          setPreviewData({
            url: downloadUrl,
            name: filename,
            type: blob.type,
          });
          setStatusText(
            `Dekripsi File berhasil! Pratinjau file "${filename}" tersedia.`
          );
          setStatusType('success');
        }
      } else if (type === 'error') {
        setStatusText(`ERROR: ${message}`);
        setStatusType('error');
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (previewData) {
        URL.revokeObjectURL(previewData.url);
      }
    };
  }, [previewData]);

  const getStatusColor = () => {
    switch (statusType) {
      case 'loading':
        return 'text-yellow-400';
      case 'success':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    if (file.type !== 'text/plain') {
      setStatusText('ERROR: Harap pilih file .txt yang valid.');
      setStatusType('error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      handleCodeChange(text);
      setStatusText(
        `File ${file.name} berhasil di-load. Siap didekripsi.`
      );
      setStatusType('idle');
    };
    reader.onerror = () => {
      setStatusText('ERROR: Gagal membaca file.');
      setStatusType('error');
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleCodeChange = (code: string) => {
    setInputCode(code);
    const trimmedCode = code.trim();

    if (trimmedCode.startsWith('P:')) {
      setIsPasswordRequired(true);
      setStatusText('Deteksi: Mode Password (P:). Masukkan password.');
      setStatusType('idle');
    } else if (trimmedCode.startsWith('K:')) {
      setIsPasswordRequired(false);
      setStatusText('Deteksi: Mode Tanpa Password (K:). Siap didekripsi.');
      setStatusType('idle');
    } else if (trimmedCode.length > 5 && !trimmedCode.includes(':')) {
      // Dukungan format lama
      setIsPasswordRequired(true);
      setStatusText(
        'Deteksi: Mode Password (Format Lama). Masukkan password.'
      );
      setStatusType('idle');
    } else if (trimmedCode.length === 0) {
      setIsPasswordRequired(null);
      setStatusText('Menunggu kode...');
      setStatusType('idle');
    } else {
      setIsPasswordRequired(null);
    }
  };

  const handleDecrypt = () => {
    if (!inputCode) {
      setStatusText('ERROR: Kode Base64 tidak boleh kosong.');
      setStatusType('error');
      return;
    }

    if (isPasswordRequired && !password) {
      setStatusText('ERROR: Password dibutuhkan untuk kode ini.');
      setStatusType('error');
      return;
    }

    if (isPasswordRequired === false && password) {
      setStatusText(
        'Info: Password diabaikan karena kode ini tidak terproteksi.'
      );
    }

    setStatusType('loading');
    if (previewData) {
      URL.revokeObjectURL(previewData.url);
    }
    setPreviewData(null);
    setDecryptedText(null);
    setStatusText('Mengirim data ke worker...');
    workerRef.current?.postMessage({
      action: 'decrypt',
      payload: {
        inputCode,
        password,
      },
    });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold">Dekripsi Data</h1>
          <p className="text-gray-400">
            Buka file atau teks rahasia Anda.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-16">
        <div className="space-y-8">
          <div>
            <div className="flex items-center justify-between mb-3">
              <label
                htmlFor="input-code"
                className="block text-lg font-medium text-gray-300"
              >
                Tempelkan Kode Base64
              </label>
              <button
                onClick={triggerFileInput}
                className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
              >
                <FileUp className="w-4 h-4" />
                Import .txt
              </button>
            </div>
            <div className="relative">
              <FileText className="absolute left-4 top-4 w-5 h-5 text-gray-500" />
              <textarea
                id="input-code"
                value={inputCode}
                onChange={(e) => handleCodeChange(e.target.value)}
                className="w-full h-40 pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg font-mono text-xs focus:border-green-500 focus:ring-green-500 focus:outline-none"
                placeholder="Tempelkan kode (P:data... atau K:data...) atau import file .txt"
              />
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileImport}
              className="hidden"
              accept="text/plain,.txt"
            />
          </div>

          {isPasswordRequired === true && (
            <div className="animate-in fade-in duration-300 space-y-4">
              <label
                htmlFor="password-dec"
                className="flex items-center gap-2 text-lg font-medium text-gray-300"
              >
                <ShieldCheck className="w-5 h-5 text-green-400" />
                Password Dibutuhkan
              </label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="password-dec"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-gray-800 border border-gray-700 rounded-lg text-lg focus:border-green-500 focus:ring-green-500 focus:outline-none"
                  placeholder="Masukkan password yang sesuai..."
                />
              </div>
            </div>
          )}

          {isPasswordRequired === false && (
            <div className="flex items-center gap-3 p-4 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-300 animate-in fade-in duration-300">
              <ShieldOff className="w-5 h-5 text-gray-400" />
              <span>
                Mode Tanpa Password (K:). Password tidak diperlukan.
              </span>
            </div>
          )}

          <button
            onClick={handleDecrypt}
            disabled={
              statusType === 'loading' || isPasswordRequired === null
            }
            className="w-full flex items-center justify-center gap-3 px-6 py-5 bg-green-600 rounded-lg font-semibold text-white text-lg hover:bg-green-700 disabled:bg-gray-600 disabled:text-gray-400 transition-all duration-300"
          >
            <Check className="w-5 h-5" />
            {statusType === 'loading'
              ? 'Memproses...'
              : 'Mulai Dekripsi'}
          </button>

          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mt-6">
            <label className="text-sm font-medium text-gray-300">
              Status Proses:
            </label>
            <p
              className={`mt-2 font-mono text-sm ${getStatusColor()}`}
              style={{ minHeight: '1.25rem' }}
            >
              {statusText}
            </p>
          </div>
        </div>

        <div className="flex flex-col mt-12 lg:mt-0">
          <label className="block mb-3 text-lg font-medium text-gray-300">
            Hasil Dekripsi
          </label>
          <div className="relative w-full h-full flex-grow min-h-[500px]">
            {decryptedText ? (
              <div className="w-full h-full flex flex-col space-y-4 rounded-lg bg-gray-900 border border-gray-700 p-4">
                <div className="flex items-center gap-3 px-2">
                  <Type className="w-5 h-5 text-gray-400" />
                  <h3 className="text-lg font-medium">Hasil Teks</h3>
                </div>
                <textarea
                  readOnly
                  value={decryptedText}
                  className="w-full flex-grow h-96 p-3 rounded-lg bg-gray-800 border border-gray-700 font-mono text-sm text-gray-300 focus:outline-none"
                />
              </div>
            ) : previewData ? (
              <div className="w-full h-full min-h-[500px] flex flex-col space-y-4 rounded-lg bg-gray-900 border border-gray-700 p-4">
                <div className="flex-grow flex items-center justify-center bg-gray-800 rounded-md overflow-hidden min-h-[300px]">
                  {previewData.type.startsWith('image/') ? (
                    <img
                      src={previewData.url}
                      alt={`Pratinjau ${previewData.name}`}
                      className="max-w-full max-h-[400px] object-contain"
                    />
                  ) : (
                    <div className="text-center text-gray-400 p-4">
                      <ImageIcon className="w-24 h-24 mx-auto text-gray-500" />
                      <p className="mt-2 text-lg">Pratinjau tidak tersedia</p>
                      <p className="text-sm text-gray-500">
                        (Tipe file: {previewData.type || 'tidak diketahui'})
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0 p-2">
                  <p
                    className="text-lg font-medium text-white truncate"
                    title={previewData.name}
                  >
                    {previewData.name}
                  </p>
                  <p className="text-sm text-gray-400 font-mono">
                    Tipe: {previewData.type || 'tidak diketahui'}
                  </p>
                </div>
                <a
                  href={previewData.url}
                  download={previewData.name}
                  className="w-full flex-shrink-0 flex items-center justify-center gap-3 px-6 py-4 bg-gray-600 rounded-lg font-semibold text-white text-lg hover:bg-gray-700 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Download File
                </a>
              </div>
            ) : (
              <div className="w-full h-full min-h-[500px] flex items-center justify-center rounded-lg bg-gray-800/50 border border-dashed border-gray-700">
                <div className="text-center">
                  <FileText className="w-12 h-12 text-gray-600 mx-auto" />
                  <p className="mt-2 text-gray-500">
                    Hasil dekripsi akan muncul di sini...
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}