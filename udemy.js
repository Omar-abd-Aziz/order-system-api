const express = require('express');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

// Use Puppeteer's stealth plugin to avoid bot detection
puppeteer.use(StealthPlugin());

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Endpoint that accepts a URL and returns the text content
app.post('/scrape', async (req, res) => {
  const { mainLink } = req.body;

  if (!mainLink) {
    return res.status(400).json({ error: 'mainLink parameter is required' });
  }

  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto(mainLink);

    await page.waitForTimeout(4000); // Wait for the page to load

    // Wait for the element to be present
    await page.waitForSelector('.generic-purchase-section--buy-box-main--W9rN0 > div > div:nth-child(2) > div > div > div > span:nth-child(2)');

    // Get the text content of the element
    const textContent = await page.evaluate(() => {
      const element = document.querySelector(".generic-purchase-section--buy-box-main--W9rN0 > div > div:nth-child(2) > div > div > div > span:nth-child(2)");
      return element ? element.textContent : 'Element not found';
    });

    // Close the browser
    await browser.close();

    // Send the text content as the response
    return res.json({ textContent });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'An error occurred while scraping the page' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
