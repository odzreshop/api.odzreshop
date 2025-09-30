require('dotenv').config();
const express = require('express');
const { engine } = require('express-handlebars');
const endpoints = require('./endpoints');
const app = express();
const port = 3000;
app.engine('handlebars', engine({
    helpers: { json: (context) => JSON.stringify(context) }
}));
app.set('view engine', 'handlebars');
app.set('views', './views');
app.use(express.static('public'));
app.get('/', (req, res) => {
    res.render('home', { 
        endpoints,
        baseUrl: process.env.BASE_URL || `http://localhost:${port}`,
        layout: 'main' 
    });
});
endpoints.forEach(endpoint => {
    app.get(endpoint.path, async (req, res) => {
        try {
            const externalUrl = new URL(endpoint.apiUrl);
            externalUrl.searchParams.append('apikey', process.env.API_KEY);
            Object.keys(req.query).forEach(key => {
                externalUrl.searchParams.append(key, req.query[key]);
            });
            const fetch = (await import('node-fetch')).default;
            const response = await fetch(externalUrl.toString());
            let data = await response.json();
            if (data.creator) data.creator = "OdzreShop";
            if (data.result && data.result.creator) data.result.creator = "OdzreShop";
            res.json(data);
        } catch (error) {
            res.status(500).json({ error: 'Gagal mengambil data dari API eksternal', details: error.message });
        }
    });
});
app.listen(port, () => {
    console.log(`OdzreShop API berjalan di http://localhost:${port}`);
});
