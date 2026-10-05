import { Express } from "express";
import { topicRoute } from "./topic-route";
import { songRoutes } from "./song-route";
import { favoriteSongRoutes } from "./favorite-song-route";
import { searchRoutes } from "./search-route";
import { userRoutes } from "./user-route";
import * as homeController from "../../controllers/client/home-controller";

const clientRoutes = (app: Express): void => {
  app.get("/", homeController.index);
  app.use("/user", userRoutes);
  app.use("/topics", topicRoute);
  app.use("/songs", songRoutes);
  app.use("/favorite-songs", favoriteSongRoutes);
  app.use("/search", searchRoutes);
};
export default clientRoutes;
