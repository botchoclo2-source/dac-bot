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

console.log("Página cargada:", titulo);

await page.waitForSelector('input[type="text"]', { timeout: 15000 });
await page.waitForSelector('input[type="password"]', { timeout: 15000 });

await page.type('input[type="text"]', process.env.DAC_USER, { delay: 50 });
await page.type('input[type="password"]', process.env.DAC_PASS, { delay: 50 });

await page.keyboard.press("Enter");

await new Promise(resolve => setTimeout(resolve, 2000));

const urlActual = page.url();

console.log("URL después del login:", urlActual);

await browser.close();

return res.json({
  success: true,
  message: "Login intentado rápido",
  titulo,
  url_actual: urlActual
});

    console.log("Pedido recibido:", pedido);
    console.log("Cliente:", nombre);
    console.log("Dirección:", direccion);
    console.log("Teléfono:", telefono);
    console.log("URL después del login:", urlActual);

    await browser.close();

    return res.json({
      success: true,
      message: "Login intentado",
      url_actual: urlActual,
      pedido,
      nombre,
      direccion,
      telefono
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
