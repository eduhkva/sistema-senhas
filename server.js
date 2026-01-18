// Importando módulos necessários
const express = require('express');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Configuração inicial
let currentSenha = 0;
let currentSenhaPrioritaria = 0;
let ultimosChamados = [];
const chamadasPorGuiche = {};

// Servindo arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para controle
app.get('/controle', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'controle.html'));
});

// Gerenciando conexões com Socket.io
io.on('connection', (socket) => {
    console.log('Novo cliente conectado');

    // Envia dados iniciais
    socket.emit('updateData', { 
        senha: currentSenha.toString().padStart(3, '0'),
        guiche: "00",
        ultimosChamados
    });

    // Nova senha normal
    socket.on('novaSenha', (data) => {
        currentSenha = currentSenha < 999 ? currentSenha + 1 : 0;
        const guiche = data.guiche;

        const senhaFormatada = currentSenha.toString().padStart(3, '0');
        chamadasPorGuiche[guiche] = { senha: senhaFormatada, guiche };

        ultimosChamados.unshift({ senha: senhaFormatada, guiche });
        if (ultimosChamados.length > 3) ultimosChamados.pop();

        io.emit('updateData', { senha: senhaFormatada, guiche, ultimosChamados });
    });

    // Nova senha prioritária
    socket.on('novaSenhaPrioritaria', (data) => {
        currentSenhaPrioritaria = currentSenhaPrioritaria < 99 ? currentSenhaPrioritaria + 1 : 0;
        const guiche = data.guiche;

        const senhaFormatada = `P${currentSenhaPrioritaria.toString().padStart(2, '0')}`;
        chamadasPorGuiche[guiche] = { senha: senhaFormatada, guiche };

        ultimosChamados.unshift({ senha: senhaFormatada, guiche });
        if (ultimosChamados.length > 3) ultimosChamados.pop();

        io.emit('updateData', { senha: senhaFormatada, guiche, ultimosChamados });
    });

    // Rechamar última
    socket.on('rechamarUltima', (data) => {
        const ultima = chamadasPorGuiche[data.guiche];
        if (ultima) {
            io.emit('updateData', { 
                senha: ultima.senha, 
                guiche: ultima.guiche, 
                ultimosChamados 
            });
        }
    });

    // 🔴 REINICIAR SISTEMA
    socket.on('reiniciarSistema', () => {
        currentSenha = 0;
        currentSenhaPrioritaria = 0;
        ultimosChamados = [];

        for (let g in chamadasPorGuiche) {
            delete chamadasPorGuiche[g];
        }

        io.emit('updateData', { 
            senha: "000", 
            guiche: "00", 
            ultimosChamados 
        });
    });

    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});

// Inicia o servidor
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
