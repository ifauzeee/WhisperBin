/// <reference lib="webworker" />

import {
  deriveKey,
  bufferToBase64URL,
  base64URLToBuffer,
} from './crypto';

const postStatus = (message: string) => {
  self.postMessage({ type: 'status', message });
};

const handleEncrypt = async (payload: {
  fileBuffer: ArrayBuffer;
  filename: string;
  fileType: string;
  password: string;
}) => {
  const { fileBuffer, filename, fileType, password } = payload;
  let key: CryptoKey;
  let b64SaltOrKey: string;
  let prefix: 'P' | 'K';

  const iv = crypto.getRandomValues(new Uint8Array(12));

  if (password) {
    prefix = 'P';
    postStatus('Mempersiapkan salt...');
    const salt = crypto.getRandomValues(new Uint8Array(16));
    postStatus('Menurunkan kunci dari password (PBKDF2)...');
    key = await deriveKey(password, salt, 'encrypt');
    b64SaltOrKey = bufferToBase64URL(salt.buffer);
  } else {
    prefix = 'K';
    postStatus('Membuat kunci acak...');
    key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt']
    );
    const exportedKey = await crypto.subtle.exportKey('raw', key);
    b64SaltOrKey = bufferToBase64URL(exportedKey);
  }

  postStatus('Mempersiapkan metadata terenkripsi...');
  const meta = { name: filename, type: fileType };
  const metaBuffer = new TextEncoder().encode(JSON.stringify(meta));
  const metaLengthBuffer = new Uint32Array([metaBuffer.byteLength]).buffer;

  const combinedBuffer = new Uint8Array(
    metaLengthBuffer.byteLength + metaBuffer.byteLength + fileBuffer.byteLength
  );
  combinedBuffer.set(new Uint8Array(metaLengthBuffer), 0);
  combinedBuffer.set(new Uint8Array(metaBuffer), 4);
  combinedBuffer.set(new Uint8Array(fileBuffer), 4 + metaBuffer.byteLength);

  postStatus('Mengenkripsi data (AES-GCM)...');
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    combinedBuffer.buffer
  );

  postStatus('Mengonversi ke Base64 URL Safe...');
  const b64Iv = bufferToBase64URL(iv.buffer);
  const b64Data = bufferToBase64URL(encryptedBuffer);

  postStatus('Menggabungkan data...');
  const combinedCode = `${prefix}:${b64SaltOrKey}.${b64Iv}.${b64Data}`;

  return { code: combinedCode };
};

const handleDecrypt = async (payload: {
  inputCode: string;
  password: string;
}) => {
  const { inputCode, password } = payload;
  let type: 'P' | 'K' = 'P';
  let dataString = inputCode;

  if (inputCode.includes(':')) {
    const parts = inputCode.split(':', 2);
    type = parts[0] as 'P' | 'K';
    dataString = parts[1];
    postStatus(
      `Mendeteksi format: ${
        type === 'P' ? 'Dilindungi Password' : 'Kunci Tersemat'
      }`
    );
  } else {
    postStatus('Mendeteksi format lama (Dilindungi Password)...');
  }

  postStatus('Mem-parsing kode Base64...');
  const dataParts = dataString.split('.');

  let b64SaltOrKey: string,
    b64Iv: string,
    b64Data: string;
  let b64Filename_legacy: string | undefined,
    b64FileType_legacy: string | undefined;
  let isLegacyFormat = false;

  if (dataParts.length === 3) {
    [b64SaltOrKey, b64Iv, b64Data] = dataParts;
    isLegacyFormat = false;
    postStatus('Mendeteksi format aman (metadata terenkripsi)...');
  } else if (dataParts.length === 5) {
    [
      b64Filename_legacy,
      b64FileType_legacy,
      b64SaltOrKey,
      b64Iv,
      b64Data,
    ] = dataParts;
    isLegacyFormat = true;
    postStatus('Mendeteksi format lama (metadata terlihat)...');
  } else {
    throw new Error('Format kode tidak valid (harus 3 atau 5 bagian).');
  }

  let key: CryptoKey;

  if (type === 'P') {
    if (!password) {
      throw new Error('Password dibutuhkan untuk mendekripsi file ini.');
    }
    postStatus('Menurunkan kunci dari password (PBKDF2)...');
    const saltBuffer = base64URLToBuffer(b64SaltOrKey);
    key = await deriveKey(
      password,
      new Uint8Array(saltBuffer as ArrayBuffer),
      'decrypt'
    );
  } else {
    if (password) {
      postStatus('Info: Password diabaikan (file ini tidak terproteksi).');
    }
    postStatus('Membaca kunci tersemat...');
    const keyBuffer = base64URLToBuffer(b64SaltOrKey);
    key = await crypto.subtle.importKey(
      'raw',
      keyBuffer as ArrayBuffer,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );
  }

  postStatus('Membaca data terenkripsi...');
  const ivBuffer = base64URLToBuffer(b64Iv);
  const dataBuffer = base64URLToBuffer(b64Data);

  postStatus('Mendekripsi file (AES-GCM)...');
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(ivBuffer as ArrayBuffer) },
    key,
    dataBuffer as ArrayBuffer
  );

  postStatus('Decoding metadata file...');
  let filename: string;
  let fileType: string;
  let finalFileBuffer: ArrayBuffer;

  if (isLegacyFormat && b64Filename_legacy && b64FileType_legacy) {
    filename = new TextDecoder().decode(base64URLToBuffer(b64Filename_legacy));
    fileType = new TextDecoder().decode(base64URLToBuffer(b64FileType_legacy));
    finalFileBuffer = decryptedBuffer;
  } else {
    const metaLengthView = new Uint32Array(decryptedBuffer.slice(0, 4));
    const metaLength = metaLengthView[0];

    const metaBuffer = decryptedBuffer.slice(4, 4 + metaLength);
    const metaString = new TextDecoder().decode(metaBuffer);
    const meta = JSON.parse(metaString);

    filename = meta.name;
    fileType = meta.type;

    finalFileBuffer = decryptedBuffer.slice(4 + metaLength);
  }

  return { decryptedBuffer: finalFileBuffer, filename, fileType };
};

self.onmessage = async (event: MessageEvent) => {
  const { action, payload } = event.data;
  try {
    if (action === 'encrypt') {
      const result = await handleEncrypt(payload);
      self.postMessage({ type: 'success', action: 'encrypt', payload: result });
    } else if (action === 'decrypt') {
      const result = await handleDecrypt(payload);
      self.postMessage(
        { type: 'success', action: 'decrypt', payload: result },
        [result.decryptedBuffer]
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Worker error';
    if (message.toLowerCase().includes('decrypt') || message.toLowerCase().includes('key')) {
        self.postMessage({ type: 'error', message: 'Dekripsi gagal. Kemungkinan password salah atau data korup.' });
    } else {
        self.postMessage({ type: 'error', message });
    }
  }
};