import { Router } from "express";
import userRoutes from "./user-routes.js";
import cardRoutes from "./card-routes.js";
import { userVerification } from "../middlewares/auth-middleware.js";
import publiCardRoutes from "./publicCard-routes.js";

const appRouter = Router();

appRouter.use("/user", userRoutes);
appRouter.use("/card", userVerification, cardRoutes);
appRouter.use("/publicCard", publiCardRoutes);

export default appRouter;