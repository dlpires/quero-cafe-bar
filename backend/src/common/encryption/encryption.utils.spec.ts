import * as crypto from 'crypto';
import { encrypt, decrypt } from './encryption.utils';

// Mock do módulo crypto
jest.mock('crypto', () => {
  const mockCipher = {
    update: jest.fn().mockReturnValue(Buffer.from('encrypted')),
    final: jest.fn().mockReturnValue(Buffer.from('')),
    getAuthTag: jest.fn().mockReturnValue(Buffer.from('tag')),
  };

  const mockDecipher = {
    setAuthTag: jest.fn(),
    update: jest.fn().mockReturnValue(Buffer.from('decrypted')),
    final: jest.fn().mockReturnValue(Buffer.from('')),
  };

  return {
    ...jest.requireActual('crypto'),
    createCipheriv: jest.fn().mockReturnValue(mockCipher),
    createDecipheriv: jest.fn().mockReturnValue(mockDecipher),
    randomBytes: jest.fn().mockReturnValue(Buffer.from('iv')),
  };
});

describe('Encryption Utils', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      ENCRYPTION_KEY: 'test-key-32-characters-long-1234',
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('encrypt', () => {
    it('deve criptografar uma string com sucesso (Happy Path)', () => {
      const result = encrypt('senha123');

      expect(result).toBeDefined();
      expect(result).toContain(':'); // Formato: iv:encrypted:tag
      expect(crypto.createCipheriv).toHaveBeenCalled();
    });

    it('deve usar chave padrão quando ENCRYPTION_KEY não está definida', () => {
      const originalKey = process.env.ENCRYPTION_KEY;
      delete process.env.ENCRYPTION_KEY;

      expect(() => encrypt('test')).not.toThrow();

      process.env.ENCRYPTION_KEY = originalKey;
    });
  });

  describe('decrypt', () => {
    it('deve descriptografar uma string criptografada (Happy Path)', () => {
      const encryptedText = 'abcd1234:ef567890';

      const result = decrypt(encryptedText);

      expect(result).toBeDefined();
      expect(crypto.createDecipheriv).toHaveBeenCalled();
    });

    it('deve usar chave padrão quando ENCRYPTION_KEY não está definida', () => {
      const originalKey = process.env.ENCRYPTION_KEY;
      delete process.env.ENCRYPTION_KEY;

      const encryptedText = 'abcd1234:ef567890';
      expect(() => decrypt(encryptedText)).not.toThrow();

      process.env.ENCRYPTION_KEY = originalKey;
    });
  });
});
