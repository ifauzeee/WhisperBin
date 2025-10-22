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
  const [statusText, setStatusText] = useState('Waiting for code and password...');
  const [statusType, setStatusType] = useState<StatusType>('idle');
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [decryptedText, setDecryptedText] = useState<string | null>(null);

  const workerRef = useRef<Worker | null>(null);

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
          setStatusText(`Text decryption successful! Text "${filename}" is displayed.`);
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
            `File decryption successful! Preview for file "${filename}" is available.`
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

  const handleDecrypt = () => {
    if (!inputCode) {
      setStatusText('ERROR: Base64 Code cannot be empty.');
      setStatusType('error');
      return;
    }

    const needsPassword = inputCode.startsWith('P:') || !inputCode.includes(':');

    if (needsPassword && !password) {
      setStatusText('ERROR: Password is required for this code.');
      setStatusType('error');
      return;
    }

    setStatusType('loading');
    if (previewData) {
      URL.revokeObjectURL(previewData.url);
    }
    setPreviewData(null);
    setDecryptedText(null);

    setStatusText('Sending data to worker...');
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
          <h1 className="text-3xl font-bold">Decrypt Data</h1>
          <p className="text-gray-400">
            Reveal your secret file or text.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-16">
        <div className="space-y-8">
          <div>
            <label
              htmlFor="input-code"
              className="block mb-3 text-lg font-medium text-gray-300"
            >
              Paste Base64 Code
            </label>
            <div className="relative">
              <FileText className="absolute left-4 top-4 w-5 h-5 text-gray-500" />
              <textarea
                id="input-code"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                className="w-full h-40 pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg font-mono text-xs focus:border-green-500 focus:ring-green-500 focus:outline-none"
                placeholder="Paste code (P:data... or K:data...)"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password-dec"
              className="block mb-3 text-lg font-medium text-gray-300"
            >
              Enter Password (If Required)
            </label>
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                id="password-dec"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-gray-800 border border-gray-700 rounded-lg text-lg focus:border-green-500 focus:ring-green-500 focus:outline-none"
                placeholder="Enter the corresponding password..."
              />
            </div>
          </div>

          <button
            onClick={handleDecrypt}
            disabled={statusType === 'loading'}
            className="w-full flex items-center justify-center gap-3 px-6 py-5 bg-green-600 rounded-lg font-semibold text-white text-lg hover:bg-green-700 disabled:bg-gray-600 disabled:text-gray-400 transition-all duration-300"
          >
            <Check className="w-5 h-5" />
            {statusType === 'loading' ? 'Processing...' : 'Start Decryption'}
          </button>

          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mt-6">
            <label className="text-sm font-medium text-gray-300">
              Process Status:
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
            Decryption Result
          </label>
          <div className="relative w-full h-full flex-grow min-h-[500px]">
            {decryptedText ? (
              <div className="w-full h-full flex flex-col space-y-4 rounded-lg bg-gray-900 border border-gray-700 p-4">
                <div className="flex items-center gap-3 px-2">
                  <Type className="w-5 h-5 text-gray-400" />
                  <h3 className="text-lg font-medium">Text Result</h3>
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
                      alt={`Preview ${previewData.name}`}
                      className="max-w-full max-h-[400px] object-contain"
                    />
                  ) : (
                    <div className="text-center text-gray-400 p-4">
                      <ImageIcon className="w-24 h-24 mx-auto text-gray-500" />
                      <p className="mt-2 text-lg">Preview not available</p>
                      <p className="text-sm text-gray-500">
                        (File type: {previewData.type})
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
                    Type: {previewData.type || 'unknown'}
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
                    Decryption results will appear here...
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