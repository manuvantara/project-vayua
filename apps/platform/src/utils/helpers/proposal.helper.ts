import type { MarkdownFrontmatter, Proposal } from '@/types/proposals';
import type { ColumnDef } from '@tanstack/react-table';
import type { PublicClient } from 'viem';

import { getStringHash } from '@/utils/hash-string';

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
): string {
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

export async function blockNumberToTimestamp(
  publicClient: PublicClient,
  blockNumber: bigint,
): Promise<string> {
  try {
    const block = await publicClient.getBlock({
      blockNumber: blockNumber,
    });

    return block.timestamp.toString();
  } catch (error) {
    console.log('Error while trying to get timestamp for block', error);
    return '';
  }
}

export async function blockNumberToDate(
  publicClient: PublicClient,
  blockNumber: bigint,
): Promise<string> {
  const timestamp = await blockNumberToTimestamp(publicClient, blockNumber);
  const date = timestamp
    ? proposalTimestampToDate(timestamp, true)
    : 'Invalid date';
  return date;
}

export function setExecuteWriteArgs(
  targets: `0x${string}` | `0x${string}`[],
  values: string | string[],
  calldatas: `0x${string}` | `0x${string}`[],
  description: string,
) {
  const executeDescription = getStringHash(description) as `0x${string}`;

  const executeTargets = Array.isArray(targets) ? targets : [targets];
  const executeValues = Array.isArray(values)
    ? values.map((val) => BigInt(val))
    : [BigInt(values)];
  const executeCalldatas = Array.isArray(calldatas) ? calldatas : [calldatas];

  return [
    executeTargets,
    executeValues,
    executeCalldatas,
    executeDescription,
  ] as const;
}

export function getProposalTitle(rawDescription: string) {
  const MAX_LENGTH = 50;

  let { title } =
    parseMarkdownWithYamlFrontmatter<MarkdownFrontmatter>(rawDescription);

  if (title) {
    title =
      title.length > MAX_LENGTH ? title.slice(0, MAX_LENGTH) + '...' : title;
  } else {
    title =
      rawDescription.length > MAX_LENGTH
        ? rawDescription.slice(0, MAX_LENGTH) + '...'
        : rawDescription;
  }

  return title || '';
}

export const columns: ColumnDef<Proposal>[] = [
  {
    header: 'Proposals',
  },
];