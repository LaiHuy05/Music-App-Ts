import { Request, Response } from "express";
import Account from "../../models/account.model";
import { systemconfig } from "../../config/config"; 
import md5 from "md5";

// [GET] /admin/auth/login
export const login = (req: Request, res: Response) => {
  if (req.cookies.token) {
    return res.redirect(`/${systemconfig.prefixAdmin}/dashboard`);
  }

  res.render("admin/pages/auth/login", {
    pageTitle: "Đăng nhập",
  });
};

// [POST] /admin/auth/login
export const loginPost = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await Account.findOne({
    email: email,
    deleted: false
  });

  if (!user || md5(password) !== user.password || user.status === "inactive") {
    return res.redirect("back"); 
  }


  res.cookie("token", user.token);
  res.redirect(`/${systemconfig.prefixAdmin}/dashboard`); 
};

// [GET] /admin/auth/logout
export const logout = (req: Request, res: Response) => {
  res.clearCookie("token");
  res.redirect(`/${systemconfig.prefixAdmin}/auth/login`); 
};