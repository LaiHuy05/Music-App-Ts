import { Request, Response } from "express";
import Song from "../../models/song.model";
import Topic from "../../models/topic.model";
import Singer from "../../models/singer.model";
import { systemconfig } from "../../config/config";

//[GET] /admin/songs/
export const index = async (req: Request, res: Response) => {
  const songs = await Song.find({
    deleted: false
  });

  res.render("admin/pages/songs/index",{
    pageTitle: "Quản lý bài hát",
    songs: songs
  })
}

//[GET] /admin/songs/create
export const create = async (req: Request, res: Response) => {
  const topics = await Topic.find({
    status:"active",
    deleted: false
  }).select("title")


  const singers = await Singer.find({
    status:"active",
    deleted: false
  }).select("fullName")

  res.render("admin/pages/songs/create", {
    pageTitle:"Thêm mới bài hát",
    topics: topics,
    singers: singers
  })
}

//[GET] /admin/songs/createPost
export const createPost = async (req: Request, res: Response) => {
  let avatar = "";
  let audio = "";
  if(req.body.avatar){
    avatar= req.body.avatar[0]
  }

  if(req.body.audio){
    audio= req.body.audio[0]
  }

  const dataSong = {
    title: req.body.title ,
    topicId: req.body.topicId,
    singerId: req.body.singerId,
    description: req.body.description,
    status: req.body.status,
    avatar: avatar,
    audio:audio
  };

  const song = new Song(dataSong);
  await song.save();

  res.redirect(`/${systemconfig.prefixAdmin}/songs`);
}