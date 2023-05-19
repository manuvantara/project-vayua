export function removeWhitespaces(str: string): string {
  try {
    return str.replace(/\s+/g, "");
  } catch {
    throw new Error("removeWhitespaces: parameter must be a string");
  }
}
