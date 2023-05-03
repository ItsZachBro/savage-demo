const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;

const url = "mongodb+srv://demo:demo@cluster0-q2ojb.mongodb.net/test?retryWrites=true";
const dbName = "demo";

MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {
    if(error) {
        throw error;
    }
    const db = client.db(dbName);
    console.log("Connected to `" + dbName + "`!");
    app.listen(3000, () => {
      console.log(`Server is running on port 3000`);
    });
});

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {
    if(error) {
        throw error;
    }
    const db = client.db(dbName);
    db.collection('messages').find().toArray((err, result) => {
      if (err) return console.log(err)
      res.render('index.ejs', {messages: result})
    })
  });
})

app.post('/messages', (req, res) => {
  MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {
    if(error) {
        throw error;
    }
    const db = client.db(dbName);
    db.collection('messages').insertOne({name: req.body.name, msg: req.body.msg, thumbUp: 0, thumbDown:0}, (err, result) => {
      if (err) return console.log(err)
      console.log('saved to database')
      res.redirect('/')
    })
  });
})

app.put('/messages/:name/:msg/:action', (req, res) => {
  const name = req.params.name;
  const msg = req.params.msg;
  const action = req.params.action;
  let updateFields = {};
  if (action === "thumbUp") {
    updateFields = { $inc: { thumbUp: 1 } };
  } else if (action === "thumbDown") {
    updateFields = { $inc: { thumbDown: 1 } };
  }
  MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {
    if(error) {
        throw error;
    }
    const db = client.db(dbName);
    db.collection('messages').findOneAndUpdate({ name, msg }, updateFields, { returnOriginal: false }, (err, result) => {
      if (err) return res.send(err);
      res.send(result);
    });
  });
});

app.delete('/messages', (req, res) => {
  MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {
    if(error) {
        throw error;
    }
    const db = client.db(dbName);
    db.collection('messages').findOneAndDelete({name: req.body.name, msg: req.body.msg}, (err, result) => {
      if (err) return res.send(500, err)
      res.send('Message deleted!')
    })
  });
})
