export function processContractName(str: string): string {
  try {
    return str
      .replace(/\s+/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("");
  } catch {
    throw new Error("processContractName: parameter must be a string");
  }
}
