const socket = io();

document.addEventListener('DOMContentLoaded', () => {
    const novaSenhaBtn = document.getElementById('nova-senha');
    const novaSenhaPrioritariaBtn = document.getElementById('nova-senha-prioritaria');
    const rechamarUltimaBtn = document.getElementById('rechamar-ultima');
    const guicheSelect = document.getElementById('guiche');
    const reiniciarBtn = document.getElementById('reiniciar-sistema');

    // Nova senha normal
    novaSenhaBtn.addEventListener('click', () => {
        socket.emit('novaSenha', { guiche: guicheSelect.value });
    });

    // Nova senha prioritária
    novaSenhaPrioritariaBtn.addEventListener('click', () => {
        socket.emit('novaSenhaPrioritaria', { guiche: guicheSelect.value });
    });

    // Rechamar última senha
    rechamarUltimaBtn.addEventListener('click', () => {
        socket.emit('rechamarUltima', { guiche: guicheSelect.value });
    });

    // 🔴 Reiniciar sistema
    reiniciarBtn.addEventListener('click', () => {
        const confirmar = confirm(
            "⚠️ ATENÇÃO!\n\nIsso vai ZERAR todas as senhas e chamados.\n\nDeseja continuar?"
        );

        if (confirmar) {
            socket.emit('reiniciarSistema');
        }
    });
});
