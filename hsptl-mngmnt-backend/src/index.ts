import path from "path";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import nocache from "nocache";
import express from "express";
import router from "./network";
import config from "./config/app/config";
import cookieParser from "cookie-parser";
import { PassportConfig } from "./config/app/passport";
import { Request, Response, NextFunction } from "@/types/express-types";
import prisma from "./lib/prisma";
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_SECRET);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

class index {
  public app: express.Application;

  public passportConfig = new PassportConfig();

  constructor() {
    this.app = express();
    this.Middleware();
    this.MediaRoutes();
    this.Routes();
    this.ErrorHandler();
    this.PassportSetup();
  }

  private Middleware(): void {
    this.app.use(helmet());
    // this.app.use(session);
    this.app.use(nocache());
    this.app.use(express.json());
    this.app.use(morgan("dev"));
    this.app.disable("x-powered-by");
    this.app.set("view engine", "ejs");
    this.app.set("views", "views");
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
    this.app.set("trust proxy", 1);

    this.app.use(
      cors({
        origin: true,
        credentials: true,
      })
    );
  }

  private PassportSetup(): void {
    this.app.use(this.passportConfig.initialize());
  }

  private MediaRoutes(): void {
    const imagePath = path.join(process.cwd(), "uploads");

    this.app.post("/prompt", async (req: Request, res: Response) => {
      try {
        const { email, query } = req.body;

        if (!email) {
          return res.status(400).json({ message: "Email is required." });
        }

        const account = await prisma.account.findUnique({
          where: { email },
          include: {
            orders: {
              include: { shippment: true },
            },
            invoice: true,
          },
        });

        if (!account) {
          return res.status(404).json({ message: "Account not found." });
        }

        const order = account.orders[0];
        const invoice = account.invoice[0];
        let message = "";

        if (order) {
          const products = Array.isArray(order.products)
            ? order.products.map((p: any) => p.name || "a product").join(", ")
            : "an order"; // fallback if malformed

          message += `You currently have an order of ${products}.`;

          if (order.shippment) {
            message += ` It is already on shipment to ${order.shippment.destination}, starting on ${new Date(
              order.shippment.start
            ).toLocaleDateString()}.`;
          }
        }

        if (invoice) {
          message += ` You currently have an invoice of PHP ${invoice.amount.toFixed(
            2
          )} with status "${invoice.status}".`;
        }

        if (!order && !invoice) {
          message = `You currently have no orders, shipments, or invoices.`;
        }

        const defaultQuery = query || "Summarize my current orders, shipments, and invoices.";

        const prompt = `
You are a hospital logistics and finance assistant. Use only the context below to answer.

Context:
${message}

User query:
${defaultQuery}

Instructions:
- If the user asks anything outside finance/logistics, say you can only help with those.
- Provide clear, specific responses based on the message context.
- Use PHP as the currency in any financial references.
`;

        const result = await model.generateContent(prompt);
        const response = result.response?.candidates?.[0]?.content?.parts?.[0]?.text;

        return res.status(200).json({ result: response || message });
      } catch (error) {
        console.error("Error in /ai/prompt:", error);
        return res.status(500).json({ message: "Something went wrong." });
      }
    });


    this.app.get("/uploads/:imageName", (req: Request, res: Response) => {
      const { imageName } = req.params as { imageName: string };
      res.sendFile(path.join(imagePath, imageName));
    });
  }

  private Routes(): void {
    this.app.use(`/${config.api.baseRoute}/${config.api.version}`, router);

  }

  private ErrorHandler(): void {
    this.app.use(
      (error: Error, req: Request, res: Response, next: NextFunction): void => {
        res
          .status(500)
          .send({ message: "Internal Server Error", error: error });
        next();
      }
    );
  }
}

export default index;
