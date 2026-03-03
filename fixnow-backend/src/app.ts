import express, { NextFunction, Request, Response, Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from "./routes/auth.routes";
import paymentRoutes from "./routes/payment.routes";
import serviceRequestRoutes from "./routes/serviceRequest.routes";
import platformConfigRoutes from "./routes/platformConfig.routes";
import promotionRoutes from "./routes/promotion.routes";
// import "./jobs/autoSettlement.job";

const app: Application = express();

const allowedOrigins = [
  "http://localhost:5173"
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ message: 'JSON không hợp lệ', error: err.message });
  }
  next(err);
});

app.use("/auth", authRoutes);
app.use("/payments", paymentRoutes);
app.use("/service-requests", serviceRequestRoutes);
app.use("/platform-config", platformConfigRoutes);
app.use("/promotions", promotionRoutes);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Lỗi máy chủ nội bộ",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

export default app