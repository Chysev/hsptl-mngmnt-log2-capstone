import { Router } from "express";
import { ExpressRouter } from "@/types/express-types";

import auth from "./routes/auth.route";
import users from "./routes/users.route";
import config from "./routes/config.route";
import verifyApiKey from "@/middleware/verifyApiKey";
import prod from "./routes/products.route";
import orders from "./routes/orders.route";
import vehicle from "./routes/vehicle.route";
import shipment from "./routes/shipment.route";
import inv from "./routes/invoice.route";

const router: ExpressRouter = Router();

// router.use(verifyApiKey);
router.use("/auth", auth);
router.use("/users", users);
router.use("/config", config);

router.use("/product", prod)
router.use("/orders", orders)
router.use("/shipment", shipment)
router.use("/vehicle", vehicle)

router.use("/invoice", inv)




export default router;
