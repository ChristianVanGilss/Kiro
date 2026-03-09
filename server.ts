import express from "express";
import { createServer as createViteServer } from "vite";
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Resend setup
  const resend = new Resend(process.env.RESEND_API_KEY);

  // API route for feedback
  app.post("/api/send-feedback", async (req, res) => {
    const { name, feedback } = req.body;

    if (!name || !feedback) {
      return res.status(400).json({ error: "Name and feedback are required" });
    }

    try {
      const result = await resend.emails.send({
        from: "info@kiro.today",
        to: "info@kiro.today",
        subject: `KIRO Feedback from ${name}`,
        text: `Name: ${name}\n\nFeedback:\n${feedback}`,
      });
      console.log("Resend result:", result);
      res.status(200).json({ message: "Feedback sent successfully" });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to send feedback" });
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
