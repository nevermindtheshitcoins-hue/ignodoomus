// DeVOTE Scenario Builder - Validation Guards

const OTHER_MIN_LENGTH = 5;
const OTHER_MAX_LENGTH = 50;

/**
 * Validates that Other text input meets length requirements
 * @param text - The text to validate
 * @returns true if text is between 5-50 characters after trimming
 */
export const isValidOtherText = (text: string | null | undefined): boolean => {
  if (!text) {
    return false;
  }
  const trimmed = text.trim();
  return trimmed.length >= OTHER_MIN_LENGTH && trimmed.length <= OTHER_MAX_LENGTH;
};

/**
 * Validates that a selection is a valid option number (1-6)
 * @param selection - The selection number to validate
 * @returns true if selection is a number between 1 and 6
 */
export const isValidSelection = (selection: number | null | undefined): selection is number => {
  if (typeof selection !== 'number') {
    return false;
  }
  return selection >= 1 && selection <= 6;
};

/**
 * Validates option ID for keypad buttons (1-7)
 * @param optionId - The option ID to validate
 * @returns true if optionId is between 1 and 7
 */
export const isValidOptionId = (optionId: number | null | undefined): optionId is number => {
  if (typeof optionId !== 'number') {
    return false;
  }
  return optionId >= 1 && optionId <= 7;
};

/**
 * Sanitizes Other input by removing newlines and clamping length
 * @param value - The input value to sanitize
 * @returns Sanitized string clamped to max length
 */
export const sanitizeOtherInput = (value: string): string =>
  value.replace(/[\r\n\u2028\u2029]/g, ' ').slice(0, OTHER_MAX_LENGTH);

/**
 * Constants for external use
 */
export const VALIDATION_CONSTANTS = {
  OTHER_MIN_LENGTH,
  OTHER_MAX_LENGTH,
} as const;
