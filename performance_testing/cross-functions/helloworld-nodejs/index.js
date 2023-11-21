const express = require('express');
const app = express();
const live = express();

live.get('/live', (req, res) => {
  res.send(`Ok`);
});

live.listen(8082, () => {
  console.log('Health service listening on port', 8082);
});

app.get('/', (req, res) => {
  res.send(`Hello World!`);
});

app.get('/__internal/health', (req, res) => {
  res.send(`Ok`);
});

const port = 8080;
app.listen(port, () => {
  console.log('Hello world listening on port', port);
});



