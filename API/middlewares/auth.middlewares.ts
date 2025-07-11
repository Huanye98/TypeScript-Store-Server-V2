const jwt = require("jsonwebtoken");
import { Request, Response, NextFunction, RequestHandler } from "express";
import {User} from "../../Types/User"

export const verifyToken=(req:Request, res:Response, next:NextFunction):void =>{
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ errorMessage: "Token is missing" });
      return 
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
     res.status(401).json({ errorMessage: "Invalid or expired token" });
     return
  }
}

 export const roleValidation=(requiredRole:string) =>{
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as User
    if(!user){
        return res
        .status(401)
        .json({ errorMessage: "no req.user" });
    }
    
    if ( user?.role !== requiredRole) {
      return res
        .status(401)
        .json({ errorMessage: "Access denied, not enough clearance" });
    }
    
    next();
  };
}

