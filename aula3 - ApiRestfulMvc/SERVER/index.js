require('dotenv').config();
console.log('dotenv carregado:', process.env.MONGODB_URI);
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const methodOverride = require('method-override');


const app = express();
const port = process.env.PORT || 3000;

// Middleware   

app.use(cors());
app.use(bodyParser.json());
app.use(methodOverride('X-HTTP-Method'));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(methodOverride('X-Method-Override'));
app.use(methodOverride('_method')); // Common usage with forms

const mongoUrl = process.env.MONGODB_URI;
mongoose.connect(mongoUrl)
    .then(() => console.log('MongoDb connected...'))
    .catch(err => console.log(err));

// CORS headers (if needed beyond the `cors()` middleware)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Start server
app.listen(port, () => {
    console.log(`Example app listening on http://localhost:${port}`);
});

// Routes
// Ignora favicon.ico para evitar CastError
app.get('/favicon.ico', (req, res) => res.status(204).end());

app.get('/', async (req, res) => {
    try {
        const users = await User.find({});
        if(users.length > 0){
            res.json(users);
        } else {
            res.json({"status": "não há usuários"});
        }
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});


app.get('/:id', async(req, res) => {
    let id = req.params.id;
    let user = await User.findOne({_id: id});
    res.json(user);
})

app.delete('/deletar', async (req, res) => {
    let corpo = req.body.name;
    await User.deleteOne({nome: corpo});
    // res.send({ status: 'deletado' });
    res.json({"status": "deletado com sucesso"});
});

app.delete('/deletar/:id', async (req, res) => {
    let id = req.params.id;
    await User.deleteOne({_id: req.params.id});
    res.json({"status": "deletado com sucesso"});
});

var User = mongoose.model('Usuario', { nome: String });

app.post('/inserir', (req, res) => {
    let corpo = req.body.name;
    let user = new User({ nome: corpo });
    user.save().then(() => console.log('Usuário savo com sucesso'));
    // res.send({ status: 'adicionado' })
    res.json({"status": "adicionado com sucesso"});
})

app.put('/atualizar/:id', async (req, res) => {
    let id = req.params.id;
    let corpo = req.body.name;
    await User.updateOne({_id: id}, {nome: corpo});
    res.json({"status": "atualizado com sucesso"});
});