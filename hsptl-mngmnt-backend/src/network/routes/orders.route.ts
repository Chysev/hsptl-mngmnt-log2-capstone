import { Router } from "express";
import RequestValidator from "@/middleware/validator";
import { ExpressRouter } from "@/types/express-types.d";
import OrdersController from "../controllers/orders.controller";
import { CreateOrdersDTO, UpdateOrdersDTO } from "@/validators/orders.dto";

const orders: ExpressRouter = Router()
const controller = new OrdersController()


orders.route("/list").get(controller.getAllOrders)

orders.route("/create").post(controller.CreateOrder)

orders.route("/update").patch(controller.UpdateOrder)

orders.route("/delete/:id").delete(controller.DeleteOrder)

export default orders