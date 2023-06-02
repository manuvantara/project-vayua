export function parseProposalActionInput(input: string) {
  let parsedData;

  try {
    parsedData = JSON.parse(input);
    if (!Array.isArray(parsedData)) {
      parsedData = [parsedData]; // Wrap the single value in an array
    }
  } catch (error) {
    // Treat the input as a regular string
    parsedData = [input];
  }

  return parsedData;
}
