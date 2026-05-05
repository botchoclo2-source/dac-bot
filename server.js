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

   await page.goto("https://www.dac.com.uy/usuarios/login", {
  waitUntil: "networkidle2"
});

await page.waitForSelector('input[type="text"]', { timeout: 15000 });
await page.waitForSelector('input[type="password"]', { timeout: 15000 });

await page.type('input[type="text"]', process.env.DAC_USER, { delay: 50 });
await page.type('input[type="password"]', process.env.DAC_PASS, { delay: 50 });

await Promise.all([
  page.waitForNavigation({ waitUntil: "networkidle2" }),
  page.click('button[type="submit"]')
]);

// 🔥 AGREGÁ ESTO PARA DEBUG
console.log("Login hecho");

// 🔥 NO cierres todavía
// await browser.close();

res.json({
  success: true,
  message: "Login ejecutado correctamente"
});

    await browser.close();

    res.json({
      success: true,
      message: "Bot funcionando. Falta mapear pantalla real de DAC.",
      pedido,
      nombre,
      direccion,
      telefono
    });

  } catch (error) {
    if (browser) await browser.close();

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor online en puerto ${PORT}`));
