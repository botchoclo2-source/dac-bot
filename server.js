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

    // ACÁ DESPUÉS PONEMOS LA WEB REAL DE DAC
    await page.goto("https://clientes.dac.com.uy/", {
      waitUntil: "networkidle2"
    });

    // ESTO HAY QUE AJUSTARLO CON LOS SELECTORES REALES
    // await page.type("#usuario", process.env.DAC_USER);
    // await page.type("#password", process.env.DAC_PASS);
    // await page.click("#login");

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
