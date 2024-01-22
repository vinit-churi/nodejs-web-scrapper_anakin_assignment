import {
  startBrowser,
  delay,
  getNumberOfPages,
  getProducts,
  addEntryToNjsonFile,
  readNjsonFile,
} from "./utils.js";
import { search_url } from "./constants.js";
async function start() {
  const browser = await startBrowser();
  if (browser === null) {
    return null;
  }
  const page = await browser.newPage();
  await page.goto(search_url);

  const searchButtonSelector = '[aria-label="Search Amazon.in"]';
  const searchText = "laptop";

  // Wait for the search button to appear
  const searchButton = await page.waitForSelector(searchButtonSelector);
  await delay(1020);
  // Input text into the search input field
  await searchButton.type(searchText);
  await delay(1000);
  // Enter to trigger the search
  await searchButton.press("Enter");
  await delay(2000);
  const noOfPages = await getNumberOfPages(page);
  console.log(noOfPages, page.url());
  const laptopsUrl = page.url();
  for (let i = 1; i <= noOfPages; i++) {
    let url = `${laptopsUrl}&page=${i}`;
    console.log(url);
    await page.goto(url);
    await delay(2000);
    await getProducts(page);
  }
  const data = await readNjsonFile("./products.njson");
  console.log(data);
  for (const { url } of data) {
    await page.goto(url);
    await delay(2000);
    const pageData = { url: url };
    const spanElement = await page.$("#productTitle");
    if (spanElement) {
      const textContent = await page.evaluate(
        (el) => el.textContent,
        spanElement
      );
      console.log(textContent.trim());
      pageData.title = textContent.trim();
    } else {
      console.log("Element not found");
    }

    const savingsPercentage = await page.$(".savingsPercentage");
    if (savingsPercentage) {
      const textContent = await page.evaluate(
        (el) => el.textContent,
        savingsPercentage
      );
      console.log(textContent.trim());
      pageData.savingsPercentage = textContent.trim();
    } else {
      console.log("Element not found");
    }
    const wholePrice = await page.$(".a-price-whole");
    if (wholePrice) {
      const textContent = await page.evaluate(
        (el) => el.textContent,
        wholePrice
      );
      console.log(textContent.trim());
      pageData.wholePrice = textContent.trim();
    } else {
      console.log("Element not found");
    }
    pageData.timestamp = new Date().toISOString();
    addEntryToNjsonFile("./finalData.njson", pageData);
  }

  // await browser.close();
}

start();
