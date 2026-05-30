export function sanitizeText(value: string): string {
  return value
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

export function sanitizeReservaInput<T extends Record<string, unknown>>(input: T): T {
  const sanitized = { ...input };

  for (const key of Object.keys(sanitized)) {
    const value = sanitized[key];

    if (typeof value === 'string') {
      sanitized[key as keyof T] = sanitizeText(value) as T[keyof T];
    }
  }

  return sanitized;
}