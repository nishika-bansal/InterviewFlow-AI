const dotenv = require("dotenv");

dotenv.config();

const app = require("./app");
const connectDB = require("./config/db");
const { ensureUploadDir } = require("./utils/fileSystem");

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  ensureUploadDir();
  await connectDB();

  app.listen(PORT, () => {
    console.log(`InterviewFlow AI API running on port ${PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exit(1);
});
