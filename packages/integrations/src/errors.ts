/**
 * Integration errors
 */

export class IntegrationError extends Error {
  constructor(
    message: string,
    public readonly code: string = 'INTEGRATION_ERROR',
    public readonly details?: any
  ) {
    super(message);
    this.name = 'IntegrationError';
  }
}

export class AuthenticationError extends IntegrationError {
  constructor(message: string, public readonly credentials?: any) {
    super(message, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class ApiError extends IntegrationError {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly response?: any
  ) {
    super(message, 'API_ERROR');
    this.name = 'ApiError';
  }
}

export class MappingError extends IntegrationError {
  constructor(message: string, public readonly field?: string) {
    super(message, 'MAPPING_ERROR');
    this.name = 'MappingError';
  }
}
