const express = require("express");
const cors = require("cors");

/** HTTP app: CORS restricted to the configured origins and a health check. */
function createApp({ corsOrigins }) {
  const app = express();
  app.disable("x-powered-by");
  app.use(cors({ origin: corsOrigins }));
  app.use(express.json({ limit: "100kb" }));

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  return app;
}

module.exports = { createApp };
