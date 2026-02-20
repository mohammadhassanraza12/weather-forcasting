import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

function buildUrl({ query, units }) {
  const apiKey = process.env.WEATHERSTACK_KEY;
  const q = encodeURIComponent(query);
  const u = units ? `&units=${encodeURIComponent(units)}` : "";
  return `http://api.weatherstack.com/current?access_key=${apiKey}&query=${q}${u}`;
}

app.get("/", (req, res) => {
  res.render("index", { defaultCity: "New Delhi, India" });
});

app.get("/api/current", async (req, res) => {
  const { q, lat, lon, units } = req.query;

  let query = (q || "").trim();
  if (!query && lat && lon) query = `${lat},${lon}`;
  if (!query) query = "New Delhi, India";

  try {
    const url = buildUrl({ query, units: units || "m" });
    const response = await fetch(url);
    const data = await response.json();

    if (data?.error) {
      return res.status(400).json({ ok: false, error: data.error?.info || "API error" });
    }

    return res.json({ ok: true, data });
  } catch (e) {
    return res.status(500).json({ ok: false, error: `Server error: ${e.message}` });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Weather report running at http://localhost:${PORT}`);
});
