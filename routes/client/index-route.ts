import e, { Express } from "express";
import { topicRoute } from "./topic-route";
import { songRoutes } from "./song-route";
import { favoriteSongRoutes } from "./favorite-song-route";
import { searchRoutes } from "./search-route";


const clientRoutes = (app: Express): void => {
  app.use("/topics", topicRoute);

  app.use("/songs", songRoutes);

  app.use("/favorite-songs", favoriteSongRoutes)

  app.use("/search",searchRoutes )

}

export default clientRoutes;