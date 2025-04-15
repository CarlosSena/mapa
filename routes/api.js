const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const router = express.Router();

// Middleware para analisar o corpo da requisição
router.use(express.json());

// Rota GET de exemplo
router.get('/message', (req, res) => {
    res.json({ message: 'Hello, world!' });
});



/*
// Rota POST de exemplo
router.post('/geoserver/wfs', async (req, res) => {
    const { message } = req.body;

    // Faça uma requisição para o serviço externo
    try {
        const response = await axios.get('http://localhost:8080/geoserver/adUcation/wfs', {
            params: {
                service: 'WFS',
                version: '1.0.0',
                request: 'GetFeature',
                typeName: 'adUcation:states',
                outputFormat: 'application/json'
            }
        });

        // Enviar a resposta do Geoserver de volta para o cliente
        res.json({
            originalMessage: message,
            geoserverResponse: response.data
        });
    } catch (error) {
        console.error('Erro ao fazer a requisição ao Geoserver:', error);
        res.status(500).json({ error: 'Erro ao fazer a requisição ao Geoserver' });
    }
});*/

// Rota POST de exemplo
router.post('/geoserver/wfs', async (req, res) => {
    const wfsTransaction = req.body;

    try {
        const geoServerResponse = await fetch('http://localhost:8080/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=adUcation:states&maxFeatures=50&outputFormat=json', {
            method: 'POST',
            headers: {
                'Content-Type': 'text/xml'
            },
            body: wfsTransaction
        });

        if (!geoServerResponse.ok) {
            throw new Error('GeoServer response not OK');
        }

        const data = await geoServerResponse.text();
        res.status(200).send(data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error processing WFS transaction');
    }
});

app.use('/api', router);


module.exports = router;
