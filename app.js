const app = require("express")();
const mongoClient = require("mongodb").MongoClient;
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

  app.get("/api/tasks", (req, res) => {
    res.setHeader("access-control-allow-origin", "*");
    res.contentType("application/json");
    dbo.collection("tasks", (err, collection) => {
      if (err) {
        throw err;
      }

      collection.find().toArray((err, docs) => {
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

      collection.insert({ text: req.body.text }, (err, result) => {
        if (!err) {
          // console.log(result);
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

      console.log(`id: ${req.query["id"]}`);
      collection.deleteOne({ _id: req.query["id"] }, (err, result) => {
        if (!err) {
          // console.log(result);
          res.end("done");
        }
      });
    });
  });

  app.listen(process.env.PORT || 5000);
});
