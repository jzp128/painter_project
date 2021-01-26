/*jshint esversion: 8*/

const express = require('express');
const http = require('http');
const path = require('path');
const cookie = require('cookie');
const crypto = require('crypto');
const {check, validationResult} = require('express-validator');
const uid = require('uid');

const PORT = process.env.PORT || 5000;
const app = express();
const session = require('express-session');
app.use(express.static(path.join(__dirname, 'simple-drawing/build')));

const bodyParser = require('body-parser');

// Set Up MongoDb Connection
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const uri = process.env.MONGODB_URL || "mongodb+srv://admin:admin@cluster0-u5sht.mongodb.net/test?retryWrites=true&w=majority";
const dbclient = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});

// Email for sign up
const mailgun = require("mailgun-js");
const DOMAIN = 'sandbox56349c3d38204d0abb31e9c76a22d15c.mailgun.org';
const api_key = '32d90f1fc9960eb7bcb6d298c56e643f-aa4b0867-6fe96504';
const mg = mailgun({apiKey: api_key, domain: DOMAIN});

dbclient.connect(err => {
  if (err) throw err;
});

// File upload
const multer = require('multer');
const upload = multer({dest: path.join(__dirname, 'uploads')});

// allow any domain by creating an option-object
const cors = require('cors');
let corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// temporary storage for upload images
let images = {};

// storage of clients connected
let clients = {};

app.use(session({
  secret: 'please change this secret',
  resave: false,
  saveUninitialized: true,
  // httpOnly: true,
  // secure: true,
  // sameSite: true,
  // cookie: {httpOnly: true, secure: true, sameSite: true,},
  // username: {httpOnly: true, secure: true, sameSite: true}
}));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

function generateSalt() {
  return crypto.randomBytes(16).toString('base64');
}

function generateHash(password, salt) {
  let hash = crypto.createHmac('sha512', salt);
  hash.update(password);
  return hash.digest('base64');
}

const isAuthenticated = function (req, res, next) {
  if (!req.session.username) return res.status(401).end("access denied");
  req.username = req.session.username;
  next();
};

app.use(function (req, res, next) {
  console.log("HTTP request", req.method, req.url, req.body);
  next();
});

app.use(function (req, res, next) {
  var username = (req.session.username) ? req.session.username : '';
  res.setHeader('Set-Cookie', cookie.serialize('username', username, {
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 1 week in number of seconds
  }));
  next();
});

app.post('/signup/', [check('email').isEmail()], function (req, res, next) {
  let username = req.body.username;
  let password = req.body.password;
  let email = req.body.email;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(409).json({errors: errors.array()});
  }

  const usersDb = dbclient.db('painter').collection("users");

  usersDb.findOne({$or: [{_id: email}, {userName: username}]}, {}, function (err, user) {
    if (err) return res.status(500).end(err);
    if (user) return res.status(409).end("username / email already exists");

    let salt = generateSalt();
    let hash = generateHash(password, salt);
    let vid = uid(16);

    usersDb.update({_id: email},
      {_id: email, userName: username, salt, hash, vid, verified: false, drawings: []},
      {upsert: true},
      function (err) {
        if (err) return res.status(500).end(err);
        const host = req.get('host');
        sendVerificationEmail(email, vid, host);
        // send verification email to user
        return res.status(200).end("success");
      });
  });
});

function sendVerificationEmail(email, verificationId, host) {
  const link = 'http://' + host + '/verify/' + verificationId;
  const data = {
    from: "Team TTeam <postmaster@sandbox56349c3d38204d0abb31e9c76a22d15c.mailgun.org>",
    to: email,
    subject: 'Painter Sign Up Verification',
    template: "verification",
    'v:test_var': link,
  };

  mg.messages().send(data, function (error, body) {
    if (error) return console.log(error);
  });
};

app.get('/verify/:verifyId', function (req, res) {
  const vid = req.params.verifyId;
  console.log('test', vid);
  const usersDb = dbclient.db('painter').collection("users");
  usersDb.findOne({vid: vid}, {}, function (err, user) {
    // error handling
    if (err) return res.status(500).json(err);
    if (!user) return res.status(401).json({status: 'user-notfound'});
    if (user && user.verified) return res.status(200).json({state: 'already-verified'});

    usersDb.update({vid: vid}, {$set: {verified: true}}, function (updateerr, doc) {
      if (err) return res.status(500).json(err);
      return res.status(200).json({status: 'success'});
    })
  });
});

app.post('/signin/', function (req, res, next) {
  let email = req.body.email;
  let password = req.body.password;
  // retrieve user from the database
  const usersDb = dbclient.db('painter').collection("users");
  usersDb.findOne({_id: email}, {}, function (err, user) {
    if (err) return res.status(500).end(err);
    if (!user) return res.status(401).end("access denied");
    if (user.hash !== generateHash(password, user.salt)) return res.status(401).end("access denied"); // invalid password
    // start a session
    req.session.username = user._id;
    res.setHeader('Set-Cookie', cookie.serialize('username', user._id, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week in number of seconds
    }));
    return res.status(200).json("user " + email + " signed in");
  });
});

app.get('/api/user/getDrawingList/', isAuthenticated, function (req, res, next) {
  const canvasDb = dbclient.db('painter').collection("canvas");
  const userDb = dbclient.db('painter').collection('users');
  userDb.findOne({_id: req.username}, {drawings: 1}, function (err, doc) {
    if (err) return res.status(500).json(err);
    if (!doc) return res.status(404).end('USER NOT FOUND');

    const drawings = doc.drawings.map((s) => ObjectID(s));

    canvasDb.find({_id: {$in: drawings}}, {projection: {isShared: 1, title: 1, _id: 1}}, function (findErr, canvas) {
      if (findErr) return res.status(500).json(findErr);
      canvas.toArray(function (e, arr) {
        if (e) return res.status(500).json(e);
        return res.status(200).json(arr);
      });
    });
  });
});

app.post('/api/drawing/newDrawing/', isAuthenticated, function (req, res) {
  const newCanvas = {
    drawables: [],
    isShared: false,
    title: req.body.canvasTitle,
    width: req.body.width,
    height: req.body.height,
    owner: req.username
  };

  const canvasDb = dbclient.db('painter').collection("canvas");
  const userDb = dbclient.db('painter').collection('users');

  canvasDb.insertOne(newCanvas, (err, canvas) => {
    if (err) throw err;
    userDb.findOneAndUpdate({_id: req.username}, {$push: {drawings: canvas.insertedId}}, function (updErr, usr) {
      if (err) return res.status(500).json(updErr);
      res.status(200);
      res.type('application/json');
      res.json(canvas.insertedId);
    });
  });
});

app.get('/user/isAuth', function (req, res) {
  req.username = null;
  if (req.session && req.session.username) {
    req.username = req.session.username;
  }

  if (!req.username) return res.status(401).json({status: false});
  return res.status(200).json({status: true});
});


// curl -b cookie.txt -c cookie.txt localhost:3000/signout/
app.get('/signout/', function (req, res) {
  req.session.destroy();
  res.setHeader('Set-Cookie', cookie.serialize('username', '', {
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 1 week in number of seconds
    secure: true,
    sameSite: true
  }));

  res.status(200).end("signed out");
});

// get the canvas given canvas ID
app.get('/api/canvas/:canvasId', isAuthenticated, function (req, res) {
  const canvasDb = dbclient.db('painter').collection("canvas");
  canvasDb.findOne({_id: ObjectID(req.params.canvasId)}, {}, function (err, doc) {
    if (err) throw err;
    if (doc.owner !== req.username && !doc.isShared) return res.status(401).json({err: "You are not authorized to edit this drawing"});
    res.status(200);
    res.type('application/json');
    res.json(doc);
  });
});

app.delete('/api/canvas/:canvasId', isAuthenticated, function (req, res, next) {

  const canvasDb = dbclient.db('painter').collection("canvas");
  const userDb = dbclient.db('painter').collection('users');

  canvasDb.findOne({_id: ObjectID(req.params.canvasId)}, {}, function (err, doc) {
    if (err) throw err;
    if (doc.owner !== req.username) return res.status(401).json({err: "You are not authorized to delete this drawing"});
    // removes canvas from canvas list
    canvasDb.deleteOne({_id: ObjectID(req.params.canvasId)}, {}, function (delErr, delDoc) {
      if (delErr) return res.status(500).json(delErr);

      // removes the id from the user array
      userDb.update({}, {$pull: {drawings: ObjectID(req.params.canvasId)}}, function (delUserErr, user) {
        if (delUserErr) return res.status(500).json(delUserErr);
        res.status(200);
        res.type('application/json');
        res.json(doc);
      });
    });
  });
});

// share drawing
app.post('/api/canvas/sharedrawing', isAuthenticated, (req, res, next) => {

  const id = ObjectID(req.body.id);
  const canvasDb = dbclient.db('painter').collection("canvas");
  canvasDb.findOne({_id: id}, {projection: {owner: 1}}, function (findErr, canvas) {
    if (findErr) return res.status(500).json(findErr);
    if (!canvas) return res.status(404).end('canvas not found');
    if (canvas.owner !== req.username) return res.status(401).end("Access Denied");
    console.log('NAHNI');
    canvasDb.findOneAndUpdate({_id: id}, {$set: {isShared: true}}, {upsert: false}, (err, doc) => {
      if (err) return res.status(500).json(err);
      res.status(200);
      res.type('application/json');
      res.json({id: doc._id, status: "Successful"});
    });
  });
});

// post image
app.post('/api/images/', upload.single('picture'), isAuthenticated, function (req, res, next) {
  const picture = {_id: req.body.imageId, fileId: req.body.fileId, picture: req.file, content_type: req.file.mimetype};
  const imageDb = dbclient.db('images').collection("image");
  imageDb.insertOne(picture, (err, doc) => {
    if (err) throw err;
    res.status(200);
    res.type('application/json');
    res.json(req.file);
  })
});

// Get Image 
app.get('/api/images/:fileId/:imageId/uploaded', isAuthenticated, function (req, res, next) {
  const imageDb = dbclient.db('images').collection("image");
  imageDb.findOne({fileId: req.params.fileId, _id: req.params.imageId}, {}, function (err, doc) {
    if (err) throw err;
    let profile = doc.picture;
    res.type(doc.content_type);
    res.sendFile(profile.path);
  });
});

//serves react files to client
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/simple-drawing/build/index.html'));
});


const server = http.createServer(app);

const io = require('socket.io')(server);

io.sockets.on('connect', (socket) => {
  let roomId = '';
  socket.on('end-drawing', (data) => {
      const canvasDb = dbclient.db('painter').collection("canvas");
      canvasDb.findOneAndUpdate({_id: ObjectID(data.id)}, {$set: {drawables: data.newDrawable}},
        {returnOriginal: false},
        function (err, doc) {
          if (err) throw err;
          socket.to(roomId).emit('drawable-updated', doc.value.drawables);
        });
    }
  );

  socket.on('join-room', (data) => {
    socket.join(data.roomId);
    roomId = data.roomId;
    console.log(socket.id + ' joined ' + roomId);
  });

  socket.on('background-update', (data) => {
    socket.to(roomId).emit('background-updated', data);
  });

  socket.on('startnew-update', (data) => {
    socket.to(roomId).emit('startnew-updated', data);
  });

  socket.on('importImage-update', (data) => {
    socket.to(roomId).emit('importImage-updated', data);
  });

  socket.on('title-update', (data) => {
    console.log(data);
    const canvasDb = dbclient.db('painter').collection("canvas");
    canvasDb.findOneAndUpdate({_id: ObjectID(data.id)}, {$set: {title: data.title}},
      {returnOriginal: false},
      function (err, doc) {
        if (err) throw err;
        socket.to(roomId).emit('title-updated', data);
      });
  });

  socket.on('image-update', (data) => {
    socket.to(roomId).emit('image-updated', data);
  });

  socket.on('undo-update', (data) => {
    socket.to(roomId).emit('undo-updated', data);
  });

  socket.on('disconnect', () => console.log('Client has disconnected'));
});

server.listen(PORT, function (err) {
  if (err) console.log(err);
  else console.log("HTTP server on http://localhost:%s", PORT);
});
