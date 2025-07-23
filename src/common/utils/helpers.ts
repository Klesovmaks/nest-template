import { randomInt } from 'crypto';

/**
 * Генерирует случайный числовой код заданной длины.
 *
 * @param {number} length  - Длина генерируемого кода (количество цифр).
 * @returns {string} - Строка из случайных цифр длиной `length`.
 */
export const generateRandomCode = (length: number): string =>
  Array.from({ length }, () => randomInt(0, 10).toString()).join('');
