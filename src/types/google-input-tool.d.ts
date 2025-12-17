declare module "google-input-tool" {
  const googleTransliterate: (
    xhr: XMLHttpRequest,
    text: string,
    lang: string,
    maxResults?: number
  ) => Promise<string[]>;

  export default googleTransliterate;
}
