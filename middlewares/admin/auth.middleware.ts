import { Request, Response, NextFunction } from "express";
import Account from "../../models/account.model";
import { systemconfig } from "../../config/config"; 

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {

  if (!req.cookies.token) {
    return res.redirect(`/${systemconfig.prefixAdmin}/auth/login`); 
  }

  const user = await Account.findOne({
    token: req.cookies.token,
    deleted: false
  }).select("-password"); 

  if (!user) {
    return res.redirect(`/${systemconfig.prefixAdmin}/auth/login`); 
  }

  res.locals.user = user;

  next();
};