import { environment } from './environment';

describe('Environment', () => {
  it('deve ter production como false em dev', () => {
    expect(environment.production).toBe(false);
  });

  it('deve ter apiUrl definida', () => {
    expect(environment.apiUrl).toBeTruthy();
    expect(environment.apiUrl).toContain('http://');
  });

  it('deve apontar para localhost:3001 por padrão', () => {
    expect(environment.apiUrl).toBe('http://localhost:3001');
  });
});
