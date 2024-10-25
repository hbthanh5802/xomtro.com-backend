import { ZodError } from 'zod';

export const formatZodErrors = (error: ZodError) => {
  const formattedErrors: Record<string, string[]> = {};

  error.errors.forEach((err) => {
    const field = err.path.join('.');
    if (!formattedErrors[field]) {
      formattedErrors[field] = [];
    }
    formattedErrors[field].push(err.message);
  });

  return formattedErrors;
};
