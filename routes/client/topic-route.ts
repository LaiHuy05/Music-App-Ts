import { Request, Response, Router, RouterOptions } from "express";
import Topic from "../../models/topic.model";

const router: Router = Router();


router.get("/", async (req: Request, res: Response) => {
  const topics = await Topic.find({
    deleted: false,
  });

  res.render("client/pages/topics/index")
})

export const topicRoute: Router = router;