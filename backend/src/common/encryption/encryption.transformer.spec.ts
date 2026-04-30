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

    it('deve retornar null quando valor é null (Edge Case)', () => {
      // Act
      const result = transformer.to(null);

      // Assert
      expect(result).toBeNull();
      expect(encryptionUtils.encrypt).not.toHaveBeenCalled();
    });

    it('deve retornar undefined quando valor é undefined (Edge Case)', () => {
      // Act
      const result = transformer.to(undefined);

      // Assert
      expect(result).toBeUndefined();
      expect(encryptionUtils.encrypt).not.toHaveBeenCalled();
    });

    it('deve retornar valor vazio quando string vazia (Edge Case)', () => {
      // Arrange
      const emptyString = '';
      (encryptionUtils.encrypt as jest.Mock).mockReturnValue('');

      // Act
      const result = transformer.to(emptyString);

      // Assert
      expect(result).toBe('');
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

    it('deve retornar null quando valor é null (Edge Case)', () => {
      // Act
      const result = transformer.from(null);

      // Assert
      expect(result).toBeNull();
      expect(encryptionUtils.decrypt).not.toHaveBeenCalled();
    });

    it('deve retornar undefined quando valor é undefined (Edge Case)', () => {
      // Act
      const result = transformer.from(undefined);

      // Assert
      expect(result).toBeUndefined();
      expect(encryptionUtils.decrypt).not.toHaveBeenCalled();
    });

    it('deve retornar valor vazio quando string vazia (Edge Case)', () => {
      // Arrange
      const emptyString = '';
      (encryptionUtils.decrypt as jest.Mock).mockReturnValue('');

      // Act
      const result = transformer.from(emptyString);

      // Assert
      expect(result).toBe('');
      expect(encryptionUtils.decrypt).not.toHaveBeenCalled();
    });
  });
});
