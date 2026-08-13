import express, {Express, Request, Response} from 'express';


const app: Express = express();
const port: number | string =  3000;  

app.set("views", "./views");
app.set("view engine", "pug");

app.get("/topics", (req: Request, res: Response) => {
  res.render("client/pages/topics/index")
})

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});