import { Router } from "express";
import { fetchUsers, updatePersonalInfo, userLogin, userSignup } from "../controllers/user-controllers.js";
import { loginValidator, signupValidator, validate } from "../utils/validators.js";
import { userVerification } from "../middlewares/auth-middleware.js";

const userRoutes = Router();

userRoutes.post("/signup",validate(signupValidator) , userSignup);

userRoutes.post("/login",validate(loginValidator) , userLogin);

userRoutes.get("/fetchUsers",userVerification, fetchUsers);

userRoutes.post("/updateUser", userVerification, updatePersonalInfo);

export default userRoutes;