import axios from "axios";

// NOTICE: use this package for more resolvers: https://www.npmjs.com/package/@remix-project/remix-url-resolver

export function handleNpmImport(
  url: string,
  cb: (error: any, content: string) => void
) {
  // eslint-disable-next-line no-useless-catch
  try {
    const req = "https://unpkg.com/" + url;
    axios.get(req).then((response) => cb(null, response.data));
  } catch (e) {
    throw e;
  }
}
