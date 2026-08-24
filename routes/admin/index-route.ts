import { Express } from "express";
import { dashboardRoute } from "./dashboard-route";
import { systemconfig } from "../../config/config";

const adminRoutes = (app: Express): void => {

  const PATH_ADMIN = `/${systemconfig.prefixAdmin}`

  app.use(`${PATH_ADMIN}/dashboard`, dashboardRoute);

};

export default adminRoutes;