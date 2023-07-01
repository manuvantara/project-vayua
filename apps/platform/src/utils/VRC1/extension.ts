import type { UserStarringExtension } from './types';

// TODO: should be separated into parseExtensions and parseUserStarringExtension() to support multiple extensions
// TODO?: show beautiful error why there is an error while parsing the extension
export function parseUserStarringExtension(data: string) {
  let extension: UserStarringExtension;

  if (data.length === 0) {
    return {
      organisations: [],
      standard: 'VRC1',
      target: 'User',
      version: '1.0.0',
    };
  }

  return JSON.parse(data);
}
