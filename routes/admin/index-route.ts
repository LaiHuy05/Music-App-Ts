import { Express } from "express";
import { dashboardRoute } from "./dashboard-route";
import { systemconfig } from "../../config/config";
import { topicRoute } from "./topic-route";
import { songRoute } from "./song-route";
import { uploadRoute } from "./upload-route";
import { authRoute } from "./auth-route";
import { requireAuth } from "../../middlewares/admin/auth.middleware";

const adminRoutes = (app: Express): void => {

  const PATH_ADMIN = `/${systemconfig.prefixAdmin}`

  app.use(`${PATH_ADMIN}/auth`, authRoute);

  app.use(`${PATH_ADMIN}/dashboard`, requireAuth, dashboardRoute);

  app.use(`${PATH_ADMIN}/topics`, requireAuth, topicRoute)

  app.use(`${PATH_ADMIN}/songs`, requireAuth, songRoute)

  app.use(`${PATH_ADMIN}/upload`, requireAuth, uploadRoute)

};

export default adminRoutes;