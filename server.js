const express = require("express");
const ytdl = require("@distube/ytdl-core");
const cors = require("cors");

const app = express();
const port = 3001;

app.use(cors());

app.get("/download", async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    const now = new Date().toLocaleString();
    console.log(`[${now}] Downloading video: ${url}`);

    res.setHeader("Content-Disposition", 'attachment; filename="video.mp4"');
    res.setHeader("Content-Type", "video/mp4");

    ytdl(url)
      .pipe(res)
      .on("finish", () => {
        const finishedNow = new Date().toLocaleString();
        console.log(`[${finishedNow}] Downloaded video: ${url}`);
      });
  } catch (error) {
    console.error("Error fetching video:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
