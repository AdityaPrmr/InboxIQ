import express from "express";
import dotenv from "dotenv";
import emailRoutes from "./routes/email.routes";
import searchRoutes from "./routes/search.routes";
import { initElastic } from "./config/elastic";
import { initIMAP } from './services/email.service';
import cors from 'cors';
import replyRouter from "./routes/reply";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

(async () => {
  await initElastic();
  await initIMAP(); 
})();

// Routes
app.use("/emails", emailRoutes);
app.use("/search", searchRoutes);
app.use("/reply", replyRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
