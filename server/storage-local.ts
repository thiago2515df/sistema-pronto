// Sistema de armazenamento local alternativo
// Salva imagens no sistema de arquivos e serve via HTTP

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomBytes } from 'crypto';

const UPLOAD_DIR = join(process.cwd(), 'uploads');
const PUBLIC_URL_BASE = process.env.PUBLIC_URL || 'http://localhost:3000';

// Garantir que o diretório de uploads existe
async function ensureUploadDir() {
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
  } catch (error) {
    // Diretório já existe
  }
}

/**
 * Salva um arquivo no sistema de arquivos local
 * @param relKey - Caminho relativo do arquivo
 * @param data - Dados do arquivo (Buffer, Uint8Array ou string base64)
 * @param contentType - Tipo MIME do arquivo
 * @returns Objeto com key e url pública do arquivo
 */
export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  await ensureUploadDir();
  
  // Usar o relKey como caminho do arquivo
  const filePath = join(UPLOAD_DIR, relKey);
  
  // Garantir que o diretório existe
  await mkdir(join(UPLOAD_DIR, relKey, '..'), { recursive: true });
  
  // Converter dados se necessário
  let buffer: Buffer;
  if (typeof data === 'string') {
    // Assumir que é base64
    buffer = Buffer.from(data, 'base64');
  } else if (data instanceof Uint8Array) {
    buffer = Buffer.from(data);
  } else {
    buffer = data;
  }
  
  // Salvar arquivo
  await writeFile(filePath, buffer);
  
  // Retornar URL pública
  const url = `${PUBLIC_URL_BASE}/uploads/${relKey}`;
  
  return {
    key: relKey,
    url
  };
}

/**
 * Obtém a URL de um arquivo já armazenado
 * @param relKey - Chave/nome do arquivo
 * @returns Objeto com key e url pública do arquivo
 */
export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const url = `${PUBLIC_URL_BASE}/uploads/${relKey}`;
  return {
    key: relKey,
    url
  };
}

/**
 * Obtém a extensão do arquivo baseado no tipo MIME
 */
function getExtensionFromMimeType(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/svg+xml': '.svg',
    'image/bmp': '.bmp',
    'application/pdf': '.pdf',
    'text/plain': '.txt',
    'application/json': '.json',
  };
  
  return mimeToExt[mimeType] || '';
}
