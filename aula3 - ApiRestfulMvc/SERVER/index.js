require('dotenv').config();
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
app.use(methodOverride('_method'));

// --- Mongoose Connection ---
const mongoUrl = process.env.MONGODB_URI;
mongoose.connect(mongoUrl)
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log(err));

// --- NEW: Mongoose Schemas and Model ---
const EnderecoSchema = new mongoose.Schema({
    cep: String,
    logradouro: String,
    numero: String,
    complemento: String,
    bairro: String,
    localidade: String,
    uf: String,
}, { _id: false }); // _id: false prevents MongoDB from creating an _id for the sub-document

const UsuarioSchema = new mongoose.Schema({
    matricula: {
        type: String,
        required: true,
        unique: true // Ensures each matricula is unique
    },
    nome: {
        type: String,
        required: true
    },
    cursos: [String], // Defines cursos as an array of strings
    endereco: EnderecoSchema
});

const User = mongoose.model('Usuario', UsuarioSchema);


// --- Routes ---

// GET all users
app.get('/', async (req, res) => {
    try {
        const users = await User.find({});
        if (users.length > 0) {
            res.json(users);
        } else {
            res.json({ "status": "não há usuários" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET a single user by ID
app.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ "status": "usuário não encontrado" });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST: Insert a new user (UPDATED)
app.post('/inserir', async (req, res) => {
    try {
        const { matricula, nome, cursos, endereco } = req.body;

        if (!matricula || !nome) {
            return res.status(400).json({ error: "Matrícula e Nome são obrigatórios." });
        }

        // The 'cursos' field from the frontend will be a single string. We split it into an array.
        const cursosArray = cursos ? cursos.split(',').map(curso => curso.trim()) : [];

        const newUser = new User({
            matricula,
            nome,
            cursos: cursosArray,
            endereco
        });

        await newUser.save();
        res.status(201).json({ status: "adicionado com sucesso", user: newUser });
    } catch (err) {
        // This error code (11000) indicates a duplicate key (our unique matricula)
        if (err.code === 11000) {
            return res.status(409).json({ error: "Matrícula já existe." });
        }
        res.status(500).json({ error: err.message });
    }
});

// PUT: Update an existing user (UPDATED)
app.put('/atualizar/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Ensure cursos is handled as an array
        if (updateData.cursos && typeof updateData.cursos === 'string') {
            updateData.cursos = updateData.cursos.split(',').map(curso => curso.trim());
        }

        const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ error: "Usuário não encontrado." });
        }
        res.json({ status: "atualizado com sucesso", user: updatedUser });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// DELETE a user by ID
app.delete('/deletar/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await User.findByIdAndDelete(id);
        if (!result) {
            return res.status(404).json({ "status": "usuário não encontrado" });
        }
        res.json({ "status": "deletado com sucesso" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Example app listening on http://localhost:${port}`);
});