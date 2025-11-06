require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const bcrypt = require('bcryptjs'); // Importa o bcrypt para hash de senhas

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(methodOverride('_method'));

// --- Conexão Mongoose ---
const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/meu-banco-app'; // Fallback para dev local
mongoose.connect(mongoUrl)
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log(err));

// --- Mongoose Schemas ---

// Schema de Endereço (reutilizado do seu original)
const EnderecoSchema = new mongoose.Schema({
    cep: String,
    logradouro: String,
    numero: String,
    complemento: String,
    bairro: String,
    localidade: String,
    uf: String,
}, { _id: false });

// --- 1. Schema de Usuário (Adaptado para o frontend) ---
const UsuarioSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    senha: { type: String, required: true },
    data_nascimento: { type: Date },
    matricula: { type: String, unique: true, sparse: true }, // sparse: true permite múltiplos nulos
    endereco: EnderecoSchema
}, { timestamps: true });

// Hook 'pre-save' para criptografar a senha do Usuário ANTES de salvar
UsuarioSchema.pre('save', async function(next) {
    if (!this.isModified('senha')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.senha = await bcrypt.hash(this.senha, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Método para comparar a senha (para login)
UsuarioSchema.methods.comparePassword = function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.senha);
};

const User = mongoose.model('Usuario', UsuarioSchema);

// --- 2. Schema de Funcao ---
const FuncaoSchema = new mongoose.Schema({
    nome_funcao: { type: String, required: true, unique: true }
}, { timestamps: true });

const Funcao = mongoose.model('Funcao', FuncaoSchema);

// --- 3. Schema de Funcionario ---
const FuncionarioSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    data_nascimento: { type: Date }
}, { timestamps: true });

const Funcionario = mongoose.model('Funcionario', FuncionarioSchema);

// --- 4. Schema de Cargo ---
const CargoSchema = new mongoose.Schema({
    nome_cargo: { type: String, required: true },
    id_funcionario_fk: { type: mongoose.Schema.Types.ObjectId, ref: 'Funcionario' },
    id_funcao_fk: { type: mongoose.Schema.Types.ObjectId, ref: 'Funcao' }
}, { timestamps: true });

const Cargo = mongoose.model('Cargo', CargoSchema);

// --- 5. Schema de UsuarioSistema ---
const UsuarioSistemaSchema = new mongoose.Schema({
    login: { type: String, required: true, unique: true },
    senha: { type: String, required: true },
    ativo: { type: Boolean, default: true },
    ultimo_acesso: { type: Date },
    id_funcionario_fk: { type: mongoose.Schema.Types.ObjectId, ref: 'Funcionario', required: true }
}, { timestamps: true });

// Hook 'pre-save' para criptografar a senha do UsuarioSistema ANTES de salvar
UsuarioSistemaSchema.pre('save', async function(next) {
    if (!this.isModified('senha')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.senha = await bcrypt.hash(this.senha, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Método para comparar a senha (para login)
UsuarioSistemaSchema.methods.comparePassword = function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.senha);
};

const UsuarioSistema = mongoose.model('UsuarioSistema', UsuarioSistemaSchema);


// --- ROTAS ---
// O frontend espera que todas as rotas comecem com /api/mongo
// Vamos criar um roteador principal para lidar com isso.
const apiRouter = express.Router();

// --- Rotas de Usuário ---

// POST /api/mongo/usuario (Criar Usuário)
apiRouter.post('/usuario', async (req, res) => {
    try {
        // Os dados vêm do corpo da requisição
        const { nome, email, senha, data_nascimento, matricula, endereco } = req.body;

        if (!nome || !email || !senha) {
            return res.status(400).json({ error: "Nome, Email e Senha são obrigatórios." });
        }

        // A senha será criptografada automaticamente pelo hook 'pre-save'
        const newUser = new User({
            nome,
            email,
            senha,
            data_nascimento,
            matricula,
            endereco
        });

        await newUser.save();
        res.status(201).json({ status: "adicionado com sucesso", _id: newUser._id });
    } catch (err) {
        if (err.code === 11000) { // Erro de duplicidade (email ou matricula)
            return res.status(409).json({ error: "Email ou Matrícula já existe." });
        }
        res.status(500).json({ error: err.message });
    }
});

// GET /api/mongo/usuario (Listar todos)
apiRouter.get('/usuario', async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/mongo/usuario/email/:email (Buscar por Email)
apiRouter.get('/usuario/email/:email', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email });
        if (!user) {
            return res.status(404).json({ "status": "usuário não encontrado" });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/mongo/usuario/auth (Autenticar)
apiRouter.post('/usuario/auth', async (req, res) => {
    try {
        const { email, senha } = req.body;
        if (!email || !senha) {
            return res.status(400).json({ error: "Email e Senha são obrigatórios." });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ error: "Autenticação falhou. Usuário não encontrado." });
        }

        const isMatch = await user.comparePassword(senha);
        if (!isMatch) {
            return res.status(401).json({ error: "Autenticação falhou. Senha incorreta." });
        }

        // Não retorne a senha!
        const userObject = user.toObject();
        delete userObject.senha;
        
        res.json({ status: "autenticado com sucesso", user: userObject });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/mongo/usuario/:id (Atualizar)
apiRouter.put('/usuario/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // O frontend não envia a senha na atualização, então não precisamos nos preocupar
        // em criptografar aqui. Se enviasse, precisaríamos de lógica adicional.

        const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ error: "Usuário não encontrado." });
        }
        res.json({ status: "atualizado com sucesso", user: updatedUser });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/mongo/usuario/:id (Deletar)
apiRouter.delete('/usuario/:id', async (req, res) => {
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

// --- Rotas de Funcao (CRUD Simples) ---

// POST /api/mongo/funcao
apiRouter.post('/funcao', async (req, res) => {
    try {
        const newObj = new Funcao(req.body);
        await newObj.save();
        res.status(201).json({ status: "adicionado", _id: newObj._id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/mongo/funcao
apiRouter.get('/funcao', async (req, res) => {
    try {
        const items = await Funcao.find({});
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/mongo/funcao/:id
apiRouter.put('/funcao/:id', async (req, res) => {
    try {
        const updatedObj = await Funcao.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedObj) return res.status(404).json({ error: "Item não encontrado." });
        res.json({ status: "atualizado", item: updatedObj });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/mongo/funcao/:id
apiRouter.delete('/funcao/:id', async (req, res) => {
    try {
        const result = await Funcao.findByIdAndDelete(req.params.id);
        if (!result) return res.status(404).json({ status: "Item não encontrado" });
        res.json({ status: "deletado com sucesso" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Rotas de Funcionario (CRUD Simples) ---

// POST /api/mongo/funcionario
apiRouter.post('/funcionario', async (req, res) => {
    try {
        const newObj = new Funcionario(req.body);
        await newObj.save();
        res.status(201).json({ status: "adicionado", _id: newObj._id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/mongo/funcionario
apiRouter.get('/funcionario', async (req, res) => {
    try {
        const items = await Funcionario.find({});
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/mongo/funcionario/:id
apiRouter.put('/funcionario/:id', async (req, res) => {
    try {
        const updatedObj = await Funcionario.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedObj) return res.status(404).json({ error: "Item não encontrado." });
        res.json({ status: "atualizado", item: updatedObj });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/mongo/funcionario/:id
apiRouter.delete('/funcionario/:id', async (req, res) => {
    try {
        const result = await Funcionario.findByIdAndDelete(req.params.id);
        if (!result) return res.status(404).json({ status: "Item não encontrado" });
        res.json({ status: "deletado com sucesso" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Rotas de Cargo ---

// POST /api/mongo/cargo
apiRouter.post('/cargo', async (req, res) => {
    try {
        const newObj = new Cargo(req.body);
        await newObj.save();
        res.status(201).json({ status: "adicionado", _id: newObj._id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/mongo/cargo
apiRouter.get('/cargo', async (req, res) => {
    try {
        const items = await Cargo.find({});
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/mongo/cargo/completo (com populate)
apiRouter.get('/cargo/completo', async (req, res) => {
    try {
        const items = await Cargo.find({})
            .populate('id_funcionario_fk')
            .populate('id_funcao_fk');
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/mongo/cargo/:id
apiRouter.put('/cargo/:id', async (req, res) => {
    try {
        const updatedObj = await Cargo.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedObj) return res.status(404).json({ error: "Item não encontrado." });
        res.json({ status: "atualizado", item: updatedObj });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/mongo/cargo/:id
apiRouter.delete('/cargo/:id', async (req, res) => {
    try {
        const result = await Cargo.findByIdAndDelete(req.params.id);
        if (!result) return res.status(404).json({ status: "Item não encontrado" });
        res.json({ status: "deletado com sucesso" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Rotas de UsuarioSistema ---

// POST /api/mongo/usuario-sistema
apiRouter.post('/usuario-sistema', async (req, res) => {
    try {
        // A senha será criptografada pelo hook pre-save
        const newObj = new UsuarioSistema(req.body);
        await newObj.save();
        res.status(201).json({ status: "adicionado", _id: newObj._id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/mongo/usuario-sistema
apiRouter.get('/usuario-sistema', async (req, res) => {
    try {
        const items = await UsuarioSistema.find({}).select('-senha'); // Nunca retorne senhas
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/mongo/usuario-sistema/completo
apiRouter.get('/usuario-sistema/completo', async (req, res) => {
    try {
        const items = await UsuarioSistema.find({})
            .populate('id_funcionario_fk')
            .select('-senha'); // Nunca retorne senhas
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/mongo/usuario-sistema/login/:login
apiRouter.get('/usuario-sistema/login/:login', async (req, res) => {
    try {
        const item = await UsuarioSistema.findOne({ login: req.params.login })
            .populate('id_funcionario_fk')
            .select('-senha');
        if (!item) return res.status(404).json({ error: "Usuário não encontrado." });
        res.json(item);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/mongo/usuario-sistema/:id
apiRouter.put('/usuario-sistema/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Se a senha estiver sendo atualizada, criptografe-a
        if (updateData.senha) {
            const salt = await bcrypt.genSalt(10);
            updateData.senha = await bcrypt.hash(updateData.senha, salt);
        }

        const updatedObj = await UsuarioSistema.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedObj) return res.status(404).json({ error: "Item não encontrado." });
        
        const userObject = updatedObj.toObject();
        delete userObject.senha; // Não retorne a senha
        
        res.json({ status: "atualizado", item: userObject });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/mongo/usuario-sistema/:id/ultimo-acesso
apiRouter.put('/usuario-sistema/:id/ultimo-acesso', async (req, res) => {
    try {
        const updatedObj = await UsuarioSistema.findByIdAndUpdate(
            req.params.id, 
            { ultimo_acesso: new Date() }, 
            { new: true }
        );
        if (!updatedObj) return res.status(404).json({ error: "Item não encontrado." });
        res.json({ status: "ultimo acesso atualizado" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/mongo/usuario-sistema/:id
apiRouter.delete('/usuario-sistema/:id', async (req, res) => {
    try {
        const result = await UsuarioSistema.findByIdAndDelete(req.params.id);
        if (!result) return res.status(404).json({ status: "Item não encontrado" });
        res.json({ status: "deletado com sucesso" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// --- Monta o Roteador Principal ---
// Todas as rotas definidas em `apiRouter` serão prefixadas com /api/mongo
app.use('/api/mongo', apiRouter);

// Rota raiz de fallback (opcional)
app.get('/', (req, res) => {
    res.send('API está no ar. Use o prefixo /api/mongo para acessar os recursos.');
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});