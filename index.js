require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongo = require('mongodb');
const mongoose = require('mongoose');
const shortid = require('shortid')
const isUrlHttp = require('is-url-http');
const app = express();



// Basic Configuration
const port = process.env.PORT || 3000;
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

const URLSchema = new mongoose.Schema({
    original_url: String,
    short_url: String
});

const  URLModel = mongoose.model('URLObj', URLSchema);

app.post('/api/shorturl', (req, res) => {
  
  if(!isUrlHttp(req.body.url)){
    res.json({
      error: 'invalid url'
    });
    return;
  }
  let newURL = new URLModel({
    original_url: req.body.url,
    short_url: shortid.generate()
  });
  
  newURL.save()
        .then((value) => res.json({
          original_url: value.original_url,
          short_url: value.short_url
        }))
        .catch((err) => console.log(err));
  
});

app.get('/api/shorturl/:data', (req, res) =>{
  let toFind = req.params.data;
  
  URLModel.findOne({short_url: toFind})
          .then((value) => res.redirect(value.original_url))
           .catch(() => res.json({error: 'invalid url'}));
});
        
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
