require("dotenv").config({ quiet: true });
const http = require("http");
const { Server } = require("socket.io");
const { createClient } = require("@supabase/supabase-js");
const { loadConfig } = require("./src/config");
const { createApp } = require("./src/app");
const { createRepository } = require("./src/repository");
const { createSocketAuth } = require("./src/socketAuth");
const { registerSocketHandlers } = require("./src/socketHandlers");

const config = loadConfig();
const supabase = createClient(config.supabaseUrl, config.serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const repo = createRepository(supabase);

const server = http.createServer(createApp(config));
const io = new Server(server, {
  cors: { origin: config.corsOrigins, methods: ["GET", "POST"] },
});
io.use(createSocketAuth(repo));
registerSocketHandlers(io, repo);

server.listen(config.port, () => {
  console.log(`[api-backend] listening on port ${config.port}`);
});
