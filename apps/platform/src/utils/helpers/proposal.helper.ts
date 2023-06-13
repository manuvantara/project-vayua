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

type MarkdownWithYamlFrontmatter<T> = {
  proposalDescription: string;
} & {
  [K in keyof T]?: string;
};

export const parseMarkdownWithYamlFrontmatter = <
  T extends Record<string, string>,
>(
  markdown: string,
): MarkdownWithYamlFrontmatter<T> => {
  const metaRegExp = /^---[\n\r](((?!---).|[\n\r])*)[\n\r]---$/m;

  const [rawYamlHeader, yamlVariables] = metaRegExp.exec(markdown) ?? [];

  if (!rawYamlHeader || !yamlVariables) {
    return { proposalDescription: markdown };
  }

  const keyValues = yamlVariables.split('\n');

  const frontmatter = Object.fromEntries(
    keyValues.map((keyValue) => {
      // If after first split there is more colons, we need to treat them as part of the value
      const [key, ...rest] = keyValue.split(':');
      const value = rest.join(':').trim() ?? '';

      return [key ?? keyValue, value];
    }),
  ) as Record<keyof T, string>;

  return {
    ...frontmatter,
    proposalDescription: markdown.replace(rawYamlHeader, '').trim(),
  };
};

export function proposalTimestampToDate(
  timestampInSeconds: string,
  extended = false,
) {
  const timestampInMilliseconds = parseInt(timestampInSeconds) * 1000;
  const dateObj = new Date(timestampInMilliseconds);

  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();

  let hour = dateObj.getHours().toString();
  if (hour.length != 2) hour = '0' + hour;
  let minute = dateObj.getMinutes().toString();
  if (minute.length != 2) minute = '0' + minute;

  return `${day}-${month}-${year}` + (extended ? ` ${hour}:${minute}` : '');
}
