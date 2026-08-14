import e, { Express } from "express";
import { topicRoute } from "./topic-route";
import { songRoutes } from "./song-route";

const clientRoutes = (app: Express): void => {
  app.use("/topics", topicRoute);

  app.use("/songs", songRoutes);

}

export default clientRoutes;