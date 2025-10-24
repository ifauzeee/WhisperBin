// /app/encrypt/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  KeyRound,
  FileUp,
  Copy,
  Zap,
  Package,
  FileText,
  Check,
  ShieldCheck,
  ShieldOff,
  Download,
  QrCode,
  X,
  FileCheck,
  Link as LinkIcon,
} from 'lucide-react';
// Hapus import statis zxcvbn dan jszip
import QRCode from 'qrcode';
import * as pako from 'pako';
import { bufferToBase64URL } from '../../lib/crypto';
import { calculateSHA256 } from '../../lib/hash';

type StatusType = 'idle' | 'loading' | 'success' | 'error';
type EncryptType = 'file' | 'text';

const LARGE_FILE_THRESHOLD = 1 * 1024 * 1024 * 1024; // 1 GB

export default function EncryptPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [textInput, setTextInput] = useState('');
  const [encryptType, setEncryptType] = useState<EncryptType>('file');
  const [usePassword, setUsePassword] = useState(true);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordScore, setPasswordScore] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState<string | null>(null);
  const [statusText, setStatusText] = useState('Menunggu file dan password...');
  const [statusType, setStatusType] = useState<StatusType>('idle');
  const [outputCode, setOutputCode] = useState('');
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [originalFileHash, setOriginalFileHash] = useState('');
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);

  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../../lib/crypto.worker.ts', import.meta.url)
    );

    workerRef.current.onmessage = (event: MessageEvent) => {
      const { type, action, payload, message } = event.data;

      if (type === 'status') {
        setStatusText(message);
      } else if (type === 'success' && action === 'encrypt') {
        setOutputCode(payload.code);
        setStatusText(
          'Enkripsi berhasil! Salin kode atau download file .txt.'
        );
        setStatusType('success');

        try {
          const blob = new Blob([payload.code], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          setDownloadUrl(url);
        } catch (err) {
          console.error('Failed to create download URL:', err);
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
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [downloadUrl]);

  useEffect(() => {
    setShowQRModal(false);
    setQrDataUrl('');
  }, [outputCode]);

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

  /**
   * Menghitung skor password secara dinamis menggunakan dynamic import zxcvbn.
   * @param pass Password yang diinput.
   */
  const handlePasswordChange = async (pass: string) => {
    setPassword(pass);
    if (pass.length > 0) {
      const zxcvbn = (await import('zxcvbn')).default;
      const result = zxcvbn(pass);
      setPasswordScore(result.score);
      setPasswordFeedback(result.feedback.warning || null);
    } else {
      setPasswordScore(0);
      setPasswordFeedback(null);
    }
  };

  const getPasswordColor = () => {
    switch (passwordScore) {
      case 0:
      case 1:
        return 'bg-red-500';
      case 2:
        return 'bg-yellow-500';
      case 3:
        return 'bg-blue-500';
      case 4:
        return 'bg-green-500';
      default:
        return 'bg-gray-700';
    }
  };

  const copyToClipboard = () => {
    if (!outputCode || showCopyAlert) return;
    navigator.clipboard
      .writeText(outputCode)
      .then(() => {
        setShowCopyAlert(true);
        setStatusText('Kode disalin ke clipboard!');
        setStatusType('success');
        setTimeout(() => {
          setShowCopyAlert(false);
          if (statusType === 'success') {
            setStatusText(
              'Enkripsi berhasil! Salin kode atau download file .txt.'
            );
          }
        }, 2000);
      })
      .catch((err) => {
        console.error('Failed to copy text:', err);
        setStatusText(
          'ERROR: Gagal menyalin. Kode mungkin terlalu besar. Gunakan tombol download.'
        );
        setStatusType('error');
      });
  };

  const handleCopyShareLink = async () => {
    if (!outputCode || isGeneratingLink) return;

    if (outputCode.length > 3000) {
      setStatusText(
        'ERROR: Teks terlalu panjang untuk "Share Link". Gunakan "Download .txt".'
      );
      setStatusType('error');
      return;
    }

    setIsGeneratingLink(true);
    setStatusText('Membuat "Share Link"...');
    try {
      const compressedU8Array = pako.deflate(outputCode);
      const compressedBase64URL = bufferToBase64URL(compressedU8Array.buffer);

      const shareLink = `${window.location.origin}/decrypt#data=${compressedBase64URL}`;

      if (shareLink.length > 4000) {
        setStatusText(
          'ERROR: Link yang dihasilkan terlalu panjang. Gunakan "Download .txt".'
        );
        setStatusType('error');
        setIsGeneratingLink(false);
        return;
      }

      await navigator.clipboard.writeText(shareLink);

      setStatusText('"Share Link" disalin ke clipboard!');
      setStatusType('success');
      setShowCopyAlert(true);
      setTimeout(() => {
        setShowCopyAlert(false);
      }, 2000);
    } catch (err) {
      console.error('Gagal membuat share link:', err);
      setStatusText('ERROR: Gagal membuat "Share Link".');
      setStatusType('error');
    }
    setIsGeneratingLink(false);
  };

  const handleShowQR = async () => {
    if (!outputCode) return;
    if (outputCode.length > 2500) {
      setStatusText(
        'ERROR: Teks terlalu panjang untuk dibuatkan QR Code. Harap perpendek.'
      );
      setStatusType('error');
      return;
    }

    try {
      const url = await QRCode.toDataURL(outputCode, {
        width: 300,
        margin: 2,
      });
      setQrDataUrl(url);
      setShowQRModal(true);
    } catch (err) {
      console.error('QR Code generation failed:', err);
      setStatusText('ERROR: Gagal membuat QR Code.');
      setStatusType('error');
    }
  };

  /**
   * Menangani proses enkripsi, termasuk dynamic import JSZip untuk multiple file.
   */
  const handleEncrypt = async () => {
    if (
      (encryptType === 'file' && files.length === 0) ||
      (encryptType === 'text' && !textInput)
    ) {
      setStatusText('ERROR: File atau Teks tidak boleh kosong.');
      setStatusType('error');
      return;
    }

    if (usePassword && !password) {
      setStatusText(
        'ERROR: Password tidak boleh kosong jika proteksi diaktifkan.'
      );
      setStatusType('error');
      return;
    }
    if (usePassword && password !== confirmPassword) {
      setStatusText('ERROR: Password dan Konfirmasi Password tidak cocok.');
      setStatusType('error');
      return;
    }

    if (encryptType === 'file' && files.length > 0) {
      const totalSize = files.reduce((acc, file) => acc + file.size, 0);
      if (totalSize > LARGE_FILE_THRESHOLD) {
        setStatusText(
          'ERROR: Total file > 1GB. Browser mungkin akan crash. Proses dibatalkan.'
        );
        setStatusType('error');
        return;
      }
    }

    setStatusType('loading');
    setOutputCode('');

    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
    }
    setDownloadUrl(null);

    try {
      let fileBuffer: ArrayBuffer;
      let filename: string;
      let fileType: string;

      if (encryptType === 'file' && files.length > 0) {
        if (files.length === 1) {
          const file = files[0];
          setStatusText(`Membaca file: ${file.name}...`);
          fileBuffer = await file.arrayBuffer();
          filename = file.name;
          fileType = file.type || 'application/octet-stream';
        } else {
          setStatusText(
            `Mengompres ${files.length} file menjadi archive.zip...`
          );
          // Dynamic import JSZip
          const JSZip = (await import('jszip')).default;
          const zip = new JSZip();
          files.forEach((file) => {
            zip.file(file.name, file);
          });
          const zipBlob = await zip.generateAsync({
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: {
              level: 6,
            },
          });
          fileBuffer = await zipBlob.arrayBuffer();
          filename = 'archive.zip';
          fileType = 'application/zip';
        }
      } else {
        setStatusText('Encoding teks...');
        fileBuffer = new TextEncoder().encode(textInput).buffer;
        filename = 'pesan.txt';
        fileType = 'text/plain';
      }

      setStatusText('Mengirim data ke worker...');
      workerRef.current?.postMessage(
        {
          action: 'encrypt',
          payload: {
            fileBuffer,
            filename,
            fileType,
            password: usePassword ? password : '',
          },
        },
        [fileBuffer]
      );
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Unknown error';
      setStatusText(`ERROR: ${message}`);
      setStatusType('error');
    }
  };

  const getFileLabel = () => {
    if (files.length === 0) {
      return 'Klik atau Drop file di sini (bisa lebih dari 1)...';
    }
    if (files.length === 1) {
      return files[0].name;
    }
    return `${files.length} file dipilih`;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFilesSelected = (selectedFiles: File[]) => {
    if (selectedFiles.length > 0) {
      setFiles(selectedFiles);
      setEncryptType('file');
      setOriginalFileHash('');

      if (selectedFiles.length === 1) {
        const file = selectedFiles[0];
        if (file.size > LARGE_FILE_THRESHOLD) {
          setStatusText(
            'Info: File > 1GB, hash file asli dilewati (terlalu besar).'
          );
          setStatusType('idle');
        } else {
          (async () => {
            try {
              setStatusText('Menghitung hash file...');
              const hash = await calculateSHA256(file, setStatusText);
              setOriginalFileHash(hash);
              setStatusText('File dipilih dan hash dihitung. Siap enkripsi.');
              setStatusType('idle');
            } catch (e) {
              console.error('Kalkulasi hash gagal', e);
              setStatusText('File dipilih, tapi kalkulasi hash gagal.');
            }
          })();
        }
      } else {
        setStatusText(`${selectedFiles.length} file dipilih. Siap enkripsi.`);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFilesSelected(droppedFiles);
  };

  const handleFileClick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    handleFilesSelected(selectedFiles);
  };

  return (
    <>
      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold">Enkripsi Data</h1>
            <p className="text-gray-400">
              Amankan file atau teks Anda dengan password.
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
              <label className="block mb-3 text-lg font-medium text-gray-300">
                Tipe Data
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setEncryptType('file')}
                  className={`flex items-center justify-center gap-3 p-4 rounded-lg border-2 transition-all ${
                    encryptType === 'file'
                      ? 'bg-blue-600/20 border-blue-500'
                      : 'bg-gray-800 border-gray-700 hover:border-gray-500'
                  }`}
                >
                  <FileUp className="w-5 h-5" />
                  <span className="font-medium">File</span>
                </button>
                <button
                  onClick={() => setEncryptType('text')}
                  className={`flex items-center justify-center gap-3 p-4 rounded-lg border-2 transition-all ${
                    encryptType === 'text'
                      ? 'bg-blue-600/20 border-blue-500'
                      : 'bg-gray-800 border-gray-700 hover:border-gray-500'
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  <span className="font-medium">Teks</span>
                </button>
              </div>
            </div>

            {encryptType === 'file' ? (
              <div>
                <label
                  htmlFor="file-upload"
                  className="block mb-3 text-lg font-medium text-gray-300"
                >
                  Pilih File
                </label>
                <label
                  htmlFor="file-upload"
                  className={`w-full flex items-center gap-3 px-6 py-5 bg-gray-800 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    isDragging
                      ? 'border-blue-500 bg-blue-900/30'
                      : 'border-gray-700 hover:border-blue-500'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <FileUp className="w-6 h-6 text-blue-400" />
                  <span className="text-lg text-gray-300 truncate">
                    {getFileLabel()}
                  </span>
                </label>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  multiple
                  onChange={handleFileClick}
                />
                {originalFileHash && (
                  <div className="mt-4 p-4 bg-gray-800 border border-gray-700 rounded-lg space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                      <FileCheck className="w-4 h-4 text-blue-400" />
                      SHA-256 Hash (File Asli)
                    </label>
                    <p className="font-mono text-xs text-gray-400 break-all">
                      {originalFileHash}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <label
                  htmlFor="text-input"
                  className="block mb-3 text-lg font-medium text-gray-300"
                >
                  Masukkan Teks
                </label>
                <textarea
                  id="text-input"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  className="w-full h-40 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                  placeholder="Tempelkan teks rahasia Anda di sini..."
                />
              </div>
            )}

            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded text-blue-500 bg-gray-700 border-gray-600 focus:ring-blue-600"
                  checked={usePassword}
                  onChange={(e) => setUsePassword(e.target.checked)}
                />
                <span className="text-lg font-medium text-gray-300">
                  Proteksi dengan Password
                </span>
                {usePassword ? (
                  <ShieldCheck className="w-5 h-5 text-green-400" />
                ) : (
                  <ShieldOff className="w-5 h-5 text-gray-500" />
                )}
              </label>

              {usePassword && (
                <div className="animate-in fade-in duration-300 space-y-3">
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      id="password-enc"
                      type="password"
                      value={password}
                      // Memanggil fungsi async
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      className="w-full pl-14 pr-6 py-4 bg-gray-800 border border-gray-700 rounded-lg text-lg focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                      placeholder="Masukkan password yang kuat..."
                    />
                  </div>

                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      id="password-confirm"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-14 pr-6 py-4 bg-gray-800 border border-gray-700 rounded-lg text-lg focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                      placeholder="Konfirmasi password Anda..."
                    />
                  </div>

                  {password.length > 0 && (
                    <div className="space-y-2">
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${getPasswordColor()}`}
                          style={{ width: `${(passwordScore + 1) * 20}%` }}
                        ></div>
                      </div>
                      {passwordFeedback && (
                        <p className="text-sm text-yellow-400">
                          {passwordFeedback}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {!usePassword && (
                <p className="text-sm text-gray-400 animate-in fade-in duration-300">
                  Enkripsi akan dibuat tanpa password. Siapapun yang memiliki
                  kode dapat membukanya.
                </p>
              )}
            </div>

            <button
              onClick={handleEncrypt}
              disabled={statusType === 'loading'}
              className="w-full flex items-center justify-center gap-3 px-6 py-5 bg-blue-600 rounded-lg font-semibold text-white text-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:text-gray-400 transition-all duration-300"
            >
              <Zap className="w-5 h-5" />
              {statusType === 'loading'
                ? 'Memproses...'
                : 'Mulai Enkripsi'}
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
            <label
              htmlFor="output-code"
              className="block mb-3 text-lg font-medium text-gray-300"
            >
              Kode Base64 Dihasilkan
            </label>
            <div className="relative w-full h-full flex-grow">
              {!outputCode && (
                <div className="w-full h-full min-h-[500px] flex items-center justify-center rounded-lg bg-gray-800/50 border border-dashed border-gray-700">
                  <div className="text-center">
                    <Package className="w-12 h-12 text-gray-600 mx-auto" />
                    <p className="mt-2 text-gray-500">
                      Kode Base64 akan muncul di sini...
                    </p>
                  </div>
                </div>
              )}
              {outputCode && (
                <div className="relative w-full h-full">
                  <textarea
                    id="output-code"
                    readOnly
                    value={outputCode}
                    className="w-full h-full min-h-[500px] p-4 rounded-lg bg-gray-900 border border-gray-700 font-mono text-xs text-gray-300 focus:outline-none"
                  />
                  <div className="absolute top-4 right-4 flex flex-col gap-3">
                    <button
                      onClick={copyToClipboard}
                      title="Salin Kode"
                      className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                      disabled={showCopyAlert}
                    >
                      {showCopyAlert ? (
                        <Check className="w-5 h-5 text-green-400" />
                      ) : (
                        <Copy className="w-5 h-5 text-gray-300" />
                      )}
                    </button>
                    <button
                      onClick={handleCopyShareLink}
                      title="Salin Share Link"
                      className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                      disabled={isGeneratingLink}
                    >
                      <LinkIcon className="w-5 h-5 text-gray-300" />
                    </button>
                    {downloadUrl && (
                      <a
                        href={downloadUrl}
                        download="kode_enkripsi.txt"
                        title="Download Kode sebagai .txt"
                        className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        <Download className="w-5 h-5 text-gray-300" />
                      </a>
                    )}
                    {encryptType === 'text' && (
                      <button
                        onClick={handleShowQR}
                        title="Tampilkan QR Code"
                        className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        <QrCode className="w-5 h-5 text-gray-300" />
                      </button>
                    )}
                  </div>
                  {showCopyAlert && (
                    <div className="absolute top-16 right-4 px-3 py-1 bg-green-600 text-white text-sm rounded-md shadow-lg">
                      Disalin!
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showQRModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setShowQRModal(false)}
        >
          <div
            className="relative p-6 bg-gray-800 border border-gray-700 rounded-lg shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowQRModal(false)}
              className="absolute -top-4 -right-4 p-2 bg-red-600 rounded-full text-white hover:bg-red-700"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-medium text-white mb-4">
              Pindai QR Code
            </h3>
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="QR Code"
                className="w-full max-w-[300px] h-auto rounded-md"
              />
            ) : (
              <p className="text-gray-400">Memuat QR Code...</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}