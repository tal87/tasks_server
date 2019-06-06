const app = require("express")();
const mongoClient = require("mongodb").MongoClient;
const ObjectID = require("mongodb").ObjectID;
const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let url =
  "mongodb://uj2rrk4jfrv4c4c416es:RenWBG0XFUc756E8Mld9@bjgtlg6ithkz39l-mongodb.services.clever-cloud.com:27017/bjgtlg6ithkz39l";
mongoClient.connect(url, (err, db) => {
  if (err) throw err;
  let dbo = db.db("bjgtlg6ithkz39l");

  app.get("/", (req, res) => {
    res.end("done2");
  });

  app.get("/api/login", (req, res) => {
    res.setHeader("access-control-allow-origin", "*");
    dbo.collection("users", (err, collection) => {
      if (err) {
        throw err;
      }

      let uid = req.query["user"];
      let password = req.query["password"];
      if (!uid || !password) {
        res.statusCode = 400;
        res.end("bad request");
        return;
      }

      collection.findOne({ username: uid }, (err, result) => {
        if (!result || result.password !== password) {
          res.statusCode = 401;
          res.end("bad user or password");
          return;
        }

        res.end("ok");
      });
    });
  });

  app.get("/api/tasks", (req, res) => {
    res.setHeader("access-control-allow-origin", "*");
    res.contentType("application/json");
    dbo.collection("tasks", (err, collection) => {
      if (err) {
        throw err;
      }

      let uid = req.query["user"];
      if (!uid) {
        uid = "";
      }

      collection.find({ users: [] }).toArray((err, docs) => {
        if (!err) {
          res.end(JSON.stringify(docs));
        }
      });
    });
  });

  app.options("/api/tasks", (req, res) => {
    res.setHeader("access-control-allow-origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "content-type");
    res.setHeader(
      "access-control-allow-methods",
      "GET, POST, OPTIONS, PUT, DELETE"
    );
    res.end();
  });

  app.post("/api/tasks", (req, res) => {
    res.setHeader("access-control-allow-origin", "*");
    dbo.collection("tasks", (err, collection) => {
      if (err) {
        throw err;
      }

      collection.insert({ text: req.body.text, users: [] }, () => {
        if (!err) {
          res.end("done");
        }
      });
    });
  });

  app.delete("/api/tasks", (req, res) => {
    res.setHeader("access-control-allow-origin", "*");
    dbo.collection("tasks", (err, collection) => {
      if (err) {
        throw err;
      }

      collection.deleteOne({ _id: ObjectID(req.query["id"]) }, () => {
        res.end("done");
      });
    });
  });

  app.listen(process.env.PORT || 5000);
});
