const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("DAC bot online");
});

app.post("/crear-envio", async (req, res) => {
  const { nombre, direccion, telefono, pedido } = req.body;

  let browser;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu"
      ]
    });

    const page = await browser.newPage();

    await page.setViewport({ width: 1366, height: 768 });

    await page.goto("https://www.dac.com.uy/usuarios/login", {
      waitUntil: "networkidle2",
      timeout: 0
    });

    await new Promise(resolve => setTimeout(resolve, 5000));

    const titulo = await page.title();
    const url = page.url();

    const bodyText = await page.evaluate(() => document.body.innerText);

    const inputs = await page.$$eval("input, textarea, [contenteditable='true']", els =>
      els.map((el, i) => ({
        index: i,
        tag: el.tagName,
        type: el.getAttribute("type"),
        name: el.getAttribute("name"),
        id: el.getAttribute("id"),
        placeholder: el.getAttribute("placeholder"),
        aria: el.getAttribute("aria-label"),
        class: el.getAttribute("class")
      }))
    );

    const buttons = await page.$$eval("button, [role='button'], input[type='submit'], a", els =>
      els.slice(0, 50).map((el, i) => ({
        index: i,
        tag: el.tagName,
        type: el.getAttribute("type"),
        text: (el.innerText || el.value || "").trim(),
        id: el.getAttribute("id"),
        class: el.getAttribute("class"),
        href: el.href || ""
      }))
    );

    await browser.close();

    return res.json({
      success: true,
      message: "Debug avanzado DAC",
      titulo,
      url,
      pedido,
      nombre,
      direccion,
      telefono,
      bodyText: bodyText.slice(0, 1000),
      inputs,
      buttons
    });

  } catch (error) {
    if (browser) await browser.close();

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor online en puerto ${PORT}`));
