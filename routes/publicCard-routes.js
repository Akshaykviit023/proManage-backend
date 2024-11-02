import { Router } from "express";
import { fetchPublicCard } from "../controllers/card-controllers.js";


const publiCardRoutes = Router();

publiCardRoutes.get('/fetchPublicCard/:cardId', fetchPublicCard)

export default publiCardRoutes;