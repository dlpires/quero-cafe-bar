import { ValueTransformer } from 'typeorm';
import { encrypt, decrypt } from './encryption.utils';

export class EncryptionTransformer implements ValueTransformer {
  to(value: string | null | undefined): string {
    if (typeof value !== 'string' || value.length === 0) {
      throw new Error(
        'EncryptionTransformer: valor inválido para criptografia',
      );
    }
    return encrypt(value);
  }

  from(value: string | null | undefined): string {
    if (typeof value !== 'string' || value.length === 0) {
      throw new Error(
        'EncryptionTransformer: valor inválido para descriptografia',
      );
    }
    return decrypt(value);
  }
}
