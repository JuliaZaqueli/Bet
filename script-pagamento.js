// Inicializar EmailJS
(function() {
    emailjs.init("gP-FJKwK1pL-13ok-");
})();

// Elementos DOM
const resumoCampeonato = document.getElementById('resumo-campeonato');
const resumoOddTotal = document.getElementById('resumo-odd-total');
const resumoValor = document.getElementById('resumo-valor');
const resumoGanho = document.getElementById('resumo-ganho');
const valorAposta = document.getElementById('valor-aposta');
const valorInstrucoes = document.getElementById('valor-instrucoes');
const btnVoltar = document.getElementById('btn-voltar');
const btnComprovante = document.getElementById('btn-comprovante');
const btnNovaAposta = document.getElementById('btn-nova-aposta');
const successMessage = document.getElementById('success-message');
const modalConfirmacao = document.getElementById('modal-confirmacao');
const btnModalCancelar = document.getElementById('btn-modal-cancelar');
const btnModalConfirmar = document.getElementById('btn-modal-confirmar');
const chavePix = document.getElementById('chave-pix');
const btnCopiar = document.getElementById('btn-copiar');

// Variáveis
let dadosAposta = null;
const CHAVE_PIX_NUBANK = "bbaa097c-d285-4663-9775-f1ed59a97665";

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    console.log('Página de Pagamento - Carregando dados...');
    
    // Carregar dados do localStorage
    const dadosSalvos = localStorage.getItem('dadosAposta');
    if (!dadosSalvos) {
        alert('Nenhuma aposta encontrada. Volte à página inicial.');
        window.location.href = 'index.html';
        return;
    }
    
    dadosAposta = JSON.parse(dadosSalvos);
    carregarDadosPagamento();
    
    // Event listeners
    btnVoltar.addEventListener('click', voltarParaUsuario);
    btnComprovante.addEventListener('click', mostrarModalConfirmacao);
    btnNovaAposta.addEventListener('click', novaAposta);
    btnModalCancelar.addEventListener('click', fecharModal);
    btnModalConfirmar.addEventListener('click', confirmarComprovante);
    btnCopiar.addEventListener('click', copiarChavePix);
});

// Carregar dados do pagamento
function carregarDadosPagamento() {
    resumoCampeonato.textContent = dadosAposta.campeonato;
    resumoOddTotal.textContent = dadosAposta.oddTotal;
    
    // Definir valor baseado no tipo de aposta
    let valorTotal = 0;
    if (dadosAposta.tipo === 'multipla') {
        valorTotal = dadosAposta.valorMultipla;
    } else {
        valorTotal = dadosAposta.apostasIndividuais.reduce((total, aposta) => total + aposta.valorApostado, 0);
    }
    
    resumoValor.textContent = valorTotal.toFixed(2);
    resumoGanho.textContent = dadosAposta.ganhoPotencialMultipla || 
        dadosAposta.apostasIndividuais.reduce((total, aposta) => total + parseFloat(aposta.ganhoPotencial), 0).toFixed(2);
    
    valorAposta.textContent = valorTotal.toFixed(2);
    valorInstrucoes.textContent = valorTotal.toFixed(2);
    
    gerarQRCodePIX(valorTotal);
    chavePix.textContent = CHAVE_PIX_NUBANK;
}

// Gerar QR Code PIX
function gerarQRCodePIX(valor) {
    const qrcodeContainer = document.getElementById('qrcode');
    qrcodeContainer.innerHTML = '';
    
    const textoQRCode = `PIX: R$ ${valor.toFixed(2)} - Aposta ${dadosAposta.tipo === 'multipla' ? 'Múltipla' : 'Individual'}`;
    
    try {
        QRCode.toCanvas(qrcodeContainer, textoQRCode, {
            width: 200,
            margin: 2,
            color: {
                dark: '#8A05BE',
                light: '#FFFFFF'
            }
        }, function(error) {
            if (error) {
                console.error('Erro ao gerar QR Code:', error);
                qrcodeContainer.innerHTML = `<p>${textoQRCode}</p>`;
            }
        });
    } catch (error) {
        console.error('Erro no QR Code:', error);
        qrcodeContainer.innerHTML = `<p>${textoQRCode}</p>`;
    }
}

// Voltar para página do usuário
function voltarParaUsuario() {
    window.location.href = 'usuario.html';
}

// Mostrar modal de confirmação
function mostrarModalConfirmacao() {
    modalConfirmacao.style.display = 'block';
}

// Fechar modal
function fecharModal() {
    modalConfirmacao.style.display = 'none';
}

// Confirmar comprovante
function confirmarComprovante() {
    fecharModal();
    successMessage.classList.remove('hidden');
    
    // Enviar email de confirmação
    enviarEmailConfirmacao();
    
    // Limpar localStorage após confirmação
    setTimeout(() => {
        localStorage.removeItem('dadosAposta');
    }, 5000);
}

// Nova aposta
function novaAposta() {
    localStorage.removeItem('dadosAposta');
    window.location.href = 'index.html';
}

// Copiar chave PIX
function copiarChavePix() {
    navigator.clipboard.writeText(CHAVE_PIX_NUBANK)
        .then(() => {
            alert('Chave PIX copiada para a área de transferência!');
        })
        .catch(err => {
            console.error('Erro ao copiar chave PIX:', err);
            // Fallback para navegadores mais antigos
            const textArea = document.createElement('textarea');
            textArea.value = CHAVE_PIX_NUBANK;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('Chave PIX copiada para a área de transferência!');
        });
}