import { Request, Response } from "express";
import SettingGeneral from "../../models/setting-general.model";
import { requiredText, text, mediaUrl, email, success } from "../../helpers/http";
import { systemconfig } from "../../config/config";

export const general = (_req: Request, res: Response) => res.render("admin/pages/settings/general", { pageTitle: "Cài đặt chung" });
export const generalPatch = async (req: Request, res: Response) => {
  const data = {
    websiteName: requiredText(req.body.websiteName, "tên website", 100),
    logo: mediaUrl(req.body.logo) || "/images/logo.png",
    description: text(req.body.description, 1000),
    email: req.body.email ? email(req.body.email) : "",
    phone: text(req.body.phone, 30), address: text(req.body.address, 500), copyright: text(req.body.copyright, 300)
  };
  await SettingGeneral.findOneAndUpdate({ key: "general" }, { $set: data }, { upsert: true, runValidators: true });
  success(res, `/${systemconfig.prefixAdmin}/settings/general`);
};
