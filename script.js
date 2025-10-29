// Dados dos campeonatos com odds adicionais
let campeonatos = {};

// Função para carregar dados do localStorage ou usar padrão
async function carregarDadosCampeonatos() {
    // Primeiro tenta carregar do localStorage (dados do admin)
    const dadosAdmin = localStorage.getItem('campeonatosSistema');
    const dadosAdmin2 = localStorage.getItem('campeonatosAdmin');
    
    if (dadosAdmin) {
        campeonatos = JSON.parse(dadosAdmin);
        console.log('✅ Dados carregados do sistema admin');
        return;
    } else if (dadosAdmin2) {
        campeonatos = JSON.parse(dadosAdmin2);
        console.log('✅ Dados carregados do localStorage admin');
        return;
    }
    
    // Se não tem dados no localStorage, carrega do arquivo JSON
    try {
        console.log('🔄 Tentando carregar dados do arquivo JSON...');
        const response = await fetch('dados.json');
        
        if (!response.ok) {
            throw new Error('Arquivo dados.json não encontrado');
        }
        
        const dadosJson = await response.json();
        
        // Verifica a estrutura do arquivo
        if (dadosJson.campeonatos) {
            campeonatos = dadosJson.campeonatos;
            console.log('✅ Dados carregados do arquivo dados.json');
        } else {
            campeonatos = dadosJson; // Assume que é direto os campeonatos
            console.log('✅ Dados carregados do arquivo JSON (estrutura direta)');
        }
        
        // Salva no localStorage para futuras sessões
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
            },
            "libertadores": {
                nome: "Copa Libertadores", 
                jogos: []
            },
            "serie-b": {
                nome: "Série B", 
                jogos: []
            }
        };
        console.log('ℹ️ Usando estrutura básica de campeonatos');
    }
}
function configurarSincronizacao() {
    window.addEventListener('storage', function(e) {
        if (e.key === 'campeonatosSistema' || e.key === 'campeonatosAdmin') {
            console.log('🔄 Dados atualizados detectados, recarregando...');
            carregarDadosCampeonatos();
            
            // Se um campeonato estava selecionado, recarregar os jogos
            if (campeonatoSelecionado) {
                carregarJogos();
            }
        }
    });
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
    console.log('Sistema de Apostas - Página Principal');
    
    // Inicializar elementos DOM
    inicializarElementosDOM();
    
    // Carregar dados primeiro
    carregarDadosCampeonatos();
    
    // Configurar sincronização
    configurarSincronizacao();

    // Carregar opções de campeonato
    carregarOpcoesCampeonato();
    
    // Event listeners para seleção de campeonato
    if (selecaoCampeonato) {
        document.querySelectorAll('.opcao-campeonato').forEach(opcao => {
            opcao.addEventListener('click', function() {
                document.querySelectorAll('.opcao-campeonato').forEach(el => {
                    el.classList.remove('selecionada');
                });
                this.classList.add('selecionada');
                
                campeonatoSelecionado = this.dataset.campeonato;
                carregarJogos();
                
                if (listaJogosContainer) {
                    listaJogosContainer.classList.remove('hidden');
                }
                
                carrinho = [];
                atualizarCarrinho();
            });
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
    
    Object.keys(campeonatos).forEach(campeonatoId => {
        const campeonato = campeonatos[campeonatoId];
        const opcaoElement = document.createElement('div');
        opcaoElement.className = 'opcao-campeonato';
        opcaoElement.dataset.campeonato = campeonatoId;
        opcaoElement.innerHTML = `
            <div class="icone-campeonato">⚽</div>
            <div class="nome-campeonato">${campeonato.nome}</div>
            <p>${obterDescricaoCampeonato(campeonatoId)}</p>
        `;
        opcoesCampeonato.appendChild(opcaoElement);
    });
    
    // Reatribuir event listeners
    document.querySelectorAll('.opcao-campeonato').forEach(opcao => {
        opcao.addEventListener('click', function() {
            document.querySelectorAll('.opcao-campeonato').forEach(el => {
                el.classList.remove('selecionada');
            });
            this.classList.add('selecionada');
            
            campeonatoSelecionado = this.dataset.campeonato;
            carregarJogos();
            
            if (listaJogosContainer) {
                listaJogosContainer.classList.remove('hidden');
            }
            
            carrinho = [];
            atualizarCarrinho();
        });
    });
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
    
    conteudo.querySelectorAll('.opcao-multipla').forEach(opcao => {
        opcao.addEventListener('click', function() {
            selecionarApostaAdicional(this, jogo);
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