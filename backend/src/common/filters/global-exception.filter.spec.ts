import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { GlobalExceptionFilter } from './global-exception.filter';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockResponse: any;
  let mockHost: any;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockResponse = {
      status: mockStatus,
    };
    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
      }),
    };
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deve retornar 500 para exception desconhecida (não HttpException)', () => {
    filter.catch('string error', mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Erro interno do servidor',
      }),
    );
  });

  it('deve extrair mensagem de HttpException com resposta string', () => {
    const exception = new HttpException('Custom error', HttpStatus.BAD_REQUEST);
    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Custom error',
      }),
    );
  });

  it('deve extrair mensagem de HttpException com objeto message única', () => {
    const exception = new HttpException(
      { message: 'Validation failed' },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        message: 'Validation failed',
      }),
    );
  });

  it('deve juntar array de mensagens de HttpException com ponto e vírgula', () => {
    const exception = new HttpException(
      { message: ['campo obrigatório', 'valor inválido'] },
      HttpStatus.BAD_REQUEST,
    );
    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'campo obrigatório; valor inválido',
      }),
    );
  });

  it('deve logar erro e retornar 500 para Error comum (não HttpException)', () => {
    const error = new Error('Database connection failed');
    filter.catch(error, mockHost);

    expect(Logger.prototype.error).toHaveBeenCalledWith(
      'Unhandled error: Database connection failed',
      error.stack,
    );
    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Erro interno do servidor',
      }),
    );
  });

  it('deve usar fallback "Erro interno do servidor" quando HttpException não tem message', () => {
    const exception = new HttpException(
      { details: 'some detail' },
      HttpStatus.CONFLICT,
    );
    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.CONFLICT,
        message: 'Erro interno do servidor',
      }),
    );
  });

  it('deve incluir timestamp na resposta', () => {
    const exception = new HttpException('Test', HttpStatus.OK);
    filter.catch(exception, mockHost);

    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        timestamp: expect.any(String),
      }),
    );
  });
});
