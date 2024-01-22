import puppeteer from "puppeteer";
import fs from "fs";
import readline from "readline";
export async function startBrowser() {
  let browser;
  try {
    console.log("Opening the browser......");
    browser = await puppeteer.launch({
      headless: false,
      args: ["--disable-setuid-sandbox"],
      ignoreHTTPSErrors: true,
    });

    browser.on("disconnected", () => {
      console.log("Browser closed");
    });
    return browser;
  } catch (err) {
    console.log("Could not create a browser instance => : ", err);
    return null;
  }
}

export async function getNumberOfPages(page) {
  console.log("Getting number of pages....", page);
  const spanElement = await page.$(
    "span.s-pagination-disabled:not(.s-pagination-next):not(.s-pagination-previous)"
  );
  if (spanElement) {
    const textContent = await page.evaluate(
      (el) => el.textContent,
      spanElement
    );
    console.log(textContent);
    return parseInt(textContent);
  } else {
    console.log("Element not found");
    return null;
  }
}

export async function getProducts(page) {
  const elementsWithTitleRecipeAttribute = await page.$$(
    '[data-cy="title-recipe"]'
  );
  const products = [];
  for (const element of elementsWithTitleRecipeAttribute) {
    const linkSelector =
      "a.a-link-normal.s-underline-text.s-underline-link-text.s-link-style.a-text-normal";
    const linkElement = await element.$(linkSelector);
    const url = await page.evaluate((el) => el.href, linkElement);
    console.log(url);
    if (url) {
      await addEntryToNjsonFile("./products.njson", { url: url });
    }
  }
}

export async function readNjsonFile(filePath) {
  const fileStream = fs.createReadStream(filePath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  const items = [];

  for await (const line of rl) {
    // Each line in the NDJSON file is a separate JSON object
    const item = JSON.parse(line);
    items.push(item);
  }
  return items;
}

export function addEntryToNjsonFile(filePath, entry) {
  // Convert the entry to a JSON string
  const json = JSON.stringify(entry);

  // Append the JSON string to the file, followed by a newline
  fs.appendFileSync(filePath, json + "\n");
}

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
