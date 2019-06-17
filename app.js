const app = require("express")();
const mongoClient = require("mongodb").MongoClient;
const ObjectID = require("mongodb").ObjectID;
const bodyParser = require("body-parser");

let config = require("./config");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

console.log(config.connection);
let url = config.connection;
mongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
  if (err) throw err;
  let dbo = db.db("bjgtlg6ithkz39l");

  app.get("/", (req, res) => {
    res.end("done2");
  });

  app.get("/api/login", (req, res) => {
    res.setHeader("access-control-allow-origin", "*");
    res.contentType("application/json");
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

        res.end(JSON.stringify({ id: result._id }));
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
      // users = [uid];
      // if (!uid) {
      //   users = [];
      // }

      collection.find({ users: uid }).toArray((err, docs) => {
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

  app.options("/api/register", (req, res) => {
    res.setHeader("access-control-allow-origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "content-type");
    res.setHeader(
      "access-control-allow-methods",
      "GET, POST, OPTIONS, PUT, DELETE"
    );
    res.end();
  });

  app.post("/api/tasks", (req, response) => {
    response.setHeader("access-control-allow-origin", "*");
    dbo.collection("tasks", (err, collection) => {
      if (err) {
        throw err;
      }

      let users = [req.body.id];
      if (!req.body.id) {
        users = [];
      }

      collection.insertOne({ text: req.body.text, users }, (err, result) => {
        if (!err) {
          response.end("done");
        }
      });
    });
  });

  app.put("/api/tasks", (req, response) => {
    response.setHeader("access-control-allow-origin", "*");
    dbo.collection("users", async (err, collection) => {
      if (err) {
        throw err;
      }

      let task = req.body.task;
      // console.log(task.users);
      task.users = [
        ...task.users,
        ...(await collection
          .find(
            { username: { $in: req.body.users } },
            { projection: { _id: 1 } }
          )
          .toArray()).map(obj => obj._id.toString())
      ];

      task._id = ObjectID(task._id);
      console.log(task);
      dbo.collection("tasks", async (err, collection) => {
        collection.update({ _id: ObjectID(task._id) }, task, (err, result) => {
          console.log(err);
          response.end("done");
        });
      });
    });
  });

  app.post("/api/register", (req, res) => {
    res.setHeader("access-control-allow-origin", "*");
    res.contentType("application/json");
    dbo.collection("users", (err, collection) => {
      if (err) {
        throw err;
      }

      collection.insertOne(req.body["data"], (err2, result) => {
        res.end(JSON.stringify({ id: result.insertedId }));
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
