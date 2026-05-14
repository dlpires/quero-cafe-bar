import * as crypto from 'crypto';
import { encrypt, decrypt } from './encryption.utils';

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
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...ORIGINAL_ENV, ENCRYPTION_KEY: 'test-key-32-characters-long-1234' };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  describe('encrypt', () => {
    it('deve criptografar uma string com sucesso (Happy Path)', () => {
      const result = encrypt('senha123');

      expect(result).toBeDefined();
      expect(result).toContain(':');
      expect(crypto.createCipheriv).toHaveBeenCalled();
    });

    it('não deve lançar erro com qualquer valor de ENCRYPTION_KEY', () => {
      process.env.ENCRYPTION_KEY = 'outra_chave_32_bytes_qualquer_12345';
      expect(() => encrypt('test')).not.toThrow();
    });
  });

  describe('decrypt', () => {
    it('deve lançar erro quando formato de hash é inválido', () => {
      expect(() => decrypt('invalid-hash-without-colon')).toThrow(
        'Formato de hash inválido',
      );
    });

    it('deve lançar erro quando hash é string vazia', () => {
      expect(() => decrypt('')).toThrow('Formato de hash inválido');
    });

    it('deve descriptografar uma string criptografada (Happy Path)', () => {
      const encryptedText = 'abcd1234:ef567890';
      const result = decrypt(encryptedText);

      expect(result).toBeDefined();
      expect(crypto.createDecipheriv).toHaveBeenCalled();
    });
  });
});
