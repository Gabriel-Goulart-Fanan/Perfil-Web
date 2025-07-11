const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('uploads'));

// Configuração do multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const nomeArquivo = Date.now() + ext;
    cb(null, nomeArquivo);
  }
});
const upload = multer({ storage });

// Rota para buscar todos os usuários
app.get('/usuarios', (req, res) => {
  db.query('SELECT * FROM usuarios', (err, results) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar usuários' });
    res.json(results);
  });
});

// 🔍 Busca usuário por CPF (para login) — agora com logs para depuração
app.get('/usuario/:cpf', (req, res) => {
  const cpf = req.params.cpf.replace(/\D/g, '');
  console.log('Buscando CPF:', cpf);

  if (!cpf || cpf.length !== 11 || /\D/.test(cpf)) {
    console.log('CPF inválido recebido:', req.params.cpf);
    return res.status(400).json({ erro: 'CPF inválido.' });
  }

  db.query('SELECT * FROM usuarios WHERE cpf = ?', [cpf], (err, results) => {
    if (err) {
      console.error('Erro ao buscar usuário:', err.message);
      return res.status(500).json({ erro: 'Erro ao buscar usuário no banco de dados.' });
    }

    console.log('Resultados da consulta:', results);

    if (results.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    res.json(results[0]);
  });
});

// Cadastro do usuário
app.post('/usuario', upload.single('imagem'), (req, res) => {
  let { nome, idade, rua, bairro, estado, biografia, cpf } = req.body;
  cpf = cpf.replace(/\D/g, '');
  const imagem_perfil = req.file ? req.file.filename : null;

  if (!cpf || cpf.length !== 11 || /\D/.test(cpf)) {
    return res.status(400).json({ erro: 'CPF inválido. Deve conter 11 números.' });
  }

  const query = `
    INSERT INTO usuarios (nome, idade, rua, bairro, estado, biografia, imagem_perfil, cpf)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [nome, idade, rua, bairro, estado, biografia, imagem_perfil, cpf];

  db.query(query, values, (err) => {
    if (err) {
      console.error('Erro ao salvar usuário:', err.message);
      return res.status(500).json({ erro: 'Erro ao salvar no banco de dados.' });
    }
    res.json({ mensagem: 'Usuário salvo com sucesso!' });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
