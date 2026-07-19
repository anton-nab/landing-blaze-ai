import * as cheerio from "cheerio";

export interface ExtractedPage {
  url: string;
  title?: string;
  metaDescription?: string;
  headings: { tag: string; text: string }[];
  buttons: string[];
  bodyText: string;
  imgCount: number;
  imgWithoutAlt: number;
}

const MAX_BODY_CHARS = 8000;

export function extractSignals(html: string, url: string): ExtractedPage {
  const $ = cheerio.load(html);

  const title = $("title").first().text().trim() || undefined;
  const metaDescription =
    $('meta[name="description"]').attr("content")?.trim() || undefined;

  const headings = $("h1, h2, h3")
    .map((_, el) => ({
      tag: el.tagName.toLowerCase(),
      text: $(el).text().trim().replace(/\s+/g, " "),
    }))
    .get()
    .filter((h) => h.text)
    .slice(0, 40);

  const buttons = $("button, a[href], input[type=submit]")
    .map((_, el) => $(el).text().trim() || $(el).attr("value")?.trim() || "")
    .get()
    .filter(Boolean)
    .slice(0, 30);

  const images = $("img");
  const imgCount = images.length;
  const imgWithoutAlt = images.filter((_, el) => !$(el).attr("alt")?.trim()).length;

  $("script, style, noscript, svg").remove();
  const bodyText = $("body").text().replace(/\s+/g, " ").trim().slice(0, MAX_BODY_CHARS);

  return { url, title, metaDescription, headings, buttons, bodyText, imgCount, imgWithoutAlt };
}
