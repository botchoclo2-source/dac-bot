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
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();

    page.setDefaultTimeout(15000);
    page.setDefaultNavigationTimeout(20000);

    await page.setViewport({
      width: 1366,
      height: 768
    });

    await page.goto("https://www.dac.com.uy/usuarios/login", {
      waitUntil: "load",
      timeout: 0
    });

    const titulo = await page.title();

    const inputs = await page.$$eval("input", els =>
      els.map((el, i) => ({
        index: i,
        type: el.type,
        name: el.name,
        id: el.id,
        placeholder: el.placeholder,
        value: el.value
      }))
    );

    const buttons = await page.$$eval("button, input[type='submit'], a", els =>
      els.slice(0, 30).map((el, i) => ({
        index: i,
        tag: el.tagName,
        type: el.type || "",
        text: el.innerText || el.value || "",
        id: el.id,
        class: el.className,
        href: el.href || ""
      }))
    );

    await browser.close();

    return res.json({
      success: true,
      message: "Debug login DAC",
      titulo,
      pedido,
      nombre,
      direccion,
      telefono,
      inputs,
      buttons
    });

  } catch (error) {
    console.error("ERROR EN BOT:", error.message);

    if (browser) {
      await browser.close();
    }

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor online en puerto ${PORT}`);
});
