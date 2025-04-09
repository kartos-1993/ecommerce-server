import { UserDocument } from "./../../database/models/user.model";

// src/types/express/index.d.ts
UserModel;
declare global {
  namespace Express {
    interface User extends UserDocument {}
    interface Request {
      sessionId?: string;
      user?: User;
    }
  }
}

// You need this export {} line to make it a module
export {};
