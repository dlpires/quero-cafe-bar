import * as crypto from 'crypto';
import * as dotenv from 'dotenv';

// Load environment variables from a .env file
dotenv.config();

const algorithm = 'aes-256-ctr';
const secretKey = Buffer.from(
  process.env.ENCRYPTION_KEY || 'default_secret_key_32_characters',
  'utf8',
);

export const encrypt = (text: string): string => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final(),
  ]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

export const decrypt = (hash: string): string => {
  const [ivHex, encryptedHex] = hash.split(':');
  if (!ivHex || !encryptedHex) {
    throw new Error('Formato de hash inválido');
  }
  const decipher = crypto.createDecipheriv(
    algorithm,
    secretKey,
    Buffer.from(ivHex, 'hex'),
  );
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, 'hex')),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
};
