require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require("mongoose");
const mySecret = process.env['MONGO_URI'];
const bodyParser = require("body-parser");

mongoose.connect(mySecret, {userNewUrlParser: true, useUnifiedTopology: true});


const Schema = mongoose.Schema;

const siteSchema = new Schema({
  url: {type: String, required: true},
  number: {type: Number, required: true}
});

const Site = mongoose.model("Site", siteSchema);

const createSite = async (name)=>{
  const found = await Site.findOne({url: name});
  let count = await Site.count({});
  return found || Site.create({url: name, number: count});
}
const find = async (number)=>{
  const found = await Site.findOne({number: number});
  return found;
}

const erase = async ()=>{
   await Site.deleteMany({});
}
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: "false" }));
app.use(bodyParser.json());
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post("/api/shorturl", async(req, res)=>{
  let original_url = req.body.url;
  console.log(original_url)
  if(!/^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(original_url)) return res.json({error: "Invalid URL"});
  let site = await createSite(original_url);
  let short_url = site.number;
  res.json({original_url, short_url});
});

app.get("/api/shorturl/:short", async(req, res)=>{
  let short = req.params.short;
  let site = await find(short);
  if(site) res.redirect(site.url)
  else res.redirect("https://boilerplate-project-urlshortener.nelsonosorio3.repl.co")
  
})

app.get("/erase", (req, res)=>{
  erase();
  res.json({message: "erase"});
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
