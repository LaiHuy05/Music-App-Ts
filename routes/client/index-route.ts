import e, { Express } from "express";
import { topicRoute } from "./topic-route";

const clientRoutes = (app: Express): void => {
  app.use("/topics", topicRoute);

}

export default clientRoutes;