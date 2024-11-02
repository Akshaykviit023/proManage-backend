import { Router } from "express";
import { cardDetails, changeCardCategory, createCard, deleteCard, fetchPublicCard, getSummary, updateCard, updateChecklist } from "../controllers/card-controllers.js";
import { userVerification } from "../middlewares/auth-middleware.js";

const cardRoutes = Router();

cardRoutes.post("/createCard", userVerification, createCard);
cardRoutes.get("/fetchCards", userVerification, cardDetails);
cardRoutes.post("/changeCategory", userVerification, changeCardCategory);
cardRoutes.delete('/deleteCard/:id', userVerification, deleteCard);
cardRoutes.put('/updateCard/:id', userVerification, updateCard);
cardRoutes.get('/summary', userVerification, getSummary);
cardRoutes.put('/:cardId/checklist/:itemId', userVerification, updateChecklist)

export default cardRoutes;