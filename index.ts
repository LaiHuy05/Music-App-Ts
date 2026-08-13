import express, {Express, Request, Response} from 'express';


const app: Express = express();
const port: number | string =  3000;  

app.get("/topics", (req: Request, res: Response) => {
  res.send("Hello World!");
})

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});