// lib/hash.ts
export const bufferToHex = (buffer: ArrayBuffer): string => {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

export const calculateSHA256 = async (
  file: File,
  onProgress: (status: string) => void
): Promise<string> => {
  onProgress(`Membaca file: ${file.name}...`);
  const fileBuffer = await file.arrayBuffer();

  onProgress('Menghitung hash SHA-256 (crypto.subtle)...');
  const hashBuffer = await crypto.subtle.digest('SHA-256', fileBuffer);

  onProgress('Mengonversi hash ke format Hex...');
  const hexHash = bufferToHex(hashBuffer);
  return hexHash;
};