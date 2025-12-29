const http = require("http");
const fs = require("fs");
const { MongoClient, ObjectId } = require("mongodb");

const client = new MongoClient("mongodb://127.0.0.1:27017");
let todos;

client.connect().then(() => {
  const db = client.db("todoDB");
  todos = db.collection("todos");
  console.log("MongoDB connected");
});

const server = http.createServer((req, res) => {

  // Serve files
  if (req.method === "GET" && req.url === "/") {
    fs.createReadStream("./public/index.html").pipe(res);
    return;
  }

  if (req.method === "GET" && req.url === "/style.css") {
    fs.createReadStream("./public/style.css").pipe(res);
    return;
  }

  if (req.method === "GET" && req.url === "/script.js") {
    fs.createReadStream("./public/script.js").pipe(res);
    return;
  }

  // READ
  if (req.method === "GET" && req.url === "/todos") {
    todos.find().toArray().then(data => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(data));
    });
    return;
  }

  // CREATE
  if (req.method === "POST" && req.url === "/todos") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", async () => {
      await todos.insertOne(JSON.parse(body));
      res.end("Added");
    });
    return;
  }

  // UPDATE
  if (req.method === "PUT") {
    const id = req.url.split("/")[2];
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", async () => {
      const data = JSON.parse(body);
      await todos.updateOne(
        { _id: new ObjectId(id) },
        { $set: { text: data.text } }
      );
      res.end("Updated");
    });
    return;
  }

  // DELETE
  if (req.method === "DELETE") {
    const id = req.url.split("/")[2];
    todos.deleteOne({ _id: new ObjectId(id) }).then(() => {
      res.end("Deleted");
    });
    return;
  }
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
