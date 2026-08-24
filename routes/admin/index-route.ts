import { Express } from "express";
import { dashboardRoute } from "./dashboard-route";
import { systemconfig } from "../../config/config";
import { topicRoute } from "./topic-route";

const adminRoutes = (app: Express): void => {

  const PATH_ADMIN = `/${systemconfig.prefixAdmin}`

  app.use(`${PATH_ADMIN}/dashboard`, dashboardRoute);

  app.use(`${PATH_ADMIN}/topics`, topicRoute)

};

export default adminRoutes;