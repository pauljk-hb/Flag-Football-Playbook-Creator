import "dotenv/config";
import { app } from "./app.js";

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Server läuft auf http://localhost:${PORT}`);
  console.log(`🩺 Health-Check: http://localhost:${PORT}/api/health`);
  console.log(
    `🔒 Better Auth aktiv unter http://localhost:${PORT}/api/auth/...`,
  );
});
