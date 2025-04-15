const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use('/api', createProxyMiddleware({
    target: 'http://localhost:8080',
    changeOrigin: true,
    onProxyRes: function (proxyRes, req, res) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization');
    }
}));

app.listen(5500, () => {
    console.log('Proxy server listening on port 5500');
});

/*const express = require('express');
const app = express();
const port = 3000;

// Middleware para parsear JSON
app.use(express.json());

app.post('/', (req, res) => {
  res.send('Recebi um POST!');
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://127.0.0.1:${port}`);
});
*/