// NOTICE: use this package for more resolvers: https://www.npmjs.com/package/@remix-project/remix-url-resolver

export function handleNpmImport(
  url: string,
  cb: (error: any, content: string) => void,
) {
  try {
    const req = 'https://unpkg.com/' + url;
    fetch(req)
      .then((response) => response.text())
      .then((data) => cb(null, data));
  } catch (e) {
    throw e;
  }
}
