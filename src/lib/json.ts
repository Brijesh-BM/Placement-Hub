/**
 * Safely parses or casts a database value into a string array.
 * This prevents runtime crashes when fields stored as Json on SQLite
 * are accessed in the application.
 */
export function asStringArray(value: unknown): string[] {
  if (value === null || value === undefined) {
    return [];
  }

  // If already an array, filter and return string items
  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === 'string');
  }

  // If it's a string, try parsing it as JSON (in case it is stored stringified)
  if (typeof value === 'string') {
    // Check if it's a comma-separated list or a JSON string
    const trimmed = value.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.filter((v): v is string => typeof v === 'string');
        }
      } catch (e) {
        // Fallback to splitting if JSON parse fails
      }
    }
    // Fallback: split by comma if it's a comma-separated string
    return trimmed.split(',').map(s => s.trim()).filter(Boolean);
  }

  return [];
}
