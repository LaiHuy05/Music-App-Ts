import { convertToSlug } from "./convertToSlug";
import { mediaUrl, requiredText, status, text } from "./http";
import sanitizeHtml from "sanitize-html";

export const catalogSlug = (title: string, id: string) => `${convertToSlug(title).toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 100) || "item"}-${id.slice(-8)}`;
export const description = (value: unknown) => sanitizeHtml(text(value, 50000), {
  allowedTags: [...sanitizeHtml.defaults.allowedTags, "img"],
  allowedAttributes: { ...sanitizeHtml.defaults.allowedAttributes, img: ["src", "alt", "title", "width", "height"] },
  allowedSchemes: ["http", "https"], allowProtocolRelative: false
});
export const catalogData = (body: any, nameField: "title" | "fullName") => {
  const data: any = { [nameField]: requiredText(body[nameField], nameField === "title" ? "tiêu đề" : "tên ca sĩ", 200), description: description(body.description), status: status(body.status) };
  const avatar = Array.isArray(body.avatar) ? body.avatar[0] : body.avatarUrl;
  if (avatar) data.avatar = mediaUrl(avatar);
  return data;
};
