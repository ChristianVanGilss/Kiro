import express from "express";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { Resend } from "resend";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON bodies
  app.use(express.json());

  // API routes FIRST
  app.post("/api/send-feedback", async (req, res) => {
    try {
      const { name, feedback } = req.body;

      if (!name || !feedback) {
        return res.status(400).json({ error: "Name and feedback are required" });
      }

      const apiKey = process.env.RESEND_API_KEY;
      if (!apiKey) {
        console.error("RESEND_API_KEY is missing from environment variables");
        return res.status(500).json({ error: "Server configuration error: Missing API Key" });
      }

      const resend = new Resend(apiKey);

      const result = await resend.emails.send({
        from: "info@kiro.today",
        to: "info@kiro.today",
        subject: `KIRO Feedback from ${name}`,
        text: `Name: ${name}\n\nFeedback:\n${feedback}`,
      });

      if (result.error) {
        console.error("Resend API error:", result.error);
        return res.status(500).json({ error: result.error.message || "Failed to send feedback via Resend" });
      }

      return res.status(200).json({ message: "Feedback sent successfully" });
    } catch (error) {
      console.error("Unhandled error in API handler:", error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : "Internal Server Error",
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve static files from dist
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
