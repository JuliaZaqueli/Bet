// Dados dos campeonatos com odds adicionais
let campeonatos = {};


// Função para carregar dados do localStorage ou usar padrão
async function carregarDadosCampeonatos() {
    console.log('🔄 Iniciando carregamento de dados...');
    
    // PRIORIDADE 1: Dados do admin no localStorage (modificações do usuário)
    const dadosAdmin = localStorage.getItem('campeonatosAdmin');
    
    if (dadosAdmin) {
        try {
            campeonatos = JSON.parse(dadosAdmin);
            console.log('✅ Dados carregados do localStorage admin:', Object.keys(campeonatos));
            return;
        } catch (error) {
            console.error('❌ Erro ao parsear dados do admin:', error);
            // Se der erro, continua para carregar outros dados
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
        campeonatos = dadosJson;
        console.log('✅ Dados carregados do arquivo JSON:', Object.keys(campeonatos));
        
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


function configurarSincronizacao() {
    // Ouvir mudanças no localStorage entre abas
    window.addEventListener('storage', function(e) {
        console.log('🔄 Evento storage detectado:', e.key);
        
        if (e.key === 'campeonatosAdmin') {
            console.log('📢 Modificações do admin detectadas em outra aba, recarregando...');
            
            if (e.newValue) {
                try {
                    campeonatos = JSON.parse(e.newValue);
                    console.log('✅ Dados atualizados via storage event');
                    
                    // Recarregar interface
                    carregarOpcoesCampeonato();
                    
                    // Recarregar jogos se houver seleção
                    if (campeonatoSelecionadoGlobal) {
                        carregarJogos();
                    }
                } catch (error) {
                    console.error('❌ Erro ao processar dados do storage event:', error);
                }
            }
        }
    });
    
    // Verificar mudanças a cada 3 segundos (fallback para alguns navegadores)
    setInterval(() => {
        const dadosAtuais = JSON.stringify(campeonatos);
        const dadosStorageAdmin = localStorage.getItem('campeonatosAdmin');
        
        if (dadosStorageAdmin && dadosStorageAdmin !== dadosAtuais) {
            console.log('🔄 Mudanças detectadas (polling), atualizando...');
            try {
                campeonatos = JSON.parse(dadosStorageAdmin);
                carregarOpcoesCampeonato();
                if (campeonatoSelecionadoGlobal) {
                    carregarJogos();
                }
            } catch (error) {
                console.error('❌ Erro ao atualizar via polling:', error);
            }
        }
    }, 3000);
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
    selecaoCampeonato = document.getElementById('selecao-campeonato');
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
    
    // Inicializar elementos DOM
    inicializarElementosDOM();
    
    // Carregar dados primeiro
    carregarDadosCampeonatos().then(() => {
        // Configurar sincronização
        configurarSincronizacao();
        
        // Carregar opções de campeonato (isso já vai carregar os jogos de hoje automaticamente)
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

// Substituir a função carregarConteudoJogo por esta versão corrigida:
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
    
    // Adicionar odds adicionais se existirem e tiverem a estrutura correta
    if (jogo.oddsAdicionais) {
        // Categoria de Gols - com verificação de segurança
        if (jogo.oddsAdicionais.gols && jogo.oddsAdicionais.gols.mais && jogo.oddsAdicionais.gols.exato) {
            html += `
                <div class="categoria-aposta">
                    <div class="categoria-titulo">⚽ Quantidade de Gols</div>
                    <div class="opcoes-multiplas" id="gols-${jogo.id}">
            `;

            // Combinar TODAS as opções de gols em uma única categoria
            const todasOpcoesGols = [
                ...(jogo.oddsAdicionais.gols.mais || []).map(opcao => ({...opcao, subcategoria: 'mais'})),
                ...(jogo.oddsAdicionais.gols.exato || []).map(opcao => ({...opcao, subcategoria: 'exato'}))
            ];

            // Adicionar todas as opções de gols como uma única categoria
            todasOpcoesGols.forEach(opcao => {
                html += `
                    <div class="opcao-multipla" data-jogo="${jogo.id}" data-categoria="gols" data-tipo="${opcao.tipo}" data-valor="${opcao.odd}">
                        ${opcao.tipo}
                        <div class="odd-opcao">${opcao.odd}</div>
                    </div>
                `;
            });

            html += `
                    </div>
                </div>
            `;
        }
        
        // Categoria de Tempo de Gols - com verificação de segurança
        if (jogo.oddsAdicionais.tempoGols && Array.isArray(jogo.oddsAdicionais.tempoGols)) {
            html += `
                <div class="categoria-aposta">
                    <div class="categoria-titulo">⏰ Tempo com Mais Gols</div>
                    <div class="opcoes-multiplas" id="tempo-gols-${jogo.id}">
                        ${jogo.oddsAdicionais.tempoGols.map(opcao => `
                            <div class="opcao-multipla" data-jogo="${jogo.id}" data-categoria="tempo_gols" data-tipo="${opcao.tipo}" data-valor="${opcao.odd}">
                                ${opcao.tipo}
                                <div class="odd-opcao">${opcao.odd}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        // Categoria de Escanteios - com verificação de segurança
        if (jogo.oddsAdicionais.escanteios && jogo.oddsAdicionais.escanteios.mais) {
            html += `
                <div class="categoria-aposta">
                    <div class="categoria-titulo">📐 Total de Escanteios</div>
                    <div class="opcoes-multiplas" id="escanteios-${jogo.id}">
                        ${(jogo.oddsAdicionais.escanteios.mais || []).map(opcao => `
                            <div class="opcao-multipla" data-jogo="${jogo.id}" data-categoria="escanteios" data-tipo="${opcao.tipo}" data-valor="${opcao.odd}">
                                ${opcao.tipo}
                                <div class="odd-opcao">${opcao.odd}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    }
    
    html += `<button class="btn-adicionar-carrinho" data-jogo="${jogo.id}">Adicionar ao Carrinho</button>`;
    
    conteudo.innerHTML = html;
    
    // Adicionar event listeners
    conteudo.querySelectorAll('.odd').forEach(odd => {
        odd.addEventListener('click', function() {
            selecionarApostaPrincipal(this, jogo);
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
}

// ... (o resto das funções permanecem iguais - selecionarApostaPrincipal, selecionarApostaAdicional, etc.)

// Selecionar aposta principal
function selecionarApostaPrincipal(elemento, jogo) {
    const jogoId = jogo.id;
    const tipo = elemento.dataset.tipo;
    const valor = parseFloat(elemento.dataset.valor);
    
    // Desselecionar outras odds principais deste jogo
    document.querySelectorAll(`#conteudo-${jogoId} .odd`).forEach(odd => {
        odd.classList.remove('selecionada');
    });
    
    // Selecionar esta odd
    elemento.classList.add('selecionada');
}

function selecionarApostaAdicional(elemento, jogo) {
    const jogoId = jogo.id;
    const categoria = elemento.dataset.categoria;
    
    // Verificar se já está selecionada (desselecionar)
    if (elemento.classList.contains('selecionada')) {
        elemento.classList.remove('selecionada');
        return;
    }
    
    // PARA TODAS AS CATEGORIAS: desselecionar outras opções da MESMA CATEGORIA
    document.querySelectorAll(`#conteudo-${jogoId} .opcao-multipla[data-categoria="${categoria}"]`).forEach(opcao => {
        opcao.classList.remove('selecionada');
    });
    
    // Selecionar esta opção
    elemento.classList.add('selecionada');
}

// Adicionar apostas selecionadas ao carrinho - VERSÃO SIMPLIFICADA
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
    document.querySelectorAll(`#conteudo-${jogoId} .odd, #conteudo-${jogoId} .opcao-multipla`).forEach(el => {
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
                const elemento = document.querySelector(`#conteudo-${jogoId} .opcao-multipla[data-categoria="${selecao.categoria}"][data-tipo="${selecao.tipo}"]`);
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
