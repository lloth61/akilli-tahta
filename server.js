const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const QRCode = require("qrcode");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let sessions = {};

const BASE_URL = process.env.RENDER_EXTERNAL_URL || "http://localhost:3000";

app.get("/", async (req, res) => {
  const token = Math.random().toString(36).substring(2, 10);
  sessions[token] = { authenticated: false };

  const qr = await QRCode.toDataURL(`${BASE_URL}/login/${token}`);

  res.send(`
    <h1>Akıllı Tahta Giriş</h1>
    <img src="${qr}" />
    <p>Telefon ile okut</p>

    <script src="/socket.io/socket.io.js"></script>
    <script>
      const socket = io("${BASE_URL}");
      socket.emit("join", "${token}");

      socket.on("auth", () => {
        document.body.innerHTML = "<h1>Giriş Başarılı ✅</h1>";
      });
    </script>
  `);
});

app.get("/login/:token", (req, res) => {
  const token = req.params.token;

  res.send(`
    <h2>Giriş</h2>
    <button onclick="login()">Giriş Yap</button>

    <script>
      function login(){
        fetch("${BASE_URL}/auth/${token}");
      }
    </script>
  `);
});

app.get("/auth/:token", (req, res) => {
  const token = req.params.token;

  globalAuth = true; // 

  res.send("OK");
});

io.on("connection", (socket) => {
  socket.on("join", (token) => {
    socket.join(token);
  });
});

// 🔥 BURAYA KOY
app.get("/status", (req, res) => {
  res.json({ auth: globalAuth });
});

app.get("/news", async (req, res) => {
  res.json([
    "Okulumuzda bilim fuarı yapıldı",
    "23 Nisan etkinlikleri düzenlendi",
    "Öğrencilerimiz başarı elde etti",
    "Yeni dönem hazırlıkları başladı",
    "Spor müsabakalarında derece alındı"
  ]);
});
