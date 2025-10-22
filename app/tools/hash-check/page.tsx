'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  FileUp,
  FileCheck,
  Check,
  Copy,
  Package,
} from 'lucide-react';

type StatusType = 'idle' | 'loading' | 'success' | 'error';

export default function HashCheckPage() {
  const [file, setFile] = useState<File | null>(null);
  const [hash, setHash] = useState('');
  const [statusText, setStatusText] =
    useState('Waiting for file to calculate...');
  const [statusType, setStatusType] = useState<StatusType>('idle');
  const [showCopyAlert, setShowCopyAlert] = useState(false);

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

  const bufferToHex = (buffer: ArrayBuffer): string => {
    return Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const copyToClipboard = () => {
    if (!hash || showCopyAlert) return;
    navigator.clipboard.writeText(hash);
    setShowCopyAlert(true);
    setStatusText('Hash copied to clipboard!');
    setStatusType('success');
    setTimeout(() => {
      setShowCopyAlert(false);
      if (statusType === 'success') {
        setStatusText(`Hash successfully calculated for ${file?.name}.`);
      }
    }, 2000);
  };

  const handleCalculateHash = async () => {
    if (!file) {
      setStatusText('ERROR: File cannot be empty.');
      setStatusType('error');
      return;
    }

    setStatusType('loading');
    setHash('');

    try {
      setStatusText('Reading file...');
      const fileBuffer = await file.arrayBuffer();

      setStatusText('Calculating SHA-256 hash (crypto.subtle)...');
      const hashBuffer = await crypto.subtle.digest('SHA-256', fileBuffer);

      setStatusText('Converting hash to Hex format...');
      const hexHash = bufferToHex(hashBuffer);

      setHash(hexHash);
      setStatusText(`Hash successfully calculated for ${file.name}.`);
      setStatusType('success');
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Unknown error';
      setStatusText(`ERROR: ${message}`);
      setStatusType('error');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold">File Integrity Check</h1>
          <p className="text-gray-400">
            Calculate the SHA-256 hash to verify a file.
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
              htmlFor="file-upload"
              className="block mb-3 text-lg font-medium text-gray-300"
            >
              Select File
            </label>
            <label
              htmlFor="file-upload"
              className="w-full flex items-center gap-3 px-6 py-5 bg-gray-800 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-gray-700/50 transition-colors"
            >
              <FileUp className="w-6 h-6 text-blue-400" />
              <span className="text-lg text-gray-300 truncate">
                {file ? file.name : 'Click to select a file...'}
              </span>
            </label>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>

          <button
            onClick={handleCalculateHash}
            disabled={statusType === 'loading'}
            className="w-full flex items-center justify-center gap-3 px-6 py-5 bg-blue-600 rounded-lg font-semibold text-white text-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:text-gray-400 transition-all duration-300"
          >
            <FileCheck className="w-5 h-5" />
            {statusType === 'loading' ? 'Processing...' : 'Calculate Hash'}
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
          <label
            htmlFor="output-hash"
            className="block mb-3 text-lg font-medium text-gray-300"
          >
            Hash Result (SHA-256)
          </label>

          <div className="relative w-full h-full flex-grow">
            {!hash && (
              <div className="w-full h-full min-h-[300px] lg:min-h-[500px] flex items-center justify-center rounded-lg bg-gray-800/50 border border-dashed border-gray-700">
                <div className="text-center">
                  <Package className="w-12 h-12 text-gray-600 mx-auto" />
                  <p className="mt-2 text-gray-500">
                    The SHA-256 hash will appear here...
                  </p>
                </div>
              </div>
            )}

            {hash && (
              <div className="relative w-full h-full">
                <textarea
                  id="output-hash"
                  readOnly
                  value={hash}
                  className="w-full h-full min-h-[300px] lg:min-h-[500px] p-4 rounded-lg bg-gray-900 border border-gray-700 font-mono text-sm text-gray-300 focus:outline-none"
                  placeholder="Hash will appear here..."
                />

                <button
                  onClick={copyToClipboard}
                  title="Copy Hash"
                  className="absolute top-4 right-4 p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                  disabled={showCopyAlert}
                >
                  {showCopyAlert ? (
                    <Check className="w-5 h-5 text-green-400" />
                  ) : (
                    <Copy className="w-5 h-5 text-gray-300" />
                  )}
                </button>
                
                {showCopyAlert && (
                  <div 
                    className="absolute top-16 right-4 px-3 py-1 bg-green-600 text-white text-sm rounded-md shadow-lg"
                  >
                    Copied!
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}