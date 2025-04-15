/*const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/', (req, res) => {
  res.send('Hello World!');
});

app.delete('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});*/
/*
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware para parsear o corpo da requisição como texto
app.use(bodyParser.text({ type: 'text/xml' }));

app.post('/geoserver/wfs', (req, res) => {
    const xmlData = req.body;

    // Aqui você processa o XML recebido
    console.log('Recebido XML:', xmlData);

    // Retorne uma resposta
    res.status(200).send('Feature updated successfully');
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});*/

/*
const express = require('express');
const path = require('path');
const app = express();
//const apiRouter = require('/routes/api');

// Middleware para servir arquivos estáticos
app.use(express.static(path.join(__dirname, '../public')));

// Middleware para rotas da API
//app.use('/api', apiRouter);

// Rota para servir o index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
*/

/*const express = require('express');
const path = require('path');
const apiRouter = require('./routes/api');

const app = express();

// Middleware para servir arquivos estáticos
app.use(express.static(path.join(__dirname, '../public')));

// Middleware para rotas da API
app.use('/api', apiRouter);

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});*/

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// Middleware para servir arquivos estáticos
app.use(express.static(path.join(__dirname, '../public')));

// Middleware para parsear requisições com content-type 'application/json'
app.use(bodyParser.json());

// Middleware para parsear requisições com content-type 'text/xml'
app.use(bodyParser.text({ type: 'text/xml' }));

// Rota GET para obter uma mensagem
app.get('/api/message', (req, res) => {
    res.json({ message: 'Hello from the server!' });
});

// Rota POST para enviar uma mensagem
app.post('/api/message', (req, res) => {
    const message = req.body.message;
    res.json({ originalMessage: message, geoserverResponse: "Geoserver response placeholder" });
});

// Rota POST para o Geoserver
app.post('/api/geoserver/wfs', (req, res) => {
    const xmlData = req.body;
    console.log('Received XML:', xmlData);
    // Aqui você pode adicionar a lógica para processar o XML
    res.send('Feature received successfully');
});

// Iniciando o servidor
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
