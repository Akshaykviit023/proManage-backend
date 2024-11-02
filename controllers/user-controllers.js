
import { hash, compare } from "bcrypt";
import User from "../models/User.js";
import { createToken } from "../utils/token-manager.js";

 export const userSignup = async (req, res, next) => {
    try {
        const { name, email, password, confirmPassword } = req.body;
        const existingUser = await User.findOne({ email });
        if(existingUser)
            return res.status(401).send("user already signed up");
        const hashedPassword = await hash(password, 10);
        const user = new User({ name, email, password: hashedPassword });
        await user.save();


        const token = createToken(user._id.toString(), user.email, "30d");
        const expires = new Date();
        expires.setDate(expires.getDate() + 30);

        return res.status(201).json({ message: "OK", id: user._id.toString(), name: user.name, token });

    } catch (error) {
        console.log(error);
        return res.status(200).json({ message: "ERROR", cause: error.message })
    }
 }

 export const userLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if(!user){
            return res.status(401).send("User not registered");
        }

        const isPasswordCorrect = await compare(password, user.password);

        if(!isPasswordCorrect)
            return res.status(403).send("incorrect Password");


        const token = createToken(user._id.toString(), user.email, "30d");
        const expires = new Date();
        expires.setDate(expires.getDate() + 30);


        return res.status(200).json({ message: "OK", id: user._id.toString(), name: user.name, token })
    } catch (error) {
        console.log(error);
        return res.status(200).json({ message: "ERROR", cause: error.message });
    }
 }

 export const fetchUsers = async (req, res) => {
    try {
        const users = await User.find({}, 'email'); // Adjust query based on your schema
        return res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch users' });
    }
};

export const updatePersonalInfo = async (req, res) => {
    const userId = req.user._id; 
    
    try {
        const { name, updatedEmail, oldPassword, newPassword } = req.body;

        // Check if user exists
        const existingUser = await User.findById(userId);
        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if the old password is correct
        const isPasswordCorrect = await compare(oldPassword, existingUser.password);

        if (!isPasswordCorrect) {
            return res.status(403).json({ message: "Incorrect password" });
        }

        // Hash the new password if provided
        const updatedData = { name, email: updatedEmail };
        if (newPassword) {
            updatedData.password = await hash(newPassword, 10);
        }

        // Update user information
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updatedData,
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(500).json({ message: 'Error updating user information' });
        }

        // Create a new token (if required)
        const token = createToken(updatedUser._id.toString(), updatedUser.email, "30d");

        return res.status(200).json({
            message: 'User updated successfully',
            id: updatedUser._id.toString(),
            name: updatedUser.name,
            token
        });

    } catch (error) {
        console.error("Error updating user:", error); // Log the error for debugging
        return res.status(500).json({ message: 'Error updating user', error: error.message });
    }
};