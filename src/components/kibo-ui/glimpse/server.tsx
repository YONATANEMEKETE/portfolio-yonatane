const TITLE_REGEX = /<title[^>]*>([^<]+)<\/title>/;
const OG_TITLE_REGEX = /<meta[^>]*property="og:title"[^>]*content="([^"]+)"/;
const DESCRIPTION_REGEX = /<meta[^>]*name="description"[^>]*content="([^"]+)"/;
const OG_DESCRIPTION_REGEX = /<meta[^>]*property="og:description"[^>]*content="([^"]+)"/;
const OG_IMAGE_REGEX = /<meta[^>]*property="og:image"[^>]*content="([^"]+)"/;

export const glimpse = async (url: string) => {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });
    clearTimeout(timer);

    if (!response.ok) {
      return { title: null, description: null, image: null };
    }

    const data = await response.text();
    const titleMatch = data.match(TITLE_REGEX) || data.match(OG_TITLE_REGEX);
    const descriptionMatch = data.match(DESCRIPTION_REGEX) || data.match(OG_DESCRIPTION_REGEX);
    const imageMatch = data.match(OG_IMAGE_REGEX);

    return {
      title: titleMatch?.at(1) ?? null,
      description: descriptionMatch?.at(1) ?? null,
      image: imageMatch?.at(1) ?? null,
    };
  } catch {
    return { title: null, description: null, image: null };
  }
};
