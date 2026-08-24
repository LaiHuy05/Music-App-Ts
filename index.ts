import express, {Express} from 'express';
import * as database from './config/database';
import dotenv from 'dotenv';


import clientRoutes from './routes/client/index-route';
import adminRoutes from './routes/admin/index-route';
import { systemconfig } from './config/config';
import path from 'path';

dotenv.config();

database.connect();

const app: Express = express();
const port: number | string = process.env.PORT || 3000;  

app.use(express.static("public"));

app.set("views", "./views");
app.set("view engine", "pug");

// Tiny MCE
app.use('/tinymce', express.static(path.join(__dirname, 'node_modules', 'tinymce')));

// App Local Variables
app.locals.prefixAdmin = systemconfig.prefixAdmin;

// ClientRoutes
clientRoutes(app);

// admin Routes
adminRoutes(app);


app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});