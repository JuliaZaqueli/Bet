// Dados dos campeonatos com odds adicionais
let campeonatos = {};

// FUNÇÃO PARA CORRIGIR OS DADOS CARREGADOS DO JSON
function corrigirDadosCarregados(dados) {
    console.log('🔄 Aplicando correção de estrutura de dados...');
    
    Object.keys(dados).forEach(campeonatoId => {
        const campeonato = dados[campeonatoId];
        if (campeonato.jogos) {
            campeonato.jogos.forEach(jogo => {
                // Garantir que oddsAdicionais existe
                if (!jogo.oddsAdicionais) {
                    jogo.oddsAdicionais = {
                        gols: { mais: [], exato: [], menos: [] },
                        escanteios: { mais: [], exato: [], menos: [] },
                        tempoGols: []
                    };
                }

                // CORRIGIR GOLS - usar números 0, 1, 2, 3, 4
                const padroesGols = {
                    '0': { mais: 1.30, exato: 3.50, menos: 2.10 },
                    '1': { mais: 1.80, exato: 3.20, menos: 1.60 },
                    '2': { mais: 2.50, exato: 3.50, menos: 1.30 },
                    '3': { mais: 3.20, exato: 4.20, menos: 1.15 },
                    '4': { mais: 4.50, exato: 5.00, menos: 1.05 }
                };

                // CORRIGIR ESCANTEIOS - usar números 4, 5, 6, 7, 8
                const padroesEscanteios = {
                    '4': { mais: 1.60, exato: 4.50, menos: 1.90 },
                    '5': { mais: 2.00, exato: 4.00, menos: 1.50 },
                    '6': { mais: 2.60, exato: 3.80, menos: 1.25 },
                    '7': { mais: 3.20, exato: 4.20, menos: 1.10 },
                    '8': { mais: 4.00, exato: 5.00, menos: 1.05 }
                };

                // Verificar se precisa corrigir gols
                if (!jogo.oddsAdicionais.gols || 
                    !jogo.oddsAdicionais.gols.mais || 
                    jogo.oddsAdicionais.gols.mais.length === 0 ||
                    !jogo.oddsAdicionais.gols.mais.some(op => op.tipo === "Mais que 3")) {
                    
                    console.log(`🔧 Corrigindo gols do jogo: ${jogo.timeCasa} vs ${jogo.timeFora}`);
                    
                    jogo.oddsAdicionais.gols = {
                        mais: [],
                        exato: [], 
                        menos: []
                    };

                    // Preencher gols
                    Object.keys(padroesGols).forEach(numero => {
                        jogo.oddsAdicionais.gols.mais.push({
                            tipo: `Mais que ${numero}`,
                            odd: padroesGols[numero].mais
                        });
                        jogo.oddsAdicionais.gols.exato.push({
                            tipo: `Exatamente ${numero}`,
                            odd: padroesGols[numero].exato
                        });
                        jogo.oddsAdicionais.gols.menos.push({
                            tipo: `Menos que ${numero}`,
                            odd: padroesGols[numero].menos
                        });
                    });
                }

                // Verificar se precisa corrigir escanteios
                if (!jogo.oddsAdicionais.escanteios || 
                    !jogo.oddsAdicionais.escanteios.mais || 
                    jogo.oddsAdicionais.escanteios.mais.length === 0 ||
                    !jogo.oddsAdicionais.escanteios.mais.some(op => op.tipo === "Mais que 6")) {
                    
                    console.log(`🔧 Corrigindo escanteios do jogo: ${jogo.timeCasa} vs ${jogo.timeFora}`);
                    
                    jogo.oddsAdicionais.escanteios = {
                        mais: [],
                        exato: [],
                        menos: []
                    };

                    // Preencher escanteios
                    Object.keys(padroesEscanteios).forEach(numero => {
                        jogo.oddsAdicionais.escanteios.mais.push({
                            tipo: `Mais que ${numero}`,
                            odd: padroesEscanteios[numero].mais
                        });
                        jogo.oddsAdicionais.escanteios.exato.push({
                            tipo: `Exatamente ${numero}`,
                            odd: padroesEscanteios[numero].exato
                        });
                        jogo.oddsAdicionais.escanteios.menos.push({
                            tipo: `Menos que ${numero}`,
                            odd: padroesEscanteios[numero].menos
                        });
                    });
                }

                // Garantir tempo de gols
                if (!jogo.oddsAdicionais.tempoGols || jogo.oddsAdicionais.tempoGols.length === 0) {
                    jogo.oddsAdicionais.tempoGols = [
                        { tipo: "1º Tempo", odd: 2.80 },
                        { tipo: "2º Tempo", odd: 2.20 },
                        { tipo: "Empate", odd: 3.50 }
                    ];
                }
            });
        }
    });
    
    console.log('✅ Correção de dados aplicada com sucesso');
    return dados;
}

// Função para carregar dados do localStorage ou usar padrão
async function carregarDadosCampeonatos() {
    console.log('🔄 Iniciando carregamento de dados...');
    console.log('📍 URL atual:', window.location.href);
    
    // PRIORIDADE 1: Dados do admin no localStorage (modificações do usuário)
    const dadosAdmin = localStorage.getItem('campeonatosAdmin');
    
    console.log('📦 localStorage campeonatosAdmin:', dadosAdmin ? 'EXISTE' : 'NÃO EXISTE');
    
    if (dadosAdmin) {
        try {
            campeonatos = JSON.parse(dadosAdmin);
            console.log('✅ Dados carregados do localStorage admin:', Object.keys(campeonatos));
            console.log('📊 Total de jogos:', Object.values(campeonatos).reduce((total, camp) => total + (camp.jogos ? camp.jogos.length : 0), 0));
            return;
        } catch (error) {
            console.error('❌ Erro ao parsear dados do admin:', error);
        }
    }
    
    // PRIORIDADE 2: Dados do sistema no localStorage (backup)
    const dadosSistema = localStorage.getItem('campeonatosSistema');
    if (dadosSistema) {
        try {
            campeonatos = JSON.parse(dadosSistema);
            console.log('✅ Dados carregados do localStorage sistema:', Object.keys(campeonatos));
            return;
        } catch (error) {
            console.error('❌ Erro ao parsear dados do sistema:', error);
        }
    }
    
    // PRIORIDADE 3: Carregar do arquivo dados.json (dados iniciais)
    try {
        console.log('🔄 Tentando carregar dados do arquivo JSON...');
        const response = await fetch('dados.json');
        
        if (!response.ok) {
            throw new Error('Arquivo dados.json não encontrado');
        }
        
        const dadosJson = await response.json();
        
        // APLICAR CORREÇÃO NOS DADOS CARREGADOS
        campeonatos = corrigirDadosCarregados(dadosJson);
        
        console.log('✅ Dados carregados e corrigidos do arquivo JSON:', Object.keys(campeonatos));
        
        // Salva no localStorage do sistema para futuras sessões
        localStorage.setItem('campeonatosSistema', JSON.stringify(campeonatos));
        
    } catch (error) {
        console.warn('❌ Erro ao carregar dados.json:', error);
        
        // Fallback: estrutura básica
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
        console.log('ℹ️ Usando estrutura básica de campeonatos');
        
        // Salva a estrutura básica
        localStorage.setItem('campeonatosSistema', JSON.stringify(campeonatos));
    }
}

function configurarSincronizacao() {
    // Ouvir mudanças no localStorage
    window.addEventListener('storage', function(e) {
        console.log('🔄 Evento storage detectado:', e.key);
        
        if (e.key === 'campeonatosAdmin' || e.key === 'campeonatosSistema') {
            console.log('📢 Dados atualizados detectados, recarregando...');
            
            // Recarregar dados
            carregarDadosCampeonatos().then(() => {
                // Recarregar interface
                carregarOpcoesCampeonato();
                
                // Se um campeonato estava selecionado, recarregar os jogos
                if (campeonatoSelecionadoGlobal) {
                    console.log('🔄 Recarregando jogos do campeonato:', campeonatoSelecionadoGlobal);
                    carregarJogos();
                }
            });
        }
    });
    
    // Também verificar a cada 2 segundos (fallback)
    setInterval(() => {
        const dadosAtuais = JSON.stringify(campeonatos);
        const dadosStorage = localStorage.getItem('campeonatosAdmin');
        
        if (dadosStorage && dadosStorage !== dadosAtuais) {
            console.log('🔄 Mudanças detectadas (polling), atualizando...');
            carregarDadosCampeonatos().then(() => {
                carregarOpcoesCampeonato();
                if (campeonatoSelecionadoGlobal) {
                    carregarJogos();
                }
            });
        }
    }, 2000);
}

function salvarModificacoesAdmin(novosDados) {
    try {
        // Atualiza os dados locais
        campeonatos = novosDados;
        
        // Salva no localStorage do admin (prioridade máxima)
        localStorage.setItem('campeonatosAdmin', JSON.stringify(novosDados));
        
        // Também atualiza o localStorage do sistema como backup
        localStorage.setItem('campeonatosSistema', JSON.stringify(novosDados));
        
        console.log('💾 Modificações do admin salvas com sucesso!');
        
        // Dispara evento para sincronizar outras abas/páginas
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'campeonatosAdmin',
            newValue: JSON.stringify(novosDados)
        }));
        
        return true;
    } catch (error) {
        console.error('❌ Erro ao salvar modificações do admin:', error);
        return false;
    }
}

function resetarParaDadosOriginais() {
    if (confirm('Tem certeza que deseja resetar todos os dados para o original? Isso apagará todas as modificações feitas.')) {
        // Remove os dados do admin para forçar recarregar do JSON
        localStorage.removeItem('campeonatosAdmin');
        localStorage.removeItem('campeonatosSistema');
        
        // Recarrega a página para aplicar as mudanças
        location.reload();
    }
}

// Função para atualizar dados (usada pelo admin)
function atualizarDadosCampeonatos(novosDados) {
    campeonatos = novosDados;
    console.log('✅ Dados atualizados pelo admin');
    
    // Recarregar a interface se um campeonato estiver selecionado
    if (campeonatoSelecionado) {
        carregarJogos();
    }
}
// Elementos DOM
let selecaoCampeonato, listaJogosContainer, tituloCampeonato, listaJogos;
let carrinhoFlutuante, carrinhoBody, carrinhoContador, oddTotal;
let btnLimparCarrinho, btnFazerAposta, btnExpandirCarrinho;

// Variáveis
let campeonatoSelecionado = null;
let campeonatoSelecionadoGlobal = null; // ← ADICIONE ESTA LINHA AQUI
let jogoAberto = null;
let carrinho = [];

// Inicializar elementos DOM
function inicializarElementosDOM() {
    // CORREÇÃO: Mudar para o ID correto
    selecaoCampeonato = document.getElementById('opcoes-campeonato'); // ← MUDAR AQUI
    listaJogosContainer = document.getElementById('lista-jogos-container');
    tituloCampeonato = document.getElementById('titulo-campeonato');
    listaJogos = document.getElementById('lista-jogos');
    carrinhoFlutuante = document.getElementById('carrinho-flutuante');
    carrinhoBody = document.getElementById('carrinho-body');
    carrinhoContador = document.querySelector('.carrinho-contador');
    oddTotal = document.getElementById('odd-total');
    btnLimparCarrinho = document.getElementById('btn-limpar-carrinho');
    btnFazerAposta = document.getElementById('btn-fazer-aposta');
    btnExpandirCarrinho = document.getElementById('btn-expandir-carrinho');
}

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    console.log('Sistema de Apostas - Página Principal - Iniciando...');
    console.log('📍 URL:', window.location.href);
    
    // Inicializar elementos DOM
    inicializarElementosDOM();
    
    console.log('🔍 Elementos DOM:', {
        selecaoCampeonato: !!selecaoCampeonato,
        listaJogos: !!listaJogos,
        carrinhoFlutuante: !!carrinhoFlutuante
    });
    
    // Carregar dados primeiro
    carregarDadosCampeonatos().then(() => {
        // Configurar sincronização
        configurarSincronizacao();
        
        // Carregar opções de campeonato (isso já vai carregar os jogos de hoje automaticamente)
        console.log('🔄 Carregando opções de campeonato...');
        carregarOpcoesCampeonato();
        
        // Event listeners para seleção de campeonato (delegado)
        if (selecaoCampeonato) {
            selecaoCampeonato.addEventListener('click', function(e) {
                if (e.target.classList.contains('opcao-campeonato')) {
                    document.querySelectorAll('.opcao-campeonato').forEach(el => {
                        el.classList.remove('selecionada');
                    });
                    e.target.classList.add('selecionada');
                    
                    const campeonatoSelecionado = e.target.dataset.campeonato;
                    if (campeonatoSelecionado === 'hoje') {
                        campeonatoSelecionadoGlobal = null; // Reseta para modo "hoje"
                        carregarJogosDeHoje();
                    } else {
                        campeonatoSelecionadoGlobal = campeonatoSelecionado;
                        carregarJogosPorCampeonato(campeonatoSelecionado);
                    }
                    
                    if (listaJogosContainer) {
                        listaJogosContainer.classList.remove('hidden');
                    }
                    
                    carrinho = [];
                    atualizarCarrinho();
                }
            });
        }
        
        // Event listeners para os botões do carrinho
        if (btnLimparCarrinho) {
            btnLimparCarrinho.addEventListener('click', limparCarrinho);
        }
        
        if (btnFazerAposta) {
            btnFazerAposta.addEventListener('click', mostrarFormUsuario);
        }
        
        if (btnExpandirCarrinho) {
            btnExpandirCarrinho.addEventListener('click', toggleCarrinho);
        }
        
        console.log('✅ Sistema inicializado com sucesso');
    }).catch(error => {
        console.error('❌ Erro na inicialização:', error);
    });
});

// Alternar entre carrinho compacto e expandido
function toggleCarrinho() {
    if (carrinhoFlutuante) {
        carrinhoFlutuante.classList.toggle('expandido');
    }
}
function obterDescricaoCampeonato(campeonatoId) {
    const descricoes = {
        'champions': 'Liga dos Campeões da Europa',
        'serie-a': 'Campeonato Brasileiro Série A', 
        'sul-americana': 'Copa Sul-Americana',
        'copa-do-brasil': 'Copa do Brasil',
        'premier-league': 'Campeonato Inglês',
        'la-liga': 'Campeonato Espanhol',
        'serie-b': 'Campeonato Brasileiro Série B'
    };
    
    return descricoes[campeonatoId] || 'Campeonato de Futebol';
}

function carregarOpcoesCampeonato() {
    const opcoesCampeonato = document.getElementById('opcoes-campeonato');
    if (!opcoesCampeonato) return;
    
    opcoesCampeonato.innerHTML = '';
    
    // Adiciona opção "Jogos de Hoje" como primeira opção
    const hojeElement = document.createElement('div');
    hojeElement.className = 'opcao-campeonato selecionada';
    hojeElement.dataset.campeonato = 'hoje';
    hojeElement.innerHTML = `
        <div class="nome-campeonato">⏰ Hoje</div>
    `;
    opcoesCampeonato.appendChild(hojeElement);
    
    // Adiciona os campeonatos normais
    Object.keys(campeonatos).forEach(campeonatoId => {
        const campeonato = campeonatos[campeonatoId];
        const opcaoElement = document.createElement('div');
        opcaoElement.className = 'opcao-campeonato';
        opcaoElement.dataset.campeonato = campeonatoId;
        opcaoElement.innerHTML = `
            <div class="nome-campeonato">${campeonato.nome}</div>
        `;
        
        opcoesCampeonato.appendChild(opcaoElement);
    });
    
    // ADICIONAR EVENT LISTENERS PARA AS OPÇÕES
    document.querySelectorAll('.opcao-campeonato').forEach(opcao => {
        opcao.addEventListener('click', function() {
            document.querySelectorAll('.opcao-campeonato').forEach(el => {
                el.classList.remove('selecionada');
            });
            this.classList.add('selecionada');
            
            const campeonatoSelecionado = this.dataset.campeonato;
            
            if (campeonatoSelecionado === 'hoje') {
                campeonatoSelecionadoGlobal = null;
                carregarJogosDeHoje();
            } else {
                campeonatoSelecionadoGlobal = campeonatoSelecionado;
                carregarJogosPorCampeonato(campeonatoSelecionado);
            }
            
            if (listaJogosContainer) {
                listaJogosContainer.classList.remove('hidden');
            }
            
            carrinho = [];
            atualizarCarrinho();
        });
    });
    
    // MOSTRAR JOGOS DE HOJE IMEDIATAMENTE
    console.log('🔄 Carregando jogos de hoje automaticamente...');
    carregarJogosDeHoje();
    
    if (listaJogosContainer) {
        listaJogosContainer.classList.remove('hidden');
    }
}

// Carregar lista de jogos
function carregarJogos() {
    if (!campeonatoSelecionado || !listaJogos) return;
    
    const jogos = campeonatos[campeonatoSelecionado]?.jogos || [];
    
    if (!listaJogos) {
        console.error('Elemento listaJogos não encontrado');
        return;
    }
    
    listaJogos.innerHTML = '';
    
    if (jogos.length === 0) {
        listaJogos.innerHTML = '<div class="carrinho-vazio">Nenhum jogo disponível</div>';
        return;
    }
    
    jogos.forEach(jogo => {
        const jogoElement = document.createElement('div');
        jogoElement.className = 'jogo-acordeao';
        jogoElement.innerHTML = `
            <div class="jogo-header" data-jogo="${jogo.id}">
                <div class="jogo-info">
                    <div class="times">
                        <div class="time">${jogo.timeCasa}</div>
                        <div class="vs">vs</div>
                        <div class="time">${jogo.timeFora}</div>
                    </div>
                    <div class="data">${jogo.data}</div>
                </div>
                <div class="seta">▼</div>
            </div>
            <div class="jogo-conteudo" id="conteudo-${jogo.id}">
                <!-- Conteúdo será preenchido via JavaScript -->
            </div>
        `;
        
        // Event listener para abrir/fechar o jogo
        const header = jogoElement.querySelector('.jogo-header');
        header.addEventListener('click', function() {
            toggleJogo(this, jogo);
        });
        
        listaJogos.appendChild(jogoElement);
    });
    
    if (tituloCampeonato) {
        tituloCampeonato.textContent = `Próximos Jogos - ${campeonatos[campeonatoSelecionado]?.nome || 'Campeonato'}`;
    }
}

// Abrir/fechar jogo
function toggleJogo(header, jogo) {
    const jogoId = jogo.id;
    const conteudo = document.getElementById(`conteudo-${jogoId}`);
    
    if (!conteudo) return;
    
    // Se já está aberto, fecha
    if (header.classList.contains('ativo')) {
        header.classList.remove('ativo');
        jogoAberto = null;
        return;
    }
    
    // Fecha jogo anterior se houver
    if (jogoAberto && jogoAberto !== jogoId) {
        const headerAnterior = document.querySelector(`.jogo-header[data-jogo="${jogoAberto}"]`);
        const conteudoAnterior = document.getElementById(`conteudo-${jogoAberto}`);
        if (headerAnterior) {
            headerAnterior.classList.remove('ativo');
        }
        if (conteudoAnterior) {
            conteudoAnterior.innerHTML = '';
        }
    }
    
    // Abre o jogo atual
    header.classList.add('ativo');
    jogoAberto = jogoId;
    
    // Carrega o conteúdo do jogo
    carregarConteudoJogo(jogo, conteudo);
}

// Substituir as seções de gols e escanteios por esta versão com 5 opções:
function carregarConteudoJogo(jogo, conteudo) {
    if (!conteudo) return;
    
    let html = `
        <div class="odds-principais">
            <h4>🎯 Aposta Principal</h4>
            <div class="odds">
                <div class="odd" data-jogo="${jogo.id}" data-tipo="casa" data-valor="${jogo.odds.casa}">
                    ${jogo.timeCasa}
                    <span class="odd-valor">${jogo.odds.casa}</span>
                </div>
                <div class="odd" data-jogo="${jogo.id}" data-tipo="empate" data-valor="${jogo.odds.empate}">
                    Empate
                    <span class="odd-valor">${jogo.odds.empate}</span>
                </div>
                <div class="odd" data-jogo="${jogo.id}" data-tipo="fora" data-valor="${jogo.odds.fora}">
                    ${jogo.timeFora}
                    <span class="odd-valor">${jogo.odds.fora}</span>
                </div>
            </div>
        </div>
    `;
    
    // Adicionar odds adicionais como tabelas em acordeões
    if (jogo.oddsAdicionais) {
        // Categoria de Gols - Tabela com 5 opções
        if (jogo.oddsAdicionais.gols) {
            html += `
                <div class="categoria-acordeao">
                    <div class="categoria-header" data-categoria="gols">
                        <div class="categoria-titulo-acordeao">
                            ⚽ Total de Gols
                            <span class="acordeao-seta">▼</span>
                        </div>
                    </div>
                    <div class="categoria-conteudo" id="gols-${jogo.id}">
                        <div class="tabela-apostas">
                            <table class="tabela-odds">
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th>Mais que</th>
                                        <th>Exatamente</th>
                                        <th>Menos que</th>
                                    </tr>
                                </thead>
                                <tbody>
            `;

            // USAR NÚMEROS FIXOS: 0, 1, 2, 3, 4
            const numerosGols = ['0', '1', '2', '3', '4'];
            
            // Criar linhas da tabela
            numerosGols.forEach(numero => {
                // Encontrar odds existentes
                const maisOpcao = jogo.oddsAdicionais.gols.mais?.find(opcao => opcao.tipo === `Mais que ${numero}`);
                const exatoOpcao = jogo.oddsAdicionais.gols.exato?.find(opcao => opcao.tipo === `Exatamente ${numero}`);
                const menosOpcao = jogo.oddsAdicionais.gols.menos?.find(opcao => opcao.tipo === `Menos que ${numero}`);
                
                html += `
                    <tr>
                        <td class="numero-gol">${numero} gols</td>
                        <td class="celula-odd ${maisOpcao ? 'com-odd' : 'sem-odd'}">
                            ${maisOpcao ? `
                                <div class="opcao-tabela" data-jogo="${jogo.id}" data-categoria="gols" data-tipo="${maisOpcao.tipo}" data-valor="${maisOpcao.odd}">
                                        ${maisOpcao.odd}
                                </div>
                            ` : '-'}
                        </td>
                        <td class="celula-odd ${exatoOpcao ? 'com-odd' : 'sem-odd'}">
                            ${exatoOpcao ? `
                                <div class="opcao-tabela" data-jogo="${jogo.id}" data-categoria="gols" data-tipo="${exatoOpcao.tipo}" data-valor="${exatoOpcao.odd}">
                                        ${exatoOpcao.odd}
                                </div>
                            ` : '-'}
                        </td>
                        <td class="celula-odd ${menosOpcao ? 'com-odd' : 'sem-odd'}">
                            ${menosOpcao ? `
                                <div class="opcao-tabela" data-jogo="${jogo.id}" data-categoria="gols" data-tipo="${menosOpcao.tipo}" data-valor="${menosOpcao.odd}">
                                        ${menosOpcao.odd}
                                </div>
                            ` : '-'}
                        </td>
                    </tr>
                `;
            });

            html += `
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        }

        // Categoria de Tempo de Gols - Tabela simples (mantida)
        if (jogo.oddsAdicionais.tempoGols && Array.isArray(jogo.oddsAdicionais.tempoGols)) {
            html += `
                <div class="categoria-acordeao">
                    <div class="categoria-header" data-categoria="tempo_gols">
                        <div class="categoria-titulo-acordeao">
                            ⏰ Tempo com Mais Gols
                            <span class="acordeao-seta">▼</span>
                        </div>
                    </div>
                    <div class="categoria-conteudo" id="tempo-gols-${jogo.id}">
                        <div class="tabela-apostas">
                            <table class="tabela-odds tabela-simples">
                                <tbody>
            `;

            jogo.oddsAdicionais.tempoGols.forEach(opcao => {
                html += `
                    <tr>
                        <td class="descricao-opcao">${opcao.tipo}</td>
                        <td class="celula-odd com-odd">
                            <div class="opcao-tabela" data-jogo="${jogo.id}" data-categoria="tempo_gols" data-tipo="${opcao.tipo}" data-valor="${opcao.odd}">
                                ${opcao.odd}
                            </div>
                        </td>
                    </tr>
                `;
            });

            html += `
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Para Escanteios - usar números: 4, 5, 6, 7, 8
        if (jogo.oddsAdicionais.escanteios) {
            html += `
                <div class="categoria-acordeao">
                    <div class="categoria-header" data-categoria="escanteios">
                        <div class="categoria-titulo-acordeao">
                            📐 Total de Escanteios
                            <span class="acordeao-seta">▼</span>
                        </div>
                    </div>
                    <div class="categoria-conteudo" id="escanteios-${jogo.id}">
                        <div class="tabela-apostas">
                            <table class="tabela-odds">
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th>Mais que</th>
                                        <th>Exatamente</th>
                                        <th>Menos que</th>
                                    </tr>
                                </thead>
                                <tbody>
            `;

            // USAR NÚMEROS FIXOS: 4, 5, 6, 7, 8
            const numerosEscanteios = ['4', '5', '6', '7', '8'];
            
            // Criar linhas da tabela
            numerosEscanteios.forEach(numero => {
                // Encontrar odds existentes
                const maisOpcao = jogo.oddsAdicionais.escanteios.mais?.find(opcao => opcao.tipo === `Mais que ${numero}`);
                const exatoOpcao = jogo.oddsAdicionais.escanteios.exato?.find(opcao => opcao.tipo === `Exatamente ${numero}`);
                const menosOpcao = jogo.oddsAdicionais.escanteios.menos?.find(opcao => opcao.tipo === `Menos que ${numero}`);
                
                html += `
                    <tr>
                        <td class="numero-escanteio">${numero} escanteios</td>
                        <td class="celula-odd ${maisOpcao ? 'com-odd' : 'sem-odd'}">
                            ${maisOpcao ? `
                                <div class="opcao-tabela" data-jogo="${jogo.id}" data-categoria="escanteios" data-tipo="${maisOpcao.tipo}" data-valor="${maisOpcao.odd}">
                                    ${maisOpcao.odd}
                                </div>
                            ` : '-'}
                        </td>
                        <td class="celula-odd ${exatoOpcao ? 'com-odd' : 'sem-odd'}">
                            ${exatoOpcao ? `
                                <div class="opcao-tabela" data-jogo="${jogo.id}" data-categoria="escanteios" data-tipo="${exatoOpcao.tipo}" data-valor="${exatoOpcao.odd}">
                                    ${exatoOpcao.odd}
                                </div>
                            ` : '-'}
                        </td>
                        <td class="celula-odd ${menosOpcao ? 'com-odd' : 'sem-odd'}">
                            ${menosOpcao ? `
                                <div class="opcao-tabela" data-jogo="${jogo.id}" data-categoria="escanteios" data-tipo="${menosOpcao.tipo}" data-valor="${menosOpcao.odd}">
                                    ${menosOpcao.odd}
                                </div>
                            ` : '-'}
                        </td>
                    </tr>
                `;
            });

            html += `
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        }
    }
    
    html += `<button class="btn-adicionar-carrinho" data-jogo="${jogo.id}">Adicionar ao Carrinho</button>`;
    
    conteudo.innerHTML = html;
    
    // Adicionar event listeners para odds principais
    conteudo.querySelectorAll('.odd').forEach(odd => {
        odd.addEventListener('click', function() {
            selecionarApostaPrincipal(this, jogo);
        });
    });
    
    // Event listeners para as opções da tabela
    conteudo.querySelectorAll('.opcao-tabela').forEach(opcao => {
        opcao.addEventListener('click', function() {
            selecionarApostaAdicional(this, jogo);
        });
    });
    
    // Event listeners para os cabeçalhos do acordeão
    conteudo.querySelectorAll('.categoria-header').forEach(header => {
        header.addEventListener('click', function() {
            toggleCategoriaAcordeao(this);
        });
    });
    
    const btnAdicionar = conteudo.querySelector('.btn-adicionar-carrinho');
    if (btnAdicionar) {
        btnAdicionar.addEventListener('click', function() {
            adicionarApostasAoCarrinho(jogo);
        });
    }
    
    // Atualizar seleções atuais
    atualizarSelecoesJogo(jogo);
    // Na função carregarConteudoJogo, adicione esta linha no final:
    atualizarOpcoesBloqueadas(jogo);
}

// NOVA FUNÇÃO: Alternar acordeão das categorias
function toggleCategoriaAcordeao(header) {
    const acordeao = header.parentElement;
    const conteudo = header.nextElementSibling;
    const seta = header.querySelector('.acordeao-seta');
    
    // Alternar classe ativa
    acordeao.classList.toggle('ativo');
    
    // Alternar visibilidade do conteúdo
    if (acordeao.classList.contains('ativo')) {
        conteudo.style.maxHeight = conteudo.scrollHeight + "px";
        seta.textContent = '▲';
    } else {
        conteudo.style.maxHeight = "0";
        seta.textContent = '▼';
    }
}

// Selecionar aposta principal (toggle)
function selecionarApostaPrincipal(elemento, jogo) {
    const jogoId = jogo.id;
    const tipo = elemento.dataset.tipo;
    const valor = parseFloat(elemento.dataset.valor);
    
    // Verificar se está bloqueada
    if (elemento.classList.contains('bloqueada')) {
        console.log(`🚫 Aposta principal bloqueada: ${tipo}`);
        return;
    }
    
    // Verificar se já está selecionada (toggle)
    if (elemento.classList.contains('selecionada')) {
        // Desselecionar esta odd
        elemento.classList.remove('selecionada');
        console.log(`❌ Desselecionada aposta principal: ${tipo}`);
        
        // Atualizar estado das opções bloqueadas
        atualizarOpcoesBloqueadas(jogo);
        return;
    }
    
    // Desselecionar outras odds principais deste jogo
    document.querySelectorAll(`#conteudo-${jogoId} .odd`).forEach(odd => {
        odd.classList.remove('selecionada');
    });
    
    // Selecionar esta odd
    elemento.classList.add('selecionada');
    console.log(`✅ Aposta principal selecionada: ${tipo} - Odd: ${valor}`);
    
    // Atualizar estado das opções bloqueadas
    atualizarOpcoesBloqueadas(jogo);
}


function atualizarOpcoesBloqueadas(jogo) {
    const jogoId = jogo.id;
    const apostaPrincipal = document.querySelector(`#conteudo-${jogoId} .odd.selecionada`);
    const tipoPrincipal = apostaPrincipal ? apostaPrincipal.dataset.tipo : null;
    
    // Verificar se há "Menos que 1 gol" selecionado
    const menosQue1GolSelecionado = document.querySelector(`#conteudo-${jogoId} .opcao-tabela[data-tipo="Menos que 1"].selecionada`);
    
    // Remover todos os bloqueios anteriores (exceto "Menos que 0" que é permanente)
    document.querySelectorAll(`#conteudo-${jogoId} .opcao-tabela, #conteudo-${jogoId} .celula-odd`).forEach(el => {
        // Não remover bloqueio permanente de "Menos que 0"
        if (!el.dataset.tipo || el.dataset.tipo !== "Menos que 0") {
            el.classList.remove('bloqueada', 'opcao-bloqueada');
        }
    });
    
    // BLOQUEIO PERMANENTE: "Menos que 0 gols" SEMPRE bloqueado (impossível em qualquer cenário)
    document.querySelectorAll(`#conteudo-${jogoId} .opcao-tabela[data-tipo="Menos que 0"]`).forEach(opcao => {
        opcao.classList.add('opcao-bloqueada');
        opcao.parentElement.classList.add('bloqueada');
    });
    
    // BLOQUEIO: Quando "Menos que 1 gol" está selecionado
    if (menosQue1GolSelecionado) {
        // Bloquear "1º Tempo" e "2º Tempo" na categoria tempo_gols
        document.querySelectorAll(`#conteudo-${jogoId} .opcao-tabela[data-categoria="tempo_gols"][data-tipo="1º Tempo"]`).forEach(opcao => {
            opcao.classList.add('opcao-bloqueada');
            opcao.parentElement.classList.add('bloqueada');
        });
        
        document.querySelectorAll(`#conteudo-${jogoId} .opcao-tabela[data-categoria="tempo_gols"][data-tipo="2º Tempo"]`).forEach(opcao => {
            opcao.classList.add('opcao-bloqueada');
            opcao.parentElement.classList.add('bloqueada');
        });
        
        console.log('🚫 "Menos que 1 gol" selecionado - Bloqueando 1º e 2º Tempo');
    }
    
    // Se não há aposta principal selecionada, não bloquear outras coisas
    if (!tipoPrincipal) return;
    
    // BLOQUEIOS PARA VITÓRIA DA CASA OU FORA
    if (tipoPrincipal === 'casa' || tipoPrincipal === 'fora') {
        // Bloquear todas as opções de "Menos que 1 gols" (impossível com vitória)
        document.querySelectorAll(`#conteudo-${jogoId} .opcao-tabela[data-tipo="Menos que 1"]`).forEach(opcao => {
            opcao.classList.add('opcao-bloqueada');
            opcao.parentElement.classList.add('bloqueada');
        });
        
        // Bloquear todas as opções de "Exatamente 0 gols" (impossível com vitória)
        document.querySelectorAll(`#conteudo-${jogoId} .opcao-tabela[data-tipo="Exatamente 0"]`).forEach(opcao => {
            opcao.classList.add('opcao-bloqueada');
            opcao.parentElement.classList.add('bloqueada');
        });
        
        // Bloquear todas as opções de "Mais que 0 gols" (redundante - pelo menos 1 gol é necessário para vitória)
        document.querySelectorAll(`#conteudo-${jogoId} .opcao-tabela[data-tipo="Mais que 0"]`).forEach(opcao => {
            opcao.classList.add('opcao-bloqueada');
            opcao.parentElement.classList.add('bloqueada');
        });
    }
    
    // BLOQUEIOS PARA EMPATE
    if (tipoPrincipal === 'empate') {
        // Bloquear números ímpares em "Exatamente" (empate só pode ter números pares de gols)
        const numerosImpares = ['1', '3']; // 0, 2, 4 são pares (0 é considerado par no contexto de empate)
        numerosImpares.forEach(numero => {
            document.querySelectorAll(`#conteudo-${jogoId} .opcao-tabela[data-tipo="Exatamente ${numero}"]`).forEach(opcao => {
                opcao.classList.add('opcao-bloqueada');
                opcao.parentElement.classList.add('bloqueada');
            });
        });
    }
}

function selecionarApostaAdicional(elemento, jogo) {
    const jogoId = jogo.id;
    const categoria = elemento.dataset.categoria;
    
    // Verificar se está bloqueada
    if (elemento.classList.contains('opcao-bloqueada')) {
        console.log(`🚫 Opção bloqueada: ${elemento.dataset.tipo}`);
        
        // Mostrar mensagem explicativa
        const apostaPrincipal = document.querySelector(`#conteudo-${jogoId} .odd.selecionada`);
        const menosQue1GolSelecionado = document.querySelector(`#conteudo-${jogoId} .opcao-tabela[data-tipo="Menos que 1"].selecionada`);
        
        let mensagem = '';
        
        if (elemento.dataset.tipo === "Menos que 0") {
            mensagem = "Não é possível ter menos que 0 gols em uma partida! Esta opção está permanentemente bloqueada.";
        } else if (elemento.dataset.tipo === "Menos que 1" && (apostaPrincipal && (apostaPrincipal.dataset.tipo === 'casa' || apostaPrincipal.dataset.tipo === 'fora'))) {
            mensagem = "Não é possível ter menos que 1 gol quando um time vence!";
        } else if (elemento.dataset.tipo === "Exatamente 0" && (apostaPrincipal && (apostaPrincipal.dataset.tipo === 'casa' || apostaPrincipal.dataset.tipo === 'fora'))) {
            mensagem = "Não é possível terminar com 0 gols quando um time vence!";
        } else if (elemento.dataset.tipo.includes("Exatamente") && apostaPrincipal && apostaPrincipal.dataset.tipo === 'empate') {
            const numero = elemento.dataset.tipo.split(' ')[1];
            if (['1', '3'].includes(numero)) {
                mensagem = "Empate só pode ter número par de gols (0, 2, 4)!";
            }
        } else if ((elemento.dataset.tipo === "1º Tempo" || elemento.dataset.tipo === "2º Tempo") && menosQue1GolSelecionado) {
            mensagem = "Com 'Menos que 1 gol' selecionado, só é possível apostar em 'Empate' para tempo com mais gols!";
        }
        
        if (mensagem) {
            alert(`🚫 ${mensagem}`);
        }
        return;
    }
    
    // Verificar se já está selecionada (toggle)
    if (elemento.classList.contains('selecionada')) {
        elemento.classList.remove('selecionada');
        console.log(`❌ Desselecionada: ${elemento.dataset.tipo}`);
        
        // Atualizar bloqueios quando desselecionar "Menos que 1 gol"
        if (elemento.dataset.tipo === "Menos que 1") {
            atualizarOpcoesBloqueadas(jogo);
        }
        return;
    }
    
    // CORREÇÃO: Desselecionar TODAS as outras opções da MESMA CATEGORIA
    document.querySelectorAll(`#conteudo-${jogoId} .opcao-tabela[data-categoria="${categoria}"]`).forEach(opcao => {
        opcao.classList.remove('selecionada');
    });
    
    // Selecionar apenas esta opção
    elemento.classList.add('selecionada');
    
    console.log(`✅ Aposta adicional selecionada: ${elemento.dataset.tipo} - Odd: ${elemento.dataset.valor} (Categoria: ${categoria})`);
    
    // Atualizar bloqueios quando selecionar "Menos que 1 gol"
    if (elemento.dataset.tipo === "Menos que 1") {
        atualizarOpcoesBloqueadas(jogo);
    }
}

function adicionarApostasAoCarrinho(jogo) {
    const jogoId = jogo.id;
    
    // Remover apostas anteriores deste jogo
    carrinho = carrinho.filter(item => item.jogo.id !== jogoId);
    
    // Coletar todas as seleções deste jogo
    const selecoesDoJogo = [];
    
    // Adicionar aposta principal se selecionada
    const apostaPrincipal = document.querySelector(`#conteudo-${jogoId} .odd.selecionada`);
    if (apostaPrincipal) {
        selecoesDoJogo.push({
            tipo: apostaPrincipal.dataset.tipo,
            valor: parseFloat(apostaPrincipal.dataset.valor),
            nome: apostaPrincipal.dataset.tipo === 'casa' ? jogo.timeCasa : 
                  apostaPrincipal.dataset.tipo === 'fora' ? jogo.timeFora : 'Empate',
            categoria: 'principal'
        });
    }
    
    // CORREÇÃO: Validar que não há múltiplas seleções na mesma categoria
    const selecoesPorCategoria = {};
    
    document.querySelectorAll(`#conteudo-${jogoId} .opcao-tabela.selecionada`).forEach(opcao => {
        const categoria = opcao.dataset.categoria;
        
        // Se já existe uma seleção nesta categoria, mostrar erro
        if (selecoesPorCategoria[categoria]) {
            alert(`❌ Erro: Você só pode selecionar UMA opção por categoria.\nJá existe uma seleção em "${categoria}".`);
            return;
        }
        
        selecoesPorCategoria[categoria] = true;
        
        selecoesDoJogo.push({
            tipo: opcao.dataset.tipo,
            valor: parseFloat(opcao.dataset.valor),
            nome: opcao.dataset.tipo,
            categoria: categoria
        });
    });
    
    // Verificar se há pelo menos uma seleção (principal ou adicional)
    if (selecoesDoJogo.length === 0) {
        alert('Selecione pelo menos uma aposta para este jogo');
        return;
    }
    
    // Calcular odd combinada para este jogo (multiplica todas as odds do mesmo jogo)
    let oddCombinada = 1;
    selecoesDoJogo.forEach(selecao => {
        oddCombinada *= selecao.valor;
    });
    
    // Adicionar como UMA aposta combinada no carrinho
    carrinho.push({
        jogo: jogo,
        selecoes: selecoesDoJogo, // Todas as seleções deste jogo
        valor: oddCombinada, // Odd combinada de todas as seleções
        nome: `${jogo.timeCasa} vs ${jogo.timeFora}`, // Nome do jogo
        quantidadeSelecoes: selecoesDoJogo.length // Quantidade de seleções combinadas
    });
    
    atualizarCarrinho();
    atualizarSelecoesJogo(jogo);
    
    // Fechar o jogo após adicionar ao carrinho
    const header = document.querySelector(`.jogo-header[data-jogo="${jogoId}"]`);
    if (header) {
        header.classList.remove('ativo');
        jogoAberto = null;
    }
    
    console.log(`✅ Aposta adicionada ao carrinho: ${jogo.timeCasa} vs ${jogo.timeFora} - ${selecoesDoJogo.length} seleção(ões)`);
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
                // CORREÇÃO: Buscar por categoria E tipo para apostas adicionais
                const elemento = document.querySelector(`#conteudo-${jogoId} .opcao-tabela[data-categoria="${selecao.categoria}"][data-tipo="${selecao.tipo}"]`);
                if (elemento) {
                    elemento.classList.add('selecionada');
                }
            }
        });
    }
}
function adicionarApostasAoCarrinho(jogo) {
    const jogoId = jogo.id;
    
    // Remover apostas anteriores deste jogo
    carrinho = carrinho.filter(item => item.jogo.id !== jogoId);
    
    // Coletar todas as seleções deste jogo
    const selecoesDoJogo = [];
    
    // Adicionar aposta principal se selecionada
    const apostaPrincipal = document.querySelector(`#conteudo-${jogoId} .odd.selecionada`);
    if (apostaPrincipal) {
        selecoesDoJogo.push({
            tipo: apostaPrincipal.dataset.tipo,
            valor: parseFloat(apostaPrincipal.dataset.valor),
            nome: apostaPrincipal.dataset.tipo === 'casa' ? jogo.timeCasa : 
                  apostaPrincipal.dataset.tipo === 'fora' ? jogo.timeFora : 'Empate',
            categoria: 'principal'
        });
    }
    
    // Adicionar apostas adicionais selecionadas
    document.querySelectorAll(`#conteudo-${jogoId} .opcao-multipla.selecionada`).forEach(opcao => {
        selecoesDoJogo.push({
            tipo: opcao.dataset.tipo,
            valor: parseFloat(opcao.dataset.valor),
            nome: opcao.dataset.tipo,
            categoria: opcao.dataset.categoria
        });
    });
    
    if (selecoesDoJogo.length === 0) {
        alert('Selecione pelo menos uma aposta para este jogo');
        return;
    }
    
    // Calcular odd combinada para este jogo (multiplica todas as odds do mesmo jogo)
    let oddCombinada = 1;
    selecoesDoJogo.forEach(selecao => {
        oddCombinada *= selecao.valor;
    });
    
    // Adicionar como UMA aposta combinada no carrinho
    carrinho.push({
        jogo: jogo,
        selecoes: selecoesDoJogo, // Todas as seleções deste jogo
        valor: oddCombinada, // Odd combinada de todas as seleções
        nome: `${jogo.timeCasa} vs ${jogo.timeFora}`, // Nome do jogo
        quantidadeSelecoes: selecoesDoJogo.length // Quantidade de seleções combinadas
    });
    
    atualizarCarrinho();
    atualizarSelecoesJogo(jogo);
    
    // Fechar o jogo após adicionar ao carrinho
    const header = document.querySelector(`.jogo-header[data-jogo="${jogoId}"]`);
    if (header) {
        header.classList.remove('ativo');
        jogoAberto = null;
    }
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
                const elemento = document.querySelector(`#conteudo-${jogoId} .opcao-tabela[data-categoria="${selecao.categoria}"][data-tipo="${selecao.tipo}"]`);
                if (elemento) {
                    elemento.classList.add('selecionada');
                }
            }
        });
    }
}

// Atualizar carrinho
function atualizarCarrinho() {
    const totalApostas = carrinho.length;
    
    if (carrinhoContador) {
        carrinhoContador.textContent = totalApostas;
    }
    
    if (totalApostas > 0 && carrinhoFlutuante) {
        carrinhoFlutuante.classList.add('ativo');
    } else if (carrinhoFlutuante) {
        carrinhoFlutuante.classList.remove('ativo');
        carrinhoFlutuante.classList.remove('expandido');
    }
    
    if (!carrinhoBody) return;
    
    if (totalApostas === 0) {
        carrinhoBody.innerHTML = '<div class="carrinho-vazio">Seu carrinho está vazio</div>';
        if (oddTotal) {
            oddTotal.textContent = '1.00';
        }
        return;
    }
    
    // Calcular odd total para múltipla
    let oddTotalValor = 1;
    carrinho.forEach(aposta => {
        oddTotalValor *= aposta.valor;
    });
    
    if (oddTotal) {
        oddTotal.textContent = oddTotalValor.toFixed(2);
    }
    
    let html = '';
    
    // Seletor de tipo de aposta
    html += `
        <div class="selector-tipo-aposta">
            <button class="btn-tipo-aposta selecionado" data-tipo="multipla">Aposta Múltipla</button>
            <button class="btn-tipo-aposta" data-tipo="individuais">Apostas Individuais</button>
        </div>
    `;
    
    // Seção de Apostas Individuais
    html += `
        <div id="apostas-individuais">
            <div class="categoria-titulo">🎯 Apostas Individuais</div>
            <div id="lista-apostas-individuais">
    `;
    
    // Mostrar cada JOGO como uma aposta individual (combinada)
    carrinho.forEach((aposta, index) => {
        const apostaId = `jogo-${aposta.jogo.id}`;
        html += `
            <div class="aposta-individual" data-aposta-id="${apostaId}">
                <div class="aposta-individual-header">
                    <div class="aposta-individual-titulo">
                        <strong>${aposta.jogo.timeCasa} vs ${aposta.jogo.timeFora}</strong>
                        <br>
                        <small>${aposta.quantidadeSelecoes} seleção(ões) - Odd: ${aposta.valor.toFixed(2)}</small>
                    </div>
                    <div class="aposta-individual-odd">${aposta.valor.toFixed(2)}</div>
                </div>
                <div class="detalhes-selecoes">
                    ${aposta.selecoes.map(selecao => `
                        <div class="selecao-item">
                            <span class="selecao-nome">${selecao.nome}</span>
                            <span class="selecao-odd">${selecao.valor}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="aposta-individual-valor">
                    <input type="number" 
                           min="5" 
                           step="0.01" 
                           placeholder="R$ 5.00" 
                           class="valor-individual"
                           data-aposta-id="${apostaId}">
                    <button class="btn-remover-individual" data-aposta-id="${apostaId}">×</button>
                </div>
                <div class="ganho-potencial individual-ganho" data-aposta-id="${apostaId}">
                    Ganho: R$ 0.00
                </div>
            </div>
        `;
    });
    
    html += `</div></div>`;
    
    // Seção de Aposta Múltipla
    html += `
        <div class="aposta-multipla" id="aposta-multipla">
            <div class="categoria-titulo">📊 Aposta Múltipla</div>
            <div class="form-group-valor">
                <label>Valor Total da Múltipla (R$):</label>
                <input type="number" id="valor-multipla" min="5" step="0.01" placeholder="Ex: 10.00">
            </div>
            <div class="resumo-multipla">
                <div>Jogos no Carrinho: <span id="quantidade-jogos">${carrinho.length}</span></div>
                <div>Odd Total: <span id="odd-total-multipla">${oddTotalValor.toFixed(2)}</span></div>
                <div>Ganho Potencial: R$ <span id="ganho-multipla">0.00</span></div>
            </div>
        </div>
    `;
    
    carrinhoBody.innerHTML = html;
    
    // Inicialmente mostrar apenas múltipla, esconder individuais
    const apostasIndividuais = document.getElementById('apostas-individuais');
    const apostaMultipla = document.getElementById('aposta-multipla');
    
    if (apostasIndividuais) apostasIndividuais.style.display = 'none';
    if (apostaMultipla) apostaMultipla.style.display = 'block';
    
    // Reatribuir event listeners
    reatribuirEventListeners();
    atualizarGanhoMultipla();
}

// Reatribuir event listeners após atualizar o carrinho
function reatribuirEventListeners() {
    // Event listeners para seletor de tipo
    document.querySelectorAll('.btn-tipo-aposta').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.btn-tipo-aposta').forEach(b => b.classList.remove('selecionado'));
            this.classList.add('selecionado');
            
            const tipo = this.dataset.tipo;
            const apostasIndividuais = document.getElementById('apostas-individuais');
            const apostaMultipla = document.getElementById('aposta-multipla');
            
            if (tipo === 'multipla') {
                if (apostasIndividuais) apostasIndividuais.style.display = 'none';
                if (apostaMultipla) apostaMultipla.style.display = 'block';
            } else {
                if (apostasIndividuais) apostasIndividuais.style.display = 'block';
                if (apostaMultipla) apostaMultipla.style.display = 'none';
            }
        });
    });
    
    // Event listeners para apostas individuais
    document.querySelectorAll('.btn-remover-individual').forEach(btn => {
        btn.addEventListener('click', function() {
            const apostaId = this.dataset.apostaId;
            removerApostaIndividual(apostaId);
        });
    });
    
    document.querySelectorAll('.valor-individual').forEach(input => {
        input.addEventListener('input', function() {
            const apostaId = this.dataset.apostaId;
            atualizarGanhoIndividual(apostaId);
        });
    });
    
    // Event listeners para aposta múltipla
    const valorMultiplaInput = document.getElementById('valor-multipla');
    if (valorMultiplaInput) {
        valorMultiplaInput.addEventListener('input', atualizarGanhoMultipla);
    }
    
    // Atualizar quantidade de jogos na seção múltipla
    const quantidadeJogosElement = document.getElementById('quantidade-jogos');
    if (quantidadeJogosElement) {
        quantidadeJogosElement.textContent = carrinho.length;
    }
}

// Atualizar ganho para aposta individual
function atualizarGanhoIndividual(apostaId) {
    const input = document.querySelector(`.valor-individual[data-aposta-id="${apostaId}"]`);
    const ganhoElement = document.querySelector(`.individual-ganho[data-aposta-id="${apostaId}"]`);
    
    if (!input || !ganhoElement) return;
    
    const valor = parseFloat(input.value) || 0;
    const aposta = encontrarApostaPorId(apostaId);
    
    if (aposta) {
        const ganho = (valor * aposta.valor).toFixed(2);
        ganhoElement.textContent = `Ganho: R$ ${ganho}`;
    }
}

// Atualizar ganho para aposta múltipla
function atualizarGanhoMultipla() {
    const valorMultiplaInput = document.getElementById('valor-multipla');
    const ganhoMultiplaElement = document.getElementById('ganho-multipla');
    const oddTotalMultiplaElement = document.getElementById('odd-total-multipla');
    
    if (!valorMultiplaInput || !ganhoMultiplaElement || !oddTotalMultiplaElement) return;
    
    const valor = parseFloat(valorMultiplaInput.value) || 0;
    const oddTotal = parseFloat(oddTotalMultiplaElement.textContent);
    const ganho = (valor * oddTotal).toFixed(2);
    ganhoMultiplaElement.textContent = ganho;
}

// Encontrar aposta por ID
function encontrarApostaPorId(apostaId) {
    const jogoId = parseInt(apostaId.replace('jogo-', ''));
    return carrinho.find(aposta => aposta.jogo.id === jogoId);
}

// Remover aposta individual
function removerApostaIndividual(apostaId) {
    const jogoId = parseInt(apostaId.replace('jogo-', ''));
    
    carrinho = carrinho.filter(aposta => aposta.jogo.id !== jogoId);
    
    atualizarCarrinho();
    
    // Atualizar seleções no jogo se estiver aberto
    if (jogoAberto === jogoId) {
        const jogo = campeonatos[campeonatoSelecionado]?.jogos?.find(j => j.id === jogoId);
        if (jogo) {
            atualizarSelecoesJogo(jogo);
        }
    }
}

// Remover aposta do carrinho
function removerAposta(jogoId, categoria, tipo) {
    carrinho = carrinho.filter(aposta => 
        !(aposta.jogo.id === jogoId && aposta.categoria === categoria && aposta.tipo === tipo)
    );
    atualizarCarrinho();
    
    // Atualizar seleções no jogo se estiver aberto
    if (jogoAberto === jogoId) {
        const jogo = campeonatos[campeonatoSelecionado]?.jogos?.find(j => j.id === jogoId);
        if (jogo) {
            atualizarSelecoesJogo(jogo);
        }
    }
}

// Limpar carrinho
function limparCarrinho() {
    carrinho = [];
    atualizarCarrinho();
    
    // Limpar todas as seleções visuais
    document.querySelectorAll('.odd, .opcao-multipla').forEach(el => {
        el.classList.remove('selecionada');
    });
}

// Mostrar formulário do usuário
function mostrarFormUsuario() {
    if (carrinho.length === 0) {
        alert('Adicione pelo menos uma aposta ao carrinho');
        return;
    }
    
    const tipoSelecionadoElement = document.querySelector('.btn-tipo-aposta.selecionado');
    if (!tipoSelecionadoElement) {
        alert('Selecione um tipo de aposta');
        return;
    }
    
    const tipoSelecionado = tipoSelecionadoElement.dataset.tipo;
    let dadosAposta = {
        campeonato: campeonatos[campeonatoSelecionado]?.nome || 'Campeonato',
        apostas: [...carrinho],
        oddTotal: calcularOddTotal(),
        tipo: tipoSelecionado,
        quantidadeJogos: carrinho.length
    };
    
    if (tipoSelecionado === 'multipla') {
        const valorMultiplaInput = document.getElementById('valor-multipla');
        const valorMultipla = parseFloat(valorMultiplaInput ? valorMultiplaInput.value : 0) || 0;
        
        if (valorMultipla < 5) {
            alert('Para aposta múltipla, insira um valor mínimo de R$ 5,00');
            return;
        }
        dadosAposta.valorMultipla = valorMultipla;
        dadosAposta.ganhoPotencialMultipla = (valorMultipla * dadosAposta.oddTotal).toFixed(2);
    } else {
        // Para individuais, coletar valores de cada JOGO (aposta combinada)
        const apostasComValor = [];
        let temApostaValida = false;
        
        document.querySelectorAll('.aposta-individual').forEach(apostaElement => {
            const apostaId = apostaElement.dataset.apostaId;
            const input = document.querySelector(`.valor-individual[data-aposta-id="${apostaId}"]`);
            const valor = parseFloat(input ? input.value : 0) || 0;
            
            if (valor >= 5) {
                temApostaValida = true;
                const aposta = encontrarApostaPorId(apostaId);
                apostasComValor.push({
                    ...aposta,
                    valorApostado: valor,
                    ganhoPotencial: (valor * aposta.valor).toFixed(2)
                });
            }
        });
        
        if (!temApostaValida) {
            alert('Para apostas individuais, insira pelo menos uma aposta com valor mínimo de R$ 5,00');
            return;
        }
        
        dadosAposta.apostasIndividuais = apostasComValor;
    }
    
    // SALVAR NO LOCALSTORAGE - IMPORTANTE!
    localStorage.setItem('dadosAposta', JSON.stringify(dadosAposta));
    
    // Redirecionar para a página do usuário
    window.location.href = 'usuario.html';
}

// Calcular odd total
function calcularOddTotal() {
    let total = 1;
    carrinho.forEach(aposta => {
        total *= aposta.valor;
    });
    return total.toFixed(2);
}

// Verificar se há seleções conflitantes
function verificarSelecoesConflitantes(jogoId) {
    const selecoesGolsMais = document.querySelectorAll(`#conteudo-${jogoId} .opcao-multipla[data-categoria="gols_mais"].selecionada`);
    const selecoesGolsExato = document.querySelectorAll(`#conteudo-${jogoId} .opcao-multipla[data-categoria="gols_exato"].selecionada`);
    
    // Se tem seleções em ambas as categorias de gols, há conflito
    if (selecoesGolsMais.length > 0 && selecoesGolsExato.length > 0) {
        return true;
    }
    
    // Verificar múltiplas seleções em categorias que não permitem (escanteios, tempo_gols)
    const selecoesEscanteios = document.querySelectorAll(`#conteudo-${jogoId} .opcao-multipla[data-categoria="escanteios"].selecionada`);
    const selecoesTempoGols = document.querySelectorAll(`#conteudo-${jogoId} .opcao-multipla[data-categoria="tempo_gols"].selecionada`);
    
    if (selecoesEscanteios.length > 1 || selecoesTempoGols.length > 1) {
        return true;
    }
    
    return false;
}
// Melhorias para mobile
function melhoriasMobile() {
    // Prevenir zoom duplo em elementos interativos
    document.addEventListener('touchstart', function(e) {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    }, { passive: false });

    // Melhor feedback tátil
    document.addEventListener('touchstart', function() {}, { passive: true });

    // Otimizar carregamento para conexões lentas
    if ('connection' in navigator) {
        if (navigator.connection.saveData === true) {
            console.log('Modo economia de dados ativado');
        }
        
        if (navigator.connection.effectiveType.includes('2g')) {
            console.log('Conexão lida detectada - otimizando...');
        }
    }
}

// Inicializar melhorias mobile
document.addEventListener('DOMContentLoaded', function() {
    melhoriasMobile();
});

// Swipe para carrinho (opcional)
let startX = 0;
document.addEventListener('touchstart', function(e) {
    startX = e.touches[0].clientX;
});

document.addEventListener('touchend', function(e) {
    if (!startX) return;
    
    const endX = e.changedTouches[0].clientX;
    const diffX = startX - endX;
    
    // Swipe da direita para esquerda abre carrinho
    if (diffX > 50 && carrinho.length > 0) {
        if (carrinhoFlutuante) {
            carrinhoFlutuante.classList.add('expandido');
        }
    }
    
    startX = 0;
});

function carregarJogosDeHoje() {
    if (!listaJogos) {
        console.error('❌ Elemento listaJogos não encontrado');
        return;
    }
    
    console.log('🔄 Buscando jogos de hoje...');
    listaJogos.innerHTML = '<div class="carrinho-vazio">Carregando jogos de hoje...</div>';
    
    // Obtém a data de hoje no formato DD/MM/AAAA
    const hoje = new Date();
    const dia = String(hoje.getDate()).padStart(2, '0');
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const ano = hoje.getFullYear();
    const dataHoje = `${dia}/${mes}/${ano}`;
    
    console.log('📅 Data de hoje:', dataHoje);
    
    // Pequeno delay para garantir que o DOM foi atualizado
    setTimeout(() => {
        // Coleta todos os jogos de hoje de todos os campeonatos
        const todosJogosHoje = [];
        
        Object.keys(campeonatos).forEach(campeonatoId => {
            const campeonato = campeonatos[campeonatoId];
            const jogosHoje = (campeonato.jogos || []).filter(jogo => {
                // Verifica se a data do jogo é hoje (só compara a parte da data, não a hora)
                const jogoData = jogo.data ? jogo.data.split(' ')[0] : '';
                return jogoData === dataHoje;
            });
            
            // Adiciona informações do campeonato a cada jogo
            jogosHoje.forEach(jogo => {
                todosJogosHoje.push({
                    ...jogo,
                    campeonatoId: campeonatoId,
                    campeonatoNome: campeonato.nome
                });
            });
        });
        
        console.log(`📊 Total de jogos encontrados: ${todosJogosHoje.length}`);
        
        // Ordena jogos por horário
        todosJogosHoje.sort((a, b) => {
            const horaA = a.data.split(' ')[1] || '00:00';
            const horaB = b.data.split(' ')[1] || '00:00';
            return horaA.localeCompare(horaB);
        });
        
        if (todosJogosHoje.length === 0) {
            listaJogos.innerHTML = `
                <div class="carrinho-vazio">
                    Nenhum jogo encontrado para hoje (${dataHoje})<br>
                    <small>Selecione um campeonato específico para ver todos os jogos</small>
                </div>
            `;
            return;
        }
        
        listaJogos.innerHTML = '';
        
        // Agrupa jogos por campeonato para melhor organização
        const jogosPorCampeonato = {};
        todosJogosHoje.forEach(jogo => {
            if (!jogosPorCampeonato[jogo.campeonatoNome]) {
                jogosPorCampeonato[jogo.campeonatoNome] = [];
            }
            jogosPorCampeonato[jogo.campeonatoNome].push(jogo);
        });
        
        // Renderiza os jogos agrupados por campeonato
        Object.keys(jogosPorCampeonato).forEach(campeonatoNome => {
            const jogosDoCampeonato = jogosPorCampeonato[campeonatoNome];
            
            // Header do campeonato
            const headerCampeonato = document.createElement('div');
            headerCampeonato.className = 'header-campeonato';
            headerCampeonato.innerHTML = `
                <div style="background: #f3e6f8; padding: 10px 15px; border-radius: 8px; margin: 15px 0 10px 0; border-left: 4px solid #8A05BE;">
                    <h4 style="margin: 0; color: #6D0B9E; font-size: 1rem;">
                        🏆 ${campeonatoNome}
                    </h4>
                    <small style="color: #666;">${jogosDoCampeonato.length} jogo(s) hoje</small>
                </div>
            `;
            listaJogos.appendChild(headerCampeonato);
            
            // Jogos deste campeonato
            jogosDoCampeonato.forEach(jogo => {
                const jogoElement = document.createElement('div');
                jogoElement.className = 'jogo-acordeao';
                jogoElement.innerHTML = `
                    <div class="jogo-header" data-jogo="${jogo.id}">
                        <div class="jogo-info">
                            <div class="times">
                                <div class="time">${jogo.timeCasa}</div>
                                <div class="vs">vs</div>
                                <div class="time">${jogo.timeFora}</div>
                            </div>
                            <div class="data">${jogo.data}</div>
                        </div>
                        <div class="seta">▼</div>
                    </div>
                    <div class="jogo-conteudo" id="conteudo-${jogo.id}">
                        <!-- Conteúdo será preenchido via JavaScript -->
                    </div>
                `;
                
                // Event listener para abrir/fechar o jogo
                const header = jogoElement.querySelector('.jogo-header');
                header.addEventListener('click', function() {
                    toggleJogo(this, jogo);
                });
                
                listaJogos.appendChild(jogoElement);
            });
        });
        
        if (tituloCampeonato) {
            tituloCampeonato.textContent = `🎯 Jogos de Hoje (${dataHoje})`;
        }
        
        console.log('✅ Jogos de hoje carregados com sucesso');
    }, 100);
}

function carregarJogosPorCampeonato(campeonatoId) {
    if (!campeonatoId || !listaJogos) return;
    
    console.log(`🔄 Carregando jogos do campeonato: ${campeonatoId}`);
    
    const campeonato = campeonatos[campeonatoId];
    if (!campeonato) {
        console.error('❌ Campeonato não encontrado:', campeonatoId);
        return;
    }
    
    const jogos = campeonato.jogos || [];
    
    listaJogos.innerHTML = '';
    
    if (jogos.length === 0) {
        listaJogos.innerHTML = '<div class="carrinho-vazio">Nenhum jogo disponível neste campeonato</div>';
        return;
    }
    
    // Ordena jogos por data
    const jogosOrdenados = [...jogos].sort((a, b) => {
        const dataA = a.data ? new Date(a.data.split(' ').reverse().join('-')) : new Date();
        const dataB = b.data ? new Date(b.data.split(' ').reverse().join('-')) : new Date();
        return dataA - dataB;
    });
    
    jogosOrdenados.forEach(jogo => {
        const jogoElement = document.createElement('div');
        jogoElement.className = 'jogo-acordeao';
        jogoElement.innerHTML = `
            <div class="jogo-header" data-jogo="${jogo.id}">
                <div class="jogo-info">
                    <div class="times">
                        <div class="time">${jogo.timeCasa}</div>
                        <div class="vs">vs</div>
                        <div class="time">${jogo.timeFora}</div>
                    </div>
                    <div class="data">${jogo.data}</div>
                </div>
                <div class="seta">▼</div>
            </div>
            <div class="jogo-conteudo" id="conteudo-${jogo.id}">
                <!-- Conteúdo será preenchido via JavaScript -->
            </div>
        `;
        
        // Event listener para abrir/fechar o jogo
        const header = jogoElement.querySelector('.jogo-header');
        header.addEventListener('click', function() {
            toggleJogo(this, jogo);
        });
        
        listaJogos.appendChild(jogoElement);
    });
    
    if (tituloCampeonato) {
        tituloCampeonato.textContent = `Próximos Jogos - ${campeonato.nome}`;
    }
    
    console.log(`✅ Carregados ${jogos.length} jogos do campeonato ${campeonatoId}`);
}
// Atualizar a função carregarJogos (se existir) ou substituir por:
function carregarJogos() {
    if (campeonatoSelecionadoGlobal) {
        carregarJogosPorCampeonato(campeonatoSelecionadoGlobal);
    } else {
        carregarJogosDeHoje();
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
