import { EncryptionTransformer } from './encryption.transformer';
import * as encryptionUtils from './encryption.utils';

jest.mock('./encryption.utils', () => ({
  encrypt: jest.fn(),
  decrypt: jest.fn(),
}));

describe('EncryptionTransformer', () => {
  let transformer: EncryptionTransformer;

  beforeEach(() => {
    transformer = new EncryptionTransformer();
    jest.clearAllMocks();
  });

  describe('to (Encrypt)', () => {
    it('deve criptografar valor quando fornecido (Happy Path)', () => {
      // Arrange
      const plainText = 'senha123';
      const encryptedText = 'iv:encrypted:tag';
      (encryptionUtils.encrypt as jest.Mock).mockReturnValue(encryptedText);

      // Act
      const result = transformer.to(plainText);

      // Assert
      expect(encryptionUtils.encrypt).toHaveBeenCalledWith(plainText);
      expect(result).toBe(encryptedText);
    });

    it('deve lançar erro quando valor é null (Edge Case)', () => {
      // Act & Assert
      expect(() => transformer.to(null)).toThrow(
        'EncryptionTransformer: valor inválido para criptografia',
      );
      expect(encryptionUtils.encrypt).not.toHaveBeenCalled();
    });

    it('deve lançar erro quando valor é undefined (Edge Case)', () => {
      // Act & Assert
      expect(() => transformer.to(undefined)).toThrow(
        'EncryptionTransformer: valor inválido para criptografia',
      );
      expect(encryptionUtils.encrypt).not.toHaveBeenCalled();
    });

    it('deve lançar erro quando string vazia (Edge Case)', () => {
      // Act & Assert
      expect(() => transformer.to('')).toThrow(
        'EncryptionTransformer: valor inválido para criptografia',
      );
      expect(encryptionUtils.encrypt).not.toHaveBeenCalled();
    });
  });

  describe('from (Decrypt)', () => {
    it('deve descriptografar valor quando fornecido (Happy Path)', () => {
      // Arrange
      const encryptedText = 'iv:encrypted:tag';
      const decryptedText = 'senha123';
      (encryptionUtils.decrypt as jest.Mock).mockReturnValue(decryptedText);

      // Act
      const result = transformer.from(encryptedText);

      // Assert
      expect(encryptionUtils.decrypt).toHaveBeenCalledWith(encryptedText);
      expect(result).toBe(decryptedText);
    });

    it('deve lançar erro quando valor é null (Edge Case)', () => {
      // Act & Assert
      expect(() => transformer.from(null)).toThrow(
        'EncryptionTransformer: valor inválido para descriptografia',
      );
      expect(encryptionUtils.decrypt).not.toHaveBeenCalled();
    });

    it('deve lançar erro quando valor é undefined (Edge Case)', () => {
      // Act & Assert
      expect(() => transformer.from(undefined)).toThrow(
        'EncryptionTransformer: valor inválido para descriptografia',
      );
      expect(encryptionUtils.decrypt).not.toHaveBeenCalled();
    });

    it('deve lançar erro quando string vazia (Edge Case)', () => {
      // Act & Assert
      expect(() => transformer.from('')).toThrow(
        'EncryptionTransformer: valor inválido para descriptografia',
      );
      expect(encryptionUtils.decrypt).not.toHaveBeenCalled();
    });
  });
});
