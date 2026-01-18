const socket = io();

document.addEventListener('DOMContentLoaded', () => {
    const senhaAtualElem = document.getElementById('senha-atual');
    const guicheAtualElem = document.getElementById('guiche-atual');
    const listaUltimos = document.getElementById('lista-ultimos');
    const novaSenhaBtn = document.getElementById('nova-senha');
    const novaSenhaPrioritariaBtn = document.getElementById('nova-senha-prioritaria');
    const rechamarUltimaBtn = document.getElementById('rechamar-ultima');
    const guicheSelect = document.getElementById('guiche');
    const alertAudio = new Audio('alert.mp3'); // Som de alerta

    // Função para anunciar senha e guichê
const anunciarSenha = (senha, guiche) => {
    alertAudio.play().then(() => {
        alertAudio.onended = () => {
            const fala = new SpeechSynthesisUtterance(`Senha ${senha}, compareça ao guichê ${guiche}.`);
            const voices = speechSynthesis.getVoices();
            
            // Escolha da voz - ajuste o índice ou encontre pelo nome
            fala.voice = voices.find(voice => voice.name.includes('Google português')) || voices[0];
            
            speechSynthesis.speak(fala);
        };
    }).catch(err => console.error('Erro ao tocar o áudio de alerta:', err));
};
    // Atualiza a interface
    socket.on('updateData', (data) => {
        senhaAtualElem.textContent = data.senha;
        guicheAtualElem.textContent = data.guiche;

        listaUltimos.innerHTML = '';
        data.ultimosChamados.forEach(chamado => {
            const li = document.createElement('li');
            li.textContent = `Senha ${chamado.senha} - Guichê ${chamado.guiche}`;
            listaUltimos.appendChild(li);
        });

        // Anuncia a nova senha
        anunciarSenha(data.senha, data.guiche);
    });

    // Botão para nova senha
    novaSenhaBtn.addEventListener('click', () => {
        const guicheSelecionado = guicheSelect.value;
        socket.emit('novaSenha', { guiche: guicheSelecionado });
    });

    // Botão para nova senha prioritária
    novaSenhaPrioritariaBtn.addEventListener('click', () => {
        const guicheSelecionado = guicheSelect.value;
        socket.emit('novaSenhaPrioritaria', { guiche: guicheSelecionado });
    });

    // Botão para rechamar última senha
    rechamarUltimaBtn.addEventListener('click', () => {
        const guicheSelecionado = guicheSelect.value;
        socket.emit('rechamarUltima', { guiche: guicheSelecionado });
    });
});
