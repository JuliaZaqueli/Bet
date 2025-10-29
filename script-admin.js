// Dados dos campeonatos - carregar do localStorage ou usar padrão
let campeonatos = {};
let campeonatoAtual = 'serie-a';

// Elementos DOM
const listaJogosAdmin = document.getElementById('lista-jogos-admin');
const btnNovoJogo = document.getElementById('btn-novo-jogo');
const btnSalvarTudo = document.getElementById('btn-salvar-tudo');
const modalNovoJogo = document.getElementById('modal-novo-jogo');
const btnCancelarNovo = document.getElementById('btn-cancelar-novo');
const btnConfirmarNovo = document.getElementById('btn-confirmar-novo');
const campeonatoTabs = document.getElementById('campeonato-tabs');
const btnAdicionarCampeonato = document.getElementById('btn-adicionar-campeonato');
const btnExportarDados = document.getElementById('btn-exportar-dados');
const btnImportarDados = document.getElementById('btn-importar-dados');
const modalImportar = document.getElementById('modal-importar');
const btnCancelarImportar = document.getElementById('btn-cancelar-importar');
const btnConfirmarImportar = document.getElementById('btn-confirmar-importar');

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    carregarDados();
    carregarInterface();
    
    // Event listeners para tabs (agora delegado)
    campeonatoTabs.addEventListener('click', function(e) {
        if (e.target.classList.contains('campeonato-tab')) {
            document.querySelectorAll('.campeonato-tab').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            campeonatoAtual = e.target.dataset.campeonato;
            carregarJogosCampeonato();
        }
        
        // Botão excluir campeonato
        if (e.target.classList.contains('btn-excluir-campeonato')) {
            const campeonatoId = e.target.dataset.campeonato;
            excluirCampeonato(campeonatoId);
        }
    });

    // Event listeners para botões
    btnNovoJogo.addEventListener('click', mostrarModalNovoJogo);
    btnSalvarTudo.addEventListener('click', salvarTodasAlteracoes);
    btnCancelarNovo.addEventListener('click', fecharModalNovoJogo);
    btnConfirmarNovo.addEventListener('click', adicionarNovoJogo);
    btnAdicionarCampeonato.addEventListener('click', adicionarNovoCampeonato);
    btnExportarDados.addEventListener('click', exportarDados);
    btnImportarDados.addEventListener('click', mostrarModalImportar);
    btnCancelarImportar.addEventListener('click', fecharModalImportar);
    btnConfirmarImportar.addEventListener('click', importarDados);
    
    // Fechar modal ao clicar fora
    window.addEventListener('click', function(event) {
        if (event.target === modalNovoJogo) {
            fecharModalNovoJogo();
        }
        if (event.target === modalImportar) {
            fecharModalImportar();
        }
    });
});

// Carregar dados
function carregarDados() {
    const dadosAdmin = localStorage.getItem('campeonatosAdmin');
    const dadosSistema = localStorage.getItem('campeonatosSistema');
    
    if (dadosAdmin) {
        campeonatos = JSON.parse(dadosAdmin);
        console.log('✅ Dados carregados do localStorage admin');
    } else if (dadosSistema) {
        campeonatos = JSON.parse(dadosSistema);
        console.log('✅ Dados carregados do localStorage sistema');
    } else {
        // Inicializar com estrutura vazia
        campeonatos = {
            "serie-a": {
                nome: "Série A",
                jogos: []
            },
            "champions": {
                nome: "Champions League",
                jogos: []
            },
            "sul-americana": {
                nome: "Copa Sul-Americana",
                jogos: []
            }
        };
        console.log('✅ Estrutura inicial de campeonatos criada');
        salvarNoLocalStorage();
    }
}

// Carregar interface
function carregarInterface() {
    carregarTabsCampeonatos();
    carregarJogosCampeonato();
}

// Carregar tabs dos campeonatos
function carregarTabsCampeonatos() {
    campeonatoTabs.innerHTML = '';
    
    Object.keys(campeonatos).forEach(campeonatoId => {
        const campeonato = campeonatos[campeonatoId];
        const tab = document.createElement('button');
        tab.className = `campeonato-tab ${campeonatoId === campeonatoAtual ? 'active' : ''}`;
        tab.dataset.campeonato = campeonatoId;
        tab.innerHTML = `
            ${campeonato.nome}
            <span class="btn-excluir-campeonato" data-campeonato="${campeonatoId}" style="margin-left: 8px; background: #dc3545; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; font-size: 12px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;">×</span>
        `;
        campeonatoTabs.appendChild(tab);
    });
}

// Adicionar novo campeonato
function adicionarNovoCampeonato() {
    const campeonatoId = document.getElementById('novo-campeonato-id').value.trim().toLowerCase().replace(/\s+/g, '-');
    const campeonatoNome = document.getElementById('novo-campeonato-nome').value.trim();
    
    if (!campeonatoId || !campeonatoNome) {
        alert('Preencha todos os campos do campeonato');
        return;
    }
    
    if (campeonatos[campeonatoId]) {
        alert('Já existe um campeonato com este ID');
        return;
    }
    
    // Adicionar novo campeonato
    campeonatos[campeonatoId] = {
        nome: campeonatoNome,
        jogos: []
    };
    
    // Limpar formulário
    document.getElementById('novo-campeonato-id').value = '';
    document.getElementById('novo-campeonato-nome').value = '';

    // Atualizar interface
    carregarTabsCampeonatos();
    salvarNoLocalStorage();
    forcarAtualizacaoPaginaPrincipal(); // ← ADICIONAR ESTA LINHA
    
    alert(`✅ Campeonato "${campeonatoNome}" adicionado com sucesso!`);
}
// Excluir campeonato
function excluirCampeonato(campeonatoId) {
    if (!confirm(`Tem certeza que deseja excluir o campeonato "${campeonatos[campeonatoId]?.nome}"? Todos os jogos serão perdidos.`)) {
        return;
    }
    
    delete campeonatos[campeonatoId];
    
    // Se era o campeonato atual, mudar para o primeiro disponível
    if (campeonatoAtual === campeonatoId) {
        const primeiroCampeonato = Object.keys(campeonatos)[0];
        campeonatoAtual = primeiroCampeonato || 'serie-a';
    }
    
    carregarTabsCampeonatos();
    carregarJogosCampeonato();
    salvarNoLocalStorage();
    forcarAtualizacaoPaginaPrincipal(); // ← ADICIONAR ESTA LINHA
}

// Exportar dados
function exportarDados() {
    const dados = JSON.stringify(campeonatos, null, 2);
    const blob = new Blob([dados], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `dados-campeonatos-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('✅ Dados exportados com sucesso!');
}

// Mostrar modal de importar
function mostrarModalImportar() {
    modalImportar.style.display = 'block';
}

// Fechar modal de importar
function fecharModalImportar() {
    modalImportar.style.display = 'none';
    document.getElementById('dados-importar').value = '';
}

// Importar dados
function importarDados() {
    const dadosTexto = document.getElementById('dados-importar').value.trim();
    
    if (!dadosTexto) {
        alert('Cole os dados JSON para importar');
        return;
    }
    
    try {
        const novosDados = JSON.parse(dadosTexto);
        
        // Validar estrutura básica
        if (typeof novosDados !== 'object' || novosDados === null) {
            throw new Error('Dados inválidos');
        }
        
        // Substituir dados atuais
        campeonatos = novosDados;
        
        carregarTabsCampeonatos();
        carregarJogosCampeonato();
        salvarNoLocalStorage();
        forcarAtualizacaoPaginaPrincipal(); // ← ADICIONAR ESTA LINHA
        
        fecharModalImportar();
        alert('✅ Dados importados com sucesso!');
        
    } catch (error) {
        alert('❌ Erro ao importar dados. Verifique se o JSON está correto.');
        console.error('Erro na importação:', error);
    }
}

// Carregar jogos do campeonato atual
function carregarJogosCampeonato() {
    if (!campeonatos[campeonatoAtual]) {
        if (listaJogosAdmin) {
            listaJogosAdmin.innerHTML = '<div class="carrinho-vazio">Campeonato não encontrado</div>';
        }
        return;
    }

    const jogos = campeonatos[campeonatoAtual].jogos || [];
    
    if (!listaJogosAdmin) {
        console.error('Elemento listaJogosAdmin não encontrado');
        return;
    }
    
    listaJogosAdmin.innerHTML = '';

    if (jogos.length === 0) {
        listaJogosAdmin.innerHTML = `
            <div class="carrinho-vazio">
                Nenhum jogo cadastrado neste campeonato<br>
                <small>Use o botão "Adicionar Novo Jogo" para começar</small>
            </div>
        `;
        return;
    }

    jogos.forEach((jogo, index) => {
        const jogoElement = document.createElement('div');
        jogoElement.className = 'jogo-card';
        jogoElement.innerHTML = `
            <div class="jogo-header">
                <div class="jogo-times">${jogo.timeCasa} vs ${jogo.timeFora}</div>
                <div class="jogo-actions">
                    <button class="btn-small btn-danger" onclick="excluirJogo(${index})">🗑️ Excluir</button>
                </div>
            </div>
            <div class="form-group">
                <label>Data:</label>
                <input type="text" value="${jogo.data}" onchange="atualizarJogo(${index}, 'data', this.value)">
            </div>
            
            <div class="odds-section">
                <h4>🎯 Odds Principais</h4>
                <div class="odds-grid">
                    <div class="odd-input-group">
                        <label>${jogo.timeCasa}:</label>
                        <input type="number" step="0.01" value="${jogo.odds.casa}" 
                               onchange="atualizarJogo(${index}, 'odds.casa', this.value)">
                    </div>
                    <div class="odd-input-group">
                        <label>Empate:</label>
                        <input type="number" step="0.01" value="${jogo.odds.empate}" 
                               onchange="atualizarJogo(${index}, 'odds.empate', this.value)">
                    </div>
                    <div class="odd-input-group">
                        <label>${jogo.timeFora}:</label>
                        <input type="number" step="0.01" value="${jogo.odds.fora}" 
                               onchange="atualizarJogo(${index}, 'odds.fora', this.value)">
                    </div>
                </div>
            </div>

            <div class="odds-section">
                <h4>⚽ Odds de Gols</h4>
                <div class="odds-grid">
                    ${gerarInputsOddsAdicionais(jogo, index, 'gols')}
                </div>
            </div>

            <div class="odds-section">
                <h4>⏰ Tempo de Gols</h4>
                <div class="odds-grid">
                    ${gerarInputsTempoGols(jogo, index)}
                </div>
            </div>

            <div class="odds-section">
                <h4>📐 Escanteios</h4>
                <div class="odds-grid">
                    ${gerarInputsEscanteios(jogo, index)}
                </div>
            </div>
        `;
        listaJogosAdmin.appendChild(jogoElement);
    });
}

// Gerar inputs para odds adicionais de gols
function gerarInputsOddsAdicionais(jogo, index, categoria) {
    if (!jogo.oddsAdicionais || !jogo.oddsAdicionais[categoria]) {
        return '<div>Estrutura não definida</div>';
    }

    let html = '';
    const gols = jogo.oddsAdicionais[categoria];
    
    // Mais que
    if (gols.mais) {
        gols.mais.forEach((opcao, i) => {
            html += `
                <div class="odd-input-group">
                    <label>${opcao.tipo}:</label>
                    <input type="number" step="0.01" value="${opcao.odd}" 
                           onchange="atualizarOddAdicional(${index}, '${categoria}.mais', ${i}, this.value)">
                </div>
            `;
        });
    }

    // Exato
    if (gols.exato) {
        gols.exato.forEach((opcao, i) => {
            html += `
                <div class="odd-input-group">
                    <label>${opcao.tipo}:</label>
                    <input type="number" step="0.01" value="${opcao.odd}" 
                           onchange="atualizarOddAdicional(${index}, '${categoria}.exato', ${i}, this.value)">
                </div>
            `;
        });
    }

    return html;
}

// Gerar inputs para tempo de gols
function gerarInputsTempoGols(jogo, index) {
    if (!jogo.oddsAdicionais || !jogo.oddsAdicionais.tempoGols) {
        return '<div>Estrutura não definida</div>';
    }

    let html = '';
    jogo.oddsAdicionais.tempoGols.forEach((opcao, i) => {
        html += `
            <div class="odd-input-group">
                <label>${opcao.tipo}:</label>
                <input type="number" step="0.01" value="${opcao.odd}" 
                       onchange="atualizarTempoGols(${index}, ${i}, this.value)">
            </div>
        `;
    });
    return html;
}

// Gerar inputs para escanteios
function gerarInputsEscanteios(jogo, index) {
    if (!jogo.oddsAdicionais || !jogo.oddsAdicionais.escanteios) {
        return '<div>Estrutura não definida</div>';
    }

    let html = '';
    const escanteios = jogo.oddsAdicionais.escanteios;
    
    if (escanteios.mais) {
        escanteios.mais.forEach((opcao, i) => {
            html += `
                <div class="odd-input-group">
                    <label>${opcao.tipo}:</label>
                    <input type="number" step="0.01" value="${opcao.odd}" 
                           onchange="atualizarEscanteios(${index}, ${i}, this.value)">
                </div>
            `;
        });
    }

    return html;
}

// Atualizar jogo
function atualizarJogo(index, campo, valor) {
    const caminho = campo.split('.');
    let obj = campeonatos[campeonatoAtual].jogos[index];
    
    for (let i = 0; i < caminho.length - 1; i++) {
        obj = obj[caminho[i]];
    }
    obj[caminho[caminho.length - 1]] = campo === 'data' ? valor : parseFloat(valor);
    
    salvarNoLocalStorage();
}

// Atualizar odds adicionais
function atualizarOddAdicional(index, categoria, subIndex, valor) {
    const caminho = categoria.split('.');
    let obj = campeonatos[campeonatoAtual].jogos[index].oddsAdicionais;
    
    for (let i = 0; i < caminho.length; i++) {
        obj = obj[caminho[i]];
    }
    obj[subIndex].odd = parseFloat(valor);
    
    salvarNoLocalStorage();
}

// Atualizar tempo de gols
function atualizarTempoGols(index, subIndex, valor) {
    campeonatos[campeonatoAtual].jogos[index].oddsAdicionais.tempoGols[subIndex].odd = parseFloat(valor);
    salvarNoLocalStorage();
}

// Atualizar escanteios
function atualizarEscanteios(index, subIndex, valor) {
    campeonatos[campeonatoAtual].jogos[index].oddsAdicionais.escanteios.mais[subIndex].odd = parseFloat(valor);
    salvarNoLocalStorage();
}

// Excluir jogo
function excluirJogo(index) {
    if (confirm('Tem certeza que deseja excluir este jogo?')) {
        campeonatos[campeonatoAtual].jogos.splice(index, 1);
        carregarJogosCampeonato();
        salvarNoLocalStorage();
    }
}

// Mostrar modal para novo jogo
function mostrarModalNovoJogo() {
    if (modalNovoJogo) {
        modalNovoJogo.style.display = 'block';
    }
}

// Fechar modal
function fecharModalNovoJogo() {
    if (modalNovoJogo) {
        modalNovoJogo.style.display = 'none';
        // Limpar formulário
        document.getElementById('novo-time-casa').value = '';
        document.getElementById('novo-time-fora').value = '';
        document.getElementById('novo-data').value = '';
        document.getElementById('novo-odd-casa').value = '1.80';
        document.getElementById('novo-odd-empate').value = '3.40';
        document.getElementById('novo-odd-fora').value = '4.20';
    }
}

// Adicionar novo jogo
function adicionarNovoJogo() {
    const timeCasa = document.getElementById('novo-time-casa')?.value.trim();
    const timeFora = document.getElementById('novo-time-fora')?.value.trim();
    const dataInput = document.getElementById('novo-data')?.value;

    if (!timeCasa || !timeFora || !dataInput) {
        alert('Preencha todos os campos obrigatórios');
        return;
    }

    // Converter datetime-local para o formato brasileiro
    const dataObj = new Date(dataInput);
    const dataFormatada = formatarDataBrasileira(dataObj);

    const novoJogo = {
        id: Date.now(),
        timeCasa: timeCasa,
        timeFora: timeFora,
        data: dataFormatada,
        odds: {
            casa: parseFloat(document.getElementById('novo-odd-casa')?.value) || 1.80,
            empate: parseFloat(document.getElementById('novo-odd-empate')?.value) || 3.40,
            fora: parseFloat(document.getElementById('novo-odd-fora')?.value) || 4.20
        },
        oddsAdicionais: {
            gols: {
                mais: [
                    { tipo: "Mais que 0", odd: 1.30 },
                    { tipo: "Mais que 1", odd: 1.80 },
                    { tipo: "Mais que 2", odd: 2.50 }
                ],
                exato: [
                    { tipo: "Exatamente 0", odd: 3.50 },
                    { tipo: "Exatamente 1", odd: 3.20 },
                    { tipo: "Exatamente 2", odd: 3.50 }
                ]
            },
            tempoGols: [
                { tipo: "1º Tempo", odd: 2.80 },
                { tipo: "2º Tempo", odd: 2.20 },
                { tipo: "Empate", odd: 3.50 }
            ],
            escanteios: {
                mais: [
                    { tipo: "Mais que 4.5", odd: 1.60 },
                    { tipo: "Mais que 6.5", odd: 2.00 },
                    { tipo: "Mais que 8.5", odd: 2.60 }
                ]
            }
        }
    };

    // Garantir que o array de jogos existe
    if (!campeonatos[campeonatoAtual].jogos) {
        campeonatos[campeonatoAtual].jogos = [];
    }

    campeonatos[campeonatoAtual].jogos.push(novoJogo);
    carregarJogosCampeonato();
    fecharModalNovoJogo();
    salvarNoLocalStorage();
    
    alert('✅ Jogo adicionado com sucesso!');
}

// Salvar no localStorage
function salvarNoLocalStorage() {
    localStorage.setItem('campeonatosAdmin', JSON.stringify(campeonatos));
    localStorage.setItem('campeonatosSistema', JSON.stringify(campeonatos));
    console.log('💾 Dados salvos e sincronizados');
}

// Salvar todas as alterações e sincronizar com o sistema principal
function salvarTodasAlteracoes() {
    salvarNoLocalStorage();
    
    // Sincronizar com o script principal de forma segura
    forcarAtualizacaoPaginaPrincipal();
    
    alert('✅ Todas as alterações foram salvas!\n\nAtualize a página principal para ver as mudanças.');
}

// Nova função para sincronização segura
function sincronizarComSistemaPrincipal() {
    try {
        // Método 1: Tentar sincronizar via window.opener (se admin foi aberto a partir do principal)
        if (window.opener && typeof window.opener.atualizarDadosCampeonatos === 'function') {
            window.opener.atualizarDadosCampeonatos(campeonatos);
            console.log('✅ Dados sincronizados com página principal via window.opener');
        }
        
        // Método 2: Salvar no localStorage para o script principal ler
        localStorage.setItem('campeonatosSistema', JSON.stringify(campeonatos));
        console.log('✅ Dados salvos no localStorage para sincronização');
        
    } catch (error) {
        console.warn('⚠️ Não foi possível sincronizar com página principal:', error);
    }
}

function formatarDataBrasileira(data) {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    const horas = String(data.getHours()).padStart(2, '0');
    const minutos = String(data.getMinutes()).padStart(2, '0');
    
    return `${dia}/${mes}/${ano} ${horas}:${minutos}`;
}

// Modifique a função fecharModalNovoJogo para resetar o datetime-local
function fecharModalNovoJogo() {
    if (modalNovoJogo) {
        modalNovoJogo.style.display = 'none';
        // Limpar formulário
        document.getElementById('novo-time-casa').value = '';
        document.getElementById('novo-time-fora').value = '';
        document.getElementById('novo-data').value = '';
        document.getElementById('novo-odd-casa').value = '1.80';
        document.getElementById('novo-odd-empate').value = '3.40';
        document.getElementById('novo-odd-fora').value = '4.20';
    }
}

// Adicione também uma função para converter datas existentes para o formato datetime-local
// Isso será útil se você quiser editar jogos existentes
function converterParaDatetimeLocal(dataString) {
    if (!dataString) return '';
    
    try {
        // Converter de "DD/MM/AAAA HH:MM" para "AAAA-MM-DDTHH:MM"
        const [dataPart, horaPart] = dataString.split(' ');
        const [dia, mes, ano] = dataPart.split('/');
        
        return `${ano}-${mes}-${dia}T${horaPart}`;
    } catch (error) {
        console.error('Erro ao converter data:', error);
        return '';
    }
}

function forcarAtualizacaoPaginaPrincipal() {
    try {
        // Método 1: window.opener (se admin foi aberto a partir do principal)
        if (window.opener && typeof window.opener.carregarDadosCampeonatos === 'function') {
            window.opener.carregarDadosCampeonatos();
            if (window.opener.campeonatoSelecionado) {
                window.opener.carregarJogos();
            }
            console.log('✅ Página principal atualizada via window.opener');
        }
        
        // Método 2: Disparar evento storage manualmente
        const event = new StorageEvent('storage', {
            key: 'campeonatosSistema',
            newValue: JSON.stringify(campeonatos),
            oldValue: localStorage.getItem('campeonatosSistema'),
            url: window.location.href,
            storageArea: localStorage
        });
        window.dispatchEvent(event);
        
        // Método 3: Salvar em ambas as chaves do localStorage
        localStorage.setItem('campeonatosAdmin', JSON.stringify(campeonatos));
        localStorage.setItem('campeonatosSistema', JSON.stringify(campeonatos));
        
        console.log('✅ Sincronização forçada com página principal');
        
    } catch (error) {
        console.warn('⚠️ Não foi possível forçar atualização:', error);
    }
}