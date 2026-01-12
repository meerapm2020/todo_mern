const http = require("http");
const fs = require("fs");
const path = require("path");
const { MongoClient, ObjectId } = require("mongodb");

// MongoDB connection
const client = new MongoClient("mongodb://127.0.0.1:27017");
let todos;

client.connect().then(() => {
  const db = client.db("todoDB");
  todos = db.collection("todos");
  console.log("MongoDB connected");
});

// Public folder path
const publicPath = path.join(__dirname, "public");

// Create server (async to allow await)
const server = http.createServer(async (req, res) => {

  // ---------- SERVE HTML ----------
  if (req.method === "GET" && req.url === "/") {
    const filePath = path.join(publicPath, "index.html");
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end("Error loading HTML");
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(data);
    });
    return;
  }

  // ---------- SERVE CSS ----------
  if (req.method === "GET" && req.url === "/style.css") {
    const filePath = path.join(publicPath, "style.css");
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end("Error loading CSS");
        return;
      }
      res.writeHead(200, { "Content-Type": "text/css" });
      res.end(data);
    });
    return;
  }

  // ---------- SERVE JS ----------
  if (req.method === "GET" && req.url === "/script.js") {
    const filePath = path.join(publicPath, "script.js");
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end("Error loading JS");
        return;
      }
      res.writeHead(200, { "Content-Type": "application/javascript" });
      res.end(data);
    });
    return;
  }

  // ---------- READ TODOS ----------
  if (req.method === "GET" && req.url === "/todos") {
    const data = await todos.find().toArray();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
    return;
  }

  // ---------- CREATE TODO ----------
  if (req.method === "POST" && req.url === "/todos") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", async () => {
      await todos.insertOne(JSON.parse(body));
      res.end("Todo Added");
    });
    return;
  }

  // ---------- UPDATE TODO ----------
  if (req.method === "PUT" && req.url.startsWith("/todos/")) {
    const id = req.url.split("/")[2];
    let body = "";

    req.on("data", chunk => body += chunk);
    req.on("end", async () => {
      const data = JSON.parse(body);
      await todos.updateOne(
        { _id: new ObjectId(id) },
        { $set: { text: data.text } }
      );
      res.end("Todo Updated");
    });
    return;
  }

  // ---------- DELETE TODO ----------
  if (req.method === "DELETE" && req.url.startsWith("/todos/")) {
    const id = req.url.split("/")[2];
    await todos.deleteOne({ _id: new ObjectId(id) });
    res.end("Todo Deleted");
    return;
  }

  // ---------- 404 ----------
  res.writeHead(404);
  res.end("Not Found");
});

// Start server
server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
