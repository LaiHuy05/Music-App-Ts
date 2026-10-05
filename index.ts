import express, {Express} from 'express';
import * as database from './config/database';
import dotenv from 'dotenv';
import methodOverride from "method-override"
import cookieParser from "cookie-parser";


import clientRoutes from './routes/client/index-route';
import adminRoutes from './routes/admin/index-route';
import { systemconfig } from './config/config';
import path from 'path';
// import bodyParser = require('body-parser');

dotenv.config();

database.connect();

const app: Express = express();
const port: number | string = process.env.PORT || 3000;  

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(cookieParser());

app.use(methodOverride("_method"))


app.use(express.static(`${__dirname}/public`));

app.set("views", `${__dirname}/views`);
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