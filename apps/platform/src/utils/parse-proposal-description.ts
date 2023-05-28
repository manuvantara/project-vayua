type MarkdownWithYamlFrontmatter<T> = {
  proposalDescription: string;
} & {
  [K in keyof T]?: string;
};

export const parseMarkdownWithYamlFrontmatter = <
  T extends Record<string, string>
>(
  markdown: string
): MarkdownWithYamlFrontmatter<T> => {
  const metaRegExp = /^---[\n\r](((?!---).|[\n\r])*)[\n\r]---$/m;

  const [rawYamlHeader, yamlVariables] = metaRegExp.exec(markdown) ?? [];

  if (!rawYamlHeader || !yamlVariables) {
    return { proposalDescription: markdown };
  }

  const keyValues = yamlVariables.split("\n");

  const frontmatter = Object.fromEntries(
    keyValues.map((keyValue) => {
      const [key, value] = keyValue.split(":");

      return [key ?? keyValue, value?.trim() ?? ""];
    })
  ) as Record<keyof T, string>;

  return {
    ...frontmatter,
    proposalDescription: markdown.replace(rawYamlHeader, "").trim(),
  };
};
