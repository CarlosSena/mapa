/*// src/routes/api.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

// Middleware para analisar o corpo da requisição
router.use(express.json());

// Rota GET de exemplo
router.get('/message', (req, res) => {
    res.json({ message: 'Hello, world!' });
});

// Rota POST de exemplo
router.post('/message', async (req, res) => {
    const { message } = req.body;

    // Exemplo de requisição para um serviço externo
    try {
        const response = await axios.get('http://localhost:8080/geoserver/wfs', {
            params: {
                service: 'WFS',
                version: '1.0.0',
                request: 'GetFeature',
                typeName: 'topp:states',
                outputFormat: 'application/json'
            }
        });

        res.json({
            originalMessage: message,
            geoserverResponse: response.data
        });
    } catch (error) {
        console.error('Erro ao fazer a requisição ao Geoserver:', error);
        res.status(500).json({ error: 'Erro ao fazer a requisição ao Geoserver' });
    }
});

module.exports = router;
*/


/*
const express = require('express');
const axios = require('axios');
const router = express.Router();

// Middleware para analisar o corpo da requisição
router.use(express.json());

// Rota POST para enviar dados ao Geoserver
router.post('/geoserver/wfs', async (req, res) => {
    const { message } = req.body;

    try {
        const response = await axios.post('http://localhost:8080/geoserver/wfs', {
            params: {
                service: 'WFS',
                version: '1.0.0',
                request: 'GetFeature',
                typeName: 'topp:states',
                outputFormat: 'application/json'
            }
        });

        res.json({
            originalMessage: message,
            geoserverResponse: response.data
        });
    } catch (error) {
        console.error('Erro ao fazer a requisição ao Geoserver:', error);
        res.status(500).json({ error: 'Erro ao fazer a requisição ao Geoserver' });
    }
});

module.exports = router;
*/




/*
const express = require('express');
const axios = require('axios');
const router = express.Router();

// Middleware para analisar o corpo da requisição
router.use(express.json());

// Rota POST para enviar dados ao Geoserver
router.post('/geoserver/wfs', async (req, res) => {
    const { nome, area, the_geom } = req.body;

    // Certifique-se de que o XML está corretamente formatado e que os namespaces estão corretos
    const xml = `
        <wfs:Transaction service="WFS" version="1.1.0"
        xmlns:adUcation="http://www.openplans.org/adUcation"
        xmlns:ogc="http://www.opengis.net/ogc"
        xmlns:wfs="http://www.opengis.net/wfs"
        xmlns:gml="http://www.opengis.net/gml"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/WFS-transaction.xsd">
            <wfs:Insert>
                <adUcation:states>
                    <adUcation:the_geom>
                        <gml:Polygon srsName="EPSG:4326">
                            <gml:exterior>
                                <gml:LinearRing>
                                    <gml:posList srsDimension="2">${the_geom}</gml:posList>
                                </gml:LinearRing>
                            </gml:exterior>
                        </gml:Polygon>
                    </adUcation:the_geom>
                    <adUcation:PERSONS>${area}</adUcation:PERSONS>
                    <adUcation:STATE_NAME>${nome}</adUcation:STATE_NAME>
                </adUcation:states>
            </wfs:Insert>
        </wfs:Transaction>`;

    try {
        // Configure a URL do GeoServer. Substitua <GEOSERVER_URL> pela URL real do seu GeoServer
        const response = await axios.post('http://localhost:8080/geoserver/wfs', xml, {
            headers: {
                'Content-Type': 'application/xml'
            }
        });

        // Verifique a resposta do GeoServer
        console.log('GeoServer Response:', response.data);

        // Retorne uma mensagem de sucesso se a transação for bem-sucedida
        res.json({
            originalMessage: req.body,
            geoserverResponse: response.data
        });
    } catch (error) {
        // Em caso de erro, retorne a mensagem de erro
        console.error('Erro ao fazer a requisição ao Geoserver:', error);
        res.status(500).json({ error: 'Erro ao fazer a requisição ao Geoserver' });
    }
});

module.exports = router;

*/

/*

const express = require('express');
const axios = require('axios');
const router = express.Router();

// Middleware para analisar o corpo da requisição
router.use(express.json());

// Rota POST para enviar dados ao GeoServer
router.post('/geoserver/wfs', async (req, res) => {
    const { nome, area, geom } = req.body;

    // Certifique-se de que o XML está corretamente formatado e que os namespaces estão corretos
    const xml = `
        <wfs:Transaction service="WFS" version="1.1.0"
        xmlns:adUcation="http://www.openplans.org/adUcation"
        xmlns:ogc="http://www.opengis.net/ogc"
        xmlns:wfs="http://www.opengis.net/wfs"
        xmlns:gml="http://www.opengis.net/gml"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/WFS-transaction.xsd">
            <wfs:Insert>
                <adUcation:states>
                    <adUcation:the_geom>
                        <gml:Polygon srsName="EPSG:4326">
                            <gml:exterior>
                                <gml:LinearRing>
                                    <gml:posList srsDimension="2">${geom}</gml:posList>
                                </gml:LinearRing>
                            </gml:exterior>
                        </gml:Polygon>
                    </adUcation:the_geom>
                    <adUcation:PERSONS>${area}</adUcation:PERSONS>
                    <adUcation:STATE_NAME>${nome}</adUcation:STATE_NAME>
                </adUcation:states>
            </wfs:Insert>
        </wfs:Transaction>`;

    try {
        // Configure a URL do GeoServer. Substitua <GEOSERVER_URL> pela URL real do seu GeoServer
        const response = await axios.post('http://localhost:8080/geoserver/wfs', xml, {
            headers: {
                'Content-Type': 'application/xml'
            }
        });

        // Verifique a resposta do GeoServer
        console.log('GeoServer Response:', response.data);

        // Retorne uma mensagem de sucesso se a transação for bem-sucedida
        res.json({
            originalMessage: req.body,
            geoserverResponse: response.data
        });
    } catch (error) {
        // Em caso de erro, retorne a mensagem de erro
        console.error('Erro ao fazer a requisição ao Geoserver:', error);
        res.status(500).json({ error: 'Erro ao fazer a requisição ao Geoserver' });
    }
});

module.exports = router;

const app = express();

// Middleware para analisar o corpo da requisição
app.use(express.json());

// Usar o router configurado
app.use('/', router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
*/


const express = require('express');
const axios = require('axios');
const router = express.Router();

// Middleware para analisar o corpo da requisição
router.use(express.json());

// Rota POST para enviar dados ao GeoServer
router.post('api/geoserver/wfs', async (req, res) => {
    const { state_name, persons, the_geom } = req.body;

    // Certifique-se de que o XML está corretamente formatado e que os namespaces estão corretos
    const xml = `
        <wfs:Transaction service="WFS" version="1.1.0"
        xmlns:adUcation="http://www.openplans.org/adUcation:states"
        xmlns:ogc="http://www.opengis.net/ogc"
        xmlns:wfs="http://www.opengis.net/wfs"
        xmlns:gml="http://www.opengis.net/gml"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/WFS-transaction.xsd">
            <wfs:Insert>
                <adUcation:states>
                    <adUcation:the_geom>
                        <gml:Polygon srsName="EPSG:4326">
                            <gml:exterior>
                                <gml:LinearRing>
                                    <gml:posList srsDimension="2">${the_geom}</gml:posList>
                                </gml:LinearRing>
                            </gml:exterior>
                        </gml:Polygon>
                    </adUcation:the_geom>
                    <adUcation:PERSONS>${persons}</adUcation:PERSONS>
                    <adUcation:STATE_NAME>${state_name}</adUcation:STATE_NAME>
                </adUcation:states>
            </wfs:Insert>
        </wfs:Transaction>`;

    try {
        // Configure a URL do GeoServer. Substitua <GEOSERVER_URL> pela URL real do seu GeoServer
        const response = await axios.post('http://localhost:8080/geoserver/adUcation/wfs', xml, {
            headers: {
                'Content-Type': 'application/xml'
                // Adicione a autenticação básica, se necessário
                // 'Authorization': 'Basic ' + Buffer.from('username:password').toString('base64')
            }
        });

        // Verifique a resposta do GeoServer
        console.log('GeoServer Response:', response.data);

        // Retorne uma mensagem de sucesso se a transação for bem-sucedida
        res.json({
            originalMessage: req.body,
            geoserverResponse: response.data
        });
    } catch (error) {
        // Em caso de erro, retorne a mensagem de erro
        console.error('Erro ao fazer a requisição ao Geoserver:', error.response?.data || error.message);
        res.status(500).json({ error: 'Erro ao fazer a requisição ao Geoserver' });
    }
});

module.exports = router;

const app = express();

// Middleware para analisar o corpo da requisição
app.use(express.json());

// Usar o router configurado
app.use('/', router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});



