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
} from 'lucide-react';
import zxcvbn from 'zxcvbn';

type StatusType = 'idle' | 'loading' | 'success' | 'error';
type EncryptType = 'file' | 'text';

export default function EncryptPage() {
  const [file, setFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState('');
  const [encryptType, setEncryptType] = useState<EncryptType>('file');

  const [usePassword, setUsePassword] = useState(true);
  const [password, setPassword] = useState('');

  const [passwordScore, setPasswordScore] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState<string | null>(null);
  const [statusText, setStatusText] = useState('Waiting for file and password...');
  const [statusType, setStatusType] = useState<StatusType>('idle');
  const [outputCode, setOutputCode] = useState('');
  const [showCopyAlert, setShowCopyAlert] = useState(false);

  const workerRef = useRef<Worker | null>(null);

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
        setStatusText('Encryption successful! Copy the code below.');
        setStatusType('success');
      } else if (type === 'error') {
        setStatusText(`ERROR: ${message}`);
        setStatusType('error');
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

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

  const handlePasswordChange = (pass: string) => {
    setPassword(pass);
    if (pass.length > 0) {
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
        return 'bg-red-500';
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
    navigator.clipboard.writeText(outputCode);
    setShowCopyAlert(true);
    setStatusText('Code copied to clipboard!');
    setStatusType('success');
    setTimeout(() => {
      setShowCopyAlert(false);
      if (statusType === 'success') {
        setStatusText('Encryption successful! Copy the code below.');
      }
    }, 2000);
  };

  const handleEncrypt = async () => {
    if (
      (encryptType === 'file' && !file) ||
      (encryptType === 'text' && !textInput)
    ) {
      setStatusText('ERROR: File or Text cannot be empty.');
      setStatusType('error');
      return;
    }

    if (usePassword && !password) {
      setStatusText('ERROR: Password cannot be empty if protection is enabled.');
      setStatusType('error');
      return;
    }

    setStatusType('loading');
    setOutputCode('');

    try {
      let fileBuffer: ArrayBuffer;
      let filename: string;
      let fileType: string;

      if (encryptType === 'file' && file) {
        setStatusText('Reading file...');
        fileBuffer = await file.arrayBuffer();
        filename = file.name;
        fileType = file.type || 'application/octet-stream';
      } else {
        setStatusText('Encoding text...');
        fileBuffer = new TextEncoder().encode(textInput).buffer;
        filename = 'message.txt';
        fileType = 'text/plain';
      }

      setStatusText('Sending data to worker...');
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

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold">Encrypt Data</h1>
          <p className="text-gray-400">
            Secure your file or text with a password.
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
            <label className="block mb-3 text-lg font-medium text-gray-300">
              Data Type
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
                <span className="font-medium">Text</span>
              </button>
            </div>
          </div>

          
          {encryptType === 'file' ? (
            <div>
              <label
                htmlFor="file-upload"
                className="block mb-3 text-lg font-medium text-gray-300"
              >
                Select File
              </label>
              <label
                htmlFor="file-upload"
                className="w-full flex items-center gap-3 px-6 py-5 bg-gray-800 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-gray-700/ ৫০ transition-colors"
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
          ) : (
            <div>
              <label
                htmlFor="text-input"
                className="block mb-3 text-lg font-medium text-gray-300"
              >
                Enter Text
              </label>
              <textarea
                id="text-input"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="w-full h-40 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                placeholder="Paste your secret text here..."
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
                Protect with Password
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
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-gray-800 border border-gray-700 rounded-lg text-lg focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                    placeholder="Enter a strong password..."
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
                Encryption will be created without a password. Anyone with the code can open it.
              </p>
            )}
          </div>
          


          <button
            onClick={handleEncrypt}
            disabled={statusType === 'loading'}
            className="w-full flex items-center justify-center gap-3 px-6 py-5 bg-blue-600 rounded-lg font-semibold text-white text-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:text-gray-400 transition-all duration-300"
          >
            <Zap className="w-5 h-5" />
            {statusType === 'loading' ? 'Processing...' : 'Start Encryption'}
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
            htmlFor="output-code"
            className="block mb-3 text-lg font-medium text-gray-300"
          >
            Generated Base64 Code
          </label>

          <div className="relative w-full h-full flex-grow">
            {!outputCode && (
              <div className="w-full h-full min-h-[500px] flex items-center justify-center rounded-lg bg-gray-800/50 border border-dashed border-gray-700">
                <div className="text-center">
                  <Package className="w-12 h-12 text-gray-600 mx-auto" />
                  <p className="mt-2 text-gray-500">
                    The Base64 code will appear here...
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
                
                <button
                  onClick={copyToClipboard}
                  title="Copy Code"
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