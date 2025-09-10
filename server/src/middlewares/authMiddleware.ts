import { Request, Response, NextFunction } from "express";
import admin from "../config/firebaseAdmin";
import { de } from "zod/v4/locales/index.cjs";

// Extend Express Request interface to include collectionName and user
declare global {
  namespace Express {
    interface Request {
      collectionName?: string;
      user?: any;
    }
  }
}

export const authenticationOfFirebase = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    // const email = decodedToken.email;
    // if (!email) {
    //   return res.status(401).json({ error: "Email not found in token" });
    // }
    // req.collectionName = email.split("@")[0];
    req.user = decodedToken; // attach user info
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

export default authenticationOfFirebase;