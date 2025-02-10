const http = require("http");
const { parse } = require("url");   
const next = require("next");
const { Server } = require("socket.io");


const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = http.createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("Internal server error");
    }
  });

  // Initialize Socket.IO
  const io = new Server(server, {
    path: "/api/socketio",
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["polling", "websocket"],
  });

  // Socket.IO event handlers
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("joinEvent", (eventId) => {
      socket.join(`event-${eventId}`);
      console.log(`Client ${socket.id} joined event ${eventId}`);
    });

    socket.on("leaveEvent", (eventId) => {
      socket.leave(`event-${eventId}`);
      console.log(`Client ${socket.id} left event ${eventId}`);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  // Make io accessible to our API routes
  global.io = io;

  server.listen(port, () => {
    console.log(
      `> Ready on http://${hostname}:${port} - env ${process.env.NODE_ENV}`
    );
  });
}); 