import {
  Express,
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from "express";

export default (app: Express) => {
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404).json({ message: "This route does not exist" });
  });
  app.use(((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error("ERROR", req.method, req.path, err);
    if (err.message.includes("Email is already in use")) {
      return res.status(409).json({ error: "Internal Server Error" });
    }
    if (err.message.includes("Email not verified")) {
      return res.status(401).json({ error: "Email not verified" });
    }
    if (err.message.includes("Database Error")) {
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (!res.headersSent) {
      return res.status(400).json({ error: err.message });
    }
  }) as ErrorRequestHandler);
};
