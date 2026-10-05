import { Router } from "express";

const router: Router = Router();

import * as controller from "../../controllers/client/favorite-song-controller";
import { requireUser } from "../../middlewares/auth.middleware";


router.get("/", requireUser, controller.index);

export const favoriteSongRoutes: Router = router;
