import { Router } from "express";
import * as controller from "../../controllers/client/song-controller";
import { requireUser } from "../../middlewares/auth.middleware";
import { csrfProtection, authRateLimit } from "../../middlewares/security.middleware";

export const songRoutes = Router();
songRoutes.use(csrfProtection);
songRoutes.get("/detail/:slugSong", controller.detail);
songRoutes.patch("/like/:typeLike/:idSong", requireUser, controller.like);
songRoutes.patch("/favorite/:typeFavorite/:idSong", requireUser, controller.favorite);
songRoutes.patch("/listen/:idSong", authRateLimit("listen", 100), controller.listen);
songRoutes.get("/:slugTopic", controller.list);
