export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class GroundingError extends AppError {
  constructor(message: string) {
    super(502, message, 'GROUNDING_ERROR');
    this.name = 'GroundingError';
  }
}

export class LLMError extends AppError {
  constructor(message: string) {
    super(502, message, 'LLM_ERROR');
    this.name = 'LLMError';
  }
}
