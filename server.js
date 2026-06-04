const http = require('http');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: __dirname + '/.env' });

const API_KEY = process.env.GROQ_API_KEY;
const PORT = 3000;

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
};

const server = http.createServer((req, res) => {
  let filePath = req.url === '/' ? '/chatbot.html' : req.url;
  filePath = path.join(__dirname, filePath);
  const ext = path.extname(filePath);

  fs.readFile(filePath, 'utf8', (err, content) => {
    if (err) {
      res.writeHead(404);
      return res.end('File not found');
    }

    if (filePath.endsWith('script.js')) {
      content = content.replace("'__GROQ_API_KEY__'", `'${API_KEY}'`);
    }

    res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`ChatBot running at http://localhost:${PORT}`);
});
