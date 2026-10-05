import { Request, Response } from "express";
import Topic from "../../models/topic.model";
import { description } from "../../helpers/catalog";

//[GET] /topics
export const topics = async (req: Request, res: Response) => {
  const topics = await Topic.find({
    deleted: false,
    status: "active",
  });

  for (const topic of topics) topic.description = description(topic.description);
  res.render("client/pages/topics/index",{
    pageTitle: "Chủ đề bài hát",
    topics: topics,
  });
}
