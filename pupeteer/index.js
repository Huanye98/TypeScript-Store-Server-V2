const fs = require("fs");
const puppeteer = require("puppeteer");
const handlebars = require("handlebars");

async function createInvoicePDF(invoiceData, outputPath) {
  const formattedData = {
    ...invoiceData,
    items: invoiceData.items.map(item => ({
      ...item,
      price: item.price.toFixed(2),
    })),
    total:invoiceData.total.toFixed(2),
  }
  try {
    const templateHtml = fs.readFileSync("../pupetteer/invoice.html", "utf8");
    const template = handlebars.compile(templateHtml);
    const compiledHtml = template(formattedData);

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(compiledHtml, { waitUntil: "networkidle0", timeout:30000});
    await page.pdf({
      path: outputPath,
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        right: "20mm",
        bottom: "20mm",
        left: "20mm",
      },
    });

    await browser.close();
    return outputPath;
  } catch (error) {
    console.error("Error creating PDF:", error);
    throw error;
  }
}


module.exports = {createInvoicePDF};
