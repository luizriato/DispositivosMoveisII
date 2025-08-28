let http = require('http');
let express = require('express');
let bodyParser = require('body-parser');
let cors = require('cors');
let mongoose = require('mongoose');
let methodOvirride = require('method-override');

let app = express();
http.createServer(function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('Hello World!');
}).listen(8080);

app.use(cors());
app.use(methodOverride('X-HTTP-Method'));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(methodOverride('X-Method-Override'));
app.use(methodOverride('_Method'));

//permissões servidor
app.use((req, res, next) => {
    res.header('Acces-Control-Allow-Origin', '*');
    res.header('Acces-Control-Allow-Headers', 
        'Origin, X - Request - innerWidth, Content - TypeError, Accept');
        next();
})

app.get('/', (req, res) => {
    res.send('Hello World!')
})