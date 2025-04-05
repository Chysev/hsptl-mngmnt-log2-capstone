import { Router } from "express";
import RequestValidator from "@/middleware/validator";
import { DeleteUserDTO } from "@/validators/users.dto";
import { ExpressRouter } from "@/types/express-types.d";
import UsersController from "../controllers/users.controller";
import { verifyUserAuthToken } from "@/middleware/verifyAuthToken";
import prisma from "@/lib/prisma";
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_SECRET);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const users: ExpressRouter = Router();
const controller = new UsersController();


users
  .route("/list")
  .get(controller.getAllUsers);


users.route("/:id").get(controller.getUser);


users
  .route("/update/:id")
  .patch(
    controller.UpdateUser
  );


users
  .route("/delete/:id")
  .delete(
    verifyUserAuthToken,
    RequestValidator.validate(DeleteUserDTO),
    controller.DeleteUser
  );


users.post("/prompt", async (req, res) => {
  try {
    const { email, query } = req.body

    if (!email) {
      return res.status(400).json({ message: "Email is required." })
    }

    // Fetch all orders by account.orders_id
    const orders = await prisma.orders.findMany()

    // Optional: fetch all shipments for orders that have one
    const shipmentMap: Record<string, any> = {}
    const shipmentIds = orders
      .filter(o => o.shippment_id)
      .map(o => o.shippment_id!) // safe because filtered above

    if (shipmentIds.length) {
      const shipments = await prisma.shipment.findMany({
        where: { id: { in: shipmentIds } }
      })
      shipments.forEach(s => shipmentMap[s.id] = s)
    }

    const context = orders.map(order => {
      const products = Array.isArray(order.products)
        ? order.products.map((p: any) => p.name || "a product").join(", ")
        : "unknown products"

      let line = `Order with products: ${products}, going to ${order.destination}.`

      if (order.shippment_id && shipmentMap[order.shippment_id]) {
        const shipment = shipmentMap[order.shippment_id]
        line += ` Shipment started on ${new Date(shipment.start).toLocaleDateString()} to ${shipment.destination}.`
      }

      return line
    }).join("\n")

    const prompt = buildPrompt(context, query)

    const result = await model.generateContent(prompt)
    const response = result.response?.candidates?.[0]?.content?.parts?.[0]?.text

    return res.status(200).json({ result: response || context })
  } catch (error) {
    console.error("Error in /prompt:", error)
    return res.status(500).json({ message: "Something went wrong." })
  }
});

function buildPrompt(orderContext: string, userQuery?: string): string {
  const query = userQuery || "Analyze my orders and provide insights."

  return `
You are a hospital logistics assistant. Use only the context below to answer.

Context:
${orderContext}

User query:
${query}

Instructions:
- Only respond about logistics (no finance).
- Analyze product demand, destinations, shipment timing, etc.
- Provide summary and predictions if possible.
`
}
export default users;
