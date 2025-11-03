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

    // Event listeners para botões - ADICIONE ESTAS LINHAS
    if (btnNovoJogo) {
        btnNovoJogo.addEventListener('click', mostrarModalNovoJogo);
    }
    
    if (btnSalvarTudo) {
        btnSalvarTudo.addEventListener('click', salvarTodasAlteracoes);
    }
    
    // ... resto dos event listeners existentes
});

// ADICIONE ESTA FUNÇÃO PARA SALVAR ALTERAÇÕES
function salvarTodasAlteracoes() {
    salvarNoLocalStorage();
    forcarAtualizacaoPaginaPrincipal();
    alert('✅ Todas as alterações foram salvas com sucesso!');
}

// ADICIONE ESTAS FUNÇÕES GLOBAIS PARA OS BOTÕES
window.sistemaApostas = {
    exportarDados: exportarDados,
    importarDados: function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('dados-importar').value = e.target.result;
                mostrarModalImportar();
            };
            reader.readAsText(file);
        }
    },
    resetarParaDadosOriginais: function() {
        if (confirm('Tem certeza que deseja resetar todos os dados para o original? Isso apagará todas as modificações feitas.')) {
            localStorage.removeItem('campeonatosAdmin');
            localStorage.removeItem('campeonatosSistema');
            location.reload();
        }
    }
};

function migrarJogosPara5Opcoes() {
    Object.keys(campeonatos).forEach(campeonatoId => {
        const campeonato = campeonatos[campeonatoId];
        if (campeonato.jogos) {
            campeonato.jogos.forEach(jogo => {
                if (jogo.oddsAdicionais) {
                    // Migrar gols para 5 opções: 0, 1, 2, 3, 4
                    if (jogo.oddsAdicionais.gols) {
                        const numerosGols = ['0', '1', '2', '3', '4'];
                        const valoresPadraoGols = {
                            '0': { mais: 1.30, exato: 3.50, menos: 2.10 },
                            '1': { mais: 1.80, exato: 3.20, menos: 1.60 },
                            '2': { mais: 2.50, exato: 3.50, menos: 1.30 },
                            '3': { mais: 3.20, exato: 4.20, menos: 1.15 },
                            '4': { mais: 4.50, exato: 5.00, menos: 1.05 }
                        };
                        
                        ['mais', 'exato', 'menos'].forEach(tipo => {
                            if (!jogo.oddsAdicionais.gols[tipo]) jogo.oddsAdicionais.gols[tipo] = [];
                            
                            numerosGols.forEach(numero => {
                                const tipoCompleto = `${tipo === 'mais' ? 'Mais que' : tipo === 'exato' ? 'Exatamente' : 'Menos que'} ${numero}`;
                                const existe = jogo.oddsAdicionais.gols[tipo].some(op => op.tipo === tipoCompleto);
                                
                                if (!existe) {
                                    jogo.oddsAdicionais.gols[tipo].push({
                                        tipo: tipoCompleto,
                                        odd: valoresPadraoGols[numero][tipo]
                                    });
                                }
                            });
                        });
                    }
                    
                    // Migrar escanteios para 5 opções: 4, 5, 6, 7, 8
                    if (jogo.oddsAdicionais.escanteios) {
                        const numerosEscanteios = ['4', '5', '6', '7', '8'];
                        const valoresPadraoEscanteios = {
                            '4': { mais: 1.60, exato: 4.50, menos: 1.90 },
                            '5': { mais: 2.00, exato: 4.00, menos: 1.50 },
                            '6': { mais: 2.60, exato: 3.80, menos: 1.25 },
                            '7': { mais: 3.20, exato: 4.20, menos: 1.10 },
                            '8': { mais: 4.00, exato: 5.00, menos: 1.05 }
                        };
                        
                        ['mais', 'exato', 'menos'].forEach(tipo => {
                            if (!jogo.oddsAdicionais.escanteios[tipo]) jogo.oddsAdicionais.escanteios[tipo] = [];
                            
                            numerosEscanteios.forEach(numero => {
                                const tipoCompleto = `${tipo === 'mais' ? 'Mais que' : tipo === 'exato' ? 'Exatamente' : 'Menos que'} ${numero}`;
                                const existe = jogo.oddsAdicionais.escanteios[tipo].some(op => op.tipo === tipoCompleto);
                                
                                if (!existe) {
                                    jogo.oddsAdicionais.escanteios[tipo].push({
                                        tipo: tipoCompleto,
                                        odd: valoresPadraoEscanteios[numero][tipo]
                                    });
                                }
                            });
                        });
                    }
                }
            });
        }
    });
    
    salvarNoLocalStorage();
    console.log('✅ Jogos migrados para novos padrões (0-4 gols, 4-8 escanteios)');
}
// Chame esta função após carregar os dados
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
    
    // MIGRAR JOGOS EXISTENTES PARA 5 OPÇÕES
    migrarJogosPara5Opcoes();
}

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
    
    // MIGRAR JOGOS EXISTENTES PARA 5 OPÇÕES
    migrarJogosPara5Opcoes();
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

// Atualizar a função para mostrar inputs completos para gols e escanteios
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
                <h4>⚽ Total de Gols</h4>
                <div class="tabela-admin">
                    <table class="tabela-odds-admin">
                        <thead>
                            <tr>
                                <th>Número</th>
                                <th>Mais que</th>
                                <th>Exatamente</th>
                                <th>Menos que</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${gerarInputsGolsAdmin(jogo, index)}
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="odds-section">
                <h4>📐 Total de Escanteios</h4>
                <div class="tabela-admin">
                    <table class="tabela-odds-admin">
                        <thead>
                            <tr>
                                <th>Número</th>
                                <th>Mais que</th>
                                <th>Exatamente</th>
                                <th>Menos que</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${gerarInputsEscanteiosAdmin(jogo, index)}
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="odds-section">
                <h4>⏰ Tempo de Gols</h4>
                <div class="odds-grid">
                    ${gerarInputsTempoGols(jogo, index)}
                </div>
            </div>
        `;
        listaJogosAdmin.appendChild(jogoElement);
    });
}

function gerarInputsGolsAdmin(jogo, index) {
    // Garantir que a estrutura existe
    if (!jogo.oddsAdicionais) jogo.oddsAdicionais = {};
    if (!jogo.oddsAdicionais.gols) jogo.oddsAdicionais.gols = {};
    
    const gols = jogo.oddsAdicionais.gols;
    
    // Garantir que todas as estruturas existam
    if (!gols.mais) gols.mais = [];
    if (!gols.exato) gols.exato = [];
    if (!gols.menos) gols.menos = [];
    
    // USAR 5 NÚMEROS FIXOS PARA GOLS: 0, 1, 2, 3, 4
    const numerosGols = ['0', '1', '2', '3', '4'];
    
    let html = '';
    
    // Criar linhas da tabela com SEMPRE 5 opções
    numerosGols.forEach(numero => {
        // Encontrar odds existentes ou criar padrão
        const maisOpcao = gols.mais.find(opcao => opcao.tipo === `Mais que ${numero}`);
        const exatoOpcao = gols.exato.find(opcao => opcao.tipo === `Exatamente ${numero}`);
        const menosOpcao = gols.menos.find(opcao => opcao.tipo === `Menos que ${numero}`);
        
        // Valores padrão para cada tipo
        const valoresPadrao = {
            '0': { mais: 1.30, exato: 3.50, menos: 2.10 },
            '1': { mais: 1.80, exato: 3.20, menos: 1.60 },
            '2': { mais: 2.50, exato: 3.50, menos: 1.30 },
            '3': { mais: 3.20, exato: 4.20, menos: 1.15 },
            '4': { mais: 4.50, exato: 5.00, menos: 1.05 }
        };
        
        html += `
            <tr>
                <td class="numero-admin">${numero} gols</td>
                <td class="input-admin">
                    <input type="number" step="0.01" 
                           value="${maisOpcao ? maisOpcao.odd : valoresPadrao[numero].mais}" 
                           placeholder="${valoresPadrao[numero].mais}"
                           onchange="atualizarOddGolsAdmin(${index}, 'mais', '${numero}', this.value)">
                </td>
                <td class="input-admin">
                    <input type="number" step="0.01" 
                           value="${exatoOpcao ? exatoOpcao.odd : valoresPadrao[numero].exato}" 
                           placeholder="${valoresPadrao[numero].exato}"
                           onchange="atualizarOddGolsAdmin(${index}, 'exato', '${numero}', this.value)">
                </td>
                <td class="input-admin">
                    <input type="number" step="0.01" 
                           value="${menosOpcao ? menosOpcao.odd : valoresPadrao[numero].menos}" 
                           placeholder="${valoresPadrao[numero].menos}"
                           onchange="atualizarOddGolsAdmin(${index}, 'menos', '${numero}', this.value)">
                </td>
            </tr>
        `;
    });
    
    return html;
}

function gerarInputsEscanteiosAdmin(jogo, index) {
    // Garantir que a estrutura existe
    if (!jogo.oddsAdicionais) jogo.oddsAdicionais = {};
    if (!jogo.oddsAdicionais.escanteios) jogo.oddsAdicionais.escanteios = {};
    
    const escanteios = jogo.oddsAdicionais.escanteios;
    
    // Garantir que todas as estruturas existam
    if (!escanteios.mais) escanteios.mais = [];
    if (!escanteios.exato) escanteios.exato = [];
    if (!escanteios.menos) escanteios.menos = [];
    
    // USAR 5 NÚMEROS FIXOS PARA ESCANTEIOS: 4, 5, 6, 7, 8
    const numerosEscanteios = ['4', '5', '6', '7', '8'];
    
    let html = '';
    
    // Criar linhas da tabela com SEMPRE 5 opções
    numerosEscanteios.forEach(numero => {
        // Encontrar odds existentes ou criar padrão
        const maisOpcao = escanteios.mais.find(opcao => opcao.tipo === `Mais que ${numero}`);
        const exatoOpcao = escanteios.exato.find(opcao => opcao.tipo === `Exatamente ${numero}`);
        const menosOpcao = escanteios.menos.find(opcao => opcao.tipo === `Menos que ${numero}`);
        
        // Valores padrão para cada tipo
        const valoresPadrao = {
            '4': { mais: 1.60, exato: 4.50, menos: 1.90 },
            '5': { mais: 2.00, exato: 4.00, menos: 1.50 },
            '6': { mais: 2.60, exato: 3.80, menos: 1.25 },
            '7': { mais: 3.20, exato: 4.20, menos: 1.10 },
            '8': { mais: 4.00, exato: 5.00, menos: 1.05 }
        };
        
        html += `
            <tr>
                <td class="numero-admin">${numero} escanteios</td>
                <td class="input-admin">
                    <input type="number" step="0.01" 
                           value="${maisOpcao ? maisOpcao.odd : valoresPadrao[numero].mais}" 
                           placeholder="${valoresPadrao[numero].mais}"
                           onchange="atualizarOddEscanteiosAdmin(${index}, 'mais', '${numero}', this.value)">
                </td>
                <td class="input-admin">
                    <input type="number" step="0.01" 
                           value="${exatoOpcao ? exatoOpcao.odd : valoresPadrao[numero].exato}" 
                           placeholder="${valoresPadrao[numero].exato}"
                           onchange="atualizarOddEscanteiosAdmin(${index}, 'exato', '${numero}', this.value)">
                </td>
                <td class="input-admin">
                    <input type="number" step="0.01" 
                           value="${menosOpcao ? menosOpcao.odd : valoresPadrao[numero].menos}" 
                           placeholder="${valoresPadrao[numero].menos}"
                           onchange="atualizarOddEscanteiosAdmin(${index}, 'menos', '${numero}', this.value)">
                </td>
            </tr>
        `;
    });
    
    return html;
}
function atualizarOddGolsAdmin(index, tipo, numero, valor) {
    const jogo = campeonatos[campeonatoAtual].jogos[index];
    
    // Garantir que a estrutura existe
    if (!jogo.oddsAdicionais.gols) jogo.oddsAdicionais.gols = {};
    if (!jogo.oddsAdicionais.gols[tipo]) jogo.oddsAdicionais.gols[tipo] = [];
    
    const opcoes = jogo.oddsAdicionais.gols[tipo];
    const tipoCompleto = `${tipo === 'mais' ? 'Mais que' : tipo === 'exato' ? 'Exatamente' : 'Menos que'} ${numero}`;
    
    // Encontrar ou criar a opção
    let opcao = opcoes.find(op => op.tipo === tipoCompleto);
    
    if (valor && valor !== '') {
        if (!opcao) {
            opcao = { tipo: tipoCompleto, odd: parseFloat(valor) };
            opcoes.push(opcao);
        } else {
            opcao.odd = parseFloat(valor);
        }
    } else {
        // Remover se o valor estiver vazio
        const indexOpcao = opcoes.findIndex(op => op.tipo === tipoCompleto);
        if (indexOpcao !== -1) {
            opcoes.splice(indexOpcao, 1);
        }
    }
    
    salvarNoLocalStorage();
}

function atualizarOddEscanteiosAdmin(index, tipo, numero, valor) {
    const jogo = campeonatos[campeonatoAtual].jogos[index];
    
    // Garantir que a estrutura existe
    if (!jogo.oddsAdicionais.escanteios) jogo.oddsAdicionais.escanteios = {};
    if (!jogo.oddsAdicionais.escanteios[tipo]) jogo.oddsAdicionais.escanteios[tipo] = [];
    
    const opcoes = jogo.oddsAdicionais.escanteios[tipo];
    const tipoCompleto = `${tipo === 'mais' ? 'Mais que' : tipo === 'exato' ? 'Exatamente' : 'Menos que'} ${numero}`;
    
    // Encontrar ou criar a opção
    let opcao = opcoes.find(op => op.tipo === tipoCompleto);
    
    if (valor && valor !== '') {
        if (!opcao) {
            opcao = { tipo: tipoCompleto, odd: parseFloat(valor) };
            opcoes.push(opcao);
        } else {
            opcao.odd = parseFloat(valor);
        }
    } else {
        // Remover se o valor estiver vazio
        const indexOpcao = opcoes.findIndex(op => op.tipo === tipoCompleto);
        if (indexOpcao !== -1) {
            opcoes.splice(indexOpcao, 1);
        }
    }
    
    salvarNoLocalStorage();
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
                    { tipo: "Mais que 0.5", odd: 1.30 },
                    { tipo: "Mais que 1.5", odd: 1.80 },
                    { tipo: "Mais que 2.5", odd: 2.50 },
                    { tipo: "Mais que 3.5", odd: 3.20 },
                    { tipo: "Mais que 4.5", odd: 4.50 }
                ],
                exato: [
                    { tipo: "Exatamente 0", odd: 3.50 },
                    { tipo: "Exatamente 1", odd: 3.20 },
                    { tipo: "Exatamente 2", odd: 3.50 },
                    { tipo: "Exatamente 3", odd: 4.20 },
                    { tipo: "Exatamente 4", odd: 5.00 }
                ],
                menos: [
                    { tipo: "Menos que 1.5", odd: 2.10 },
                    { tipo: "Menos que 2.5", odd: 1.60 },
                    { tipo: "Menos que 3.5", odd: 1.30 },
                    { tipo: "Menos que 4.5", odd: 1.15 },
                    { tipo: "Menos que 5.5", odd: 1.05 }
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
                    { tipo: "Mais que 8.5", odd: 2.60 },
                    { tipo: "Mais que 10.5", odd: 3.20 },
                    { tipo: "Mais que 12.5", odd: 4.00 }
                ],
                exato: [
                    { tipo: "Exatamente 4", odd: 4.50 },
                    { tipo: "Exatamente 5", odd: 4.00 },
                    { tipo: "Exatamente 6", odd: 3.80 },
                    { tipo: "Exatamente 7", odd: 4.20 },
                    { tipo: "Exatamente 8", odd: 5.00 }
                ],
                menos: [
                    { tipo: "Menos que 5.5", odd: 1.90 },
                    { tipo: "Menos que 7.5", odd: 1.50 },
                    { tipo: "Menos que 9.5", odd: 1.25 },
                    { tipo: "Menos que 11.5", odd: 1.10 },
                    { tipo: "Menos que 13.5", odd: 1.05 }
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

// CORRIGIR: Permitir apenas UMA odd por categoria adicional
function selecionarApostaAdicional(elemento, jogo) {
    const jogoId = jogo.id;
    const categoria = elemento.dataset.categoria;
    
    // Verificar se já está selecionada (toggle)
    if (elemento.classList.contains('selecionada')) {
        elemento.classList.remove('selecionada');
        console.log(`❌ Desselecionada: ${elemento.dataset.tipo}`);
        return;
    }
    
    // IMPORTANTE: Desselecionar TODAS as outras opções da MESMA CATEGORIA
    // Isso inclui todas as colunas (mais que, exatamente, menos que) da mesma categoria
    document.querySelectorAll(`#conteudo-${jogoId} .opcao-tabela[data-categoria="${categoria}"]`).forEach(opcao => {
        opcao.classList.remove('selecionada');
    });
    
    // Selecionar apenas esta opção
    elemento.classList.add('selecionada');
    
    console.log(`✅ Aposta adicional selecionada: ${elemento.dataset.tipo} - Odd: ${elemento.dataset.valor} (Categoria: ${categoria})`);
}

function atualizarSelecoesJogo(jogo) {
    const jogoId = jogo.id;
    const apostaDoJogo = carrinho.find(item => item.jogo.id === jogoId);
    
    // Limpar seleções
    document.querySelectorAll(`#conteudo-${jogoId} .odd, #conteudo-${jogoId} .opcao-tabela`).forEach(el => {
        el.classList.remove('selecionada');
    });
    
    // Aplicar seleções atuais se houver aposta deste jogo
    if (apostaDoJogo) {
        apostaDoJogo.selecoes.forEach(selecao => {
            if (selecao.categoria === 'principal') {
                const elemento = document.querySelector(`#conteudo-${jogoId} .odd[data-tipo="${selecao.tipo}"]`);
                if (elemento) {
                    elemento.classList.add('selecionada');
                }
            } else {
                // Para apostas adicionais, buscar por categoria E tipo
                const elemento = document.querySelector(`#conteudo-${jogoId} .opcao-tabela[data-categoria="${selecao.categoria}"][data-tipo="${selecao.tipo}"]`);
                if (elemento) {
                    elemento.classList.add('selecionada');
                }
            }
        });
    }
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
    console.log('🔄 Forçando atualização da página principal...');
    
    try {
        // Método 1: Salvar em AMBAS as chaves do localStorage
        localStorage.setItem('campeonatosAdmin', JSON.stringify(campeonatos));
        localStorage.setItem('campeonatosSistema', JSON.stringify(campeonatos));
        
        // Método 2: Disparar evento storage manualmente
        const event = new StorageEvent('storage', {
            key: 'campeonatosAdmin',
            newValue: JSON.stringify(campeonatos),
            oldValue: localStorage.getItem('campeonatosAdmin'),
            url: window.location.href,
            storageArea: localStorage
        });
        window.dispatchEvent(event);
        
        // Método 3: window.opener (se admin foi aberto a partir do principal)
        if (window.opener && !window.opener.closed) {
            try {
                window.opener.postMessage({
                    type: 'CAMPEONATOS_ATUALIZADOS',
                    data: campeonatos
                }, '*');
                console.log('✅ Mensagem enviada para página principal via postMessage');
            } catch (error) {
                console.warn('⚠️ Não foi possível enviar mensagem para página principal:', error);
            }
        }
        
        console.log('✅ Sincronização forçada com página principal');
        
    } catch (error) {
        console.warn('⚠️ Erro na sincronização:', error);
    }
}
