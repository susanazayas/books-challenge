const express = require('express');
const mainRouter = require('./routes/main');
const methodOverride= require("method-override")
const session=require("express-session")
const cookieParser = require("cookie-parser")
const app = express();
const path=require("path");
const cookieCheck = require('./middlewares/cookieCheck');
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("method"));
app.use(express.json());
app.use(session({ secret:"bookChallenge",
resave: false, 
saveUninitialized: true 
})) 
app.use(cookieParser());
app.use(cookieCheck)
app.set('view engine', 'ejs');
app.set('views', 'src/views');

app.use('/', mainRouter);

app.listen(3000, () => {
  console.log('listening in http://localhost:3000');
});
