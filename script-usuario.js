// Elementos DOM
const resumoAposta = document.getElementById('resumo-aposta');
const nomeInput = document.getElementById('nome');
const emailInput = document.getElementById('email');
const telefoneInput = document.getElementById('telefone');
const btnVoltar = document.getElementById('btn-voltar');
const btnConfirmarAposta = document.getElementById('btn-confirmar-aposta');

// Variáveis
let dadosAposta = null;

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    console.log('Página do Usuário - Carregando dados...');
    
    // Carregar dados do localStorage
    const dadosSalvos = localStorage.getItem('dadosAposta');
    if (!dadosSalvos) {
        alert('Nenhuma aposta encontrada. Volte à página inicial.');
        window.location.href = 'index.html';
        return;
    }
    
    dadosAposta = JSON.parse(dadosSalvos);
    console.log('Dados da aposta:', dadosAposta);
    carregarResumoAposta();
    
    // Event listeners
    btnVoltar.addEventListener('click', voltarParaIndex);
    btnConfirmarAposta.addEventListener('click', finalizarAposta);
});

// Carregar resumo da aposta
function carregarResumoAposta() {
    if (!resumoAposta) {
        console.error('Elemento resumo-aposta não encontrado');
        return;
    }

    let html = `
        <div class="aposta-pendente">
            <p><strong>Campeonato:</strong> ${dadosAposta.campeonato}</p>
            <p><strong>Tipo de Aposta:</strong> ${dadosAposta.tipo === 'multipla' ? 'Aposta Múltipla' : 'Apostas Individuais'}</p>
            <p><strong>Quantidade de Jogos:</strong> ${dadosAposta.quantidadeJogos}</p>
    `;
    
    // Resumo baseado no tipo de aposta
    if (dadosAposta.tipo === 'multipla') {
        html += `
            <p><strong>Valor da Aposta:</strong> R$ ${dadosAposta.valorMultipla ? dadosAposta.valorMultipla.toFixed(2) : '0.00'}</p>
            <p><strong>Odd Total:</strong> ${dadosAposta.oddTotal}</p>
            <div class="ganho-potencial">
                <p><strong>Ganho Potencial:</strong> R$ ${dadosAposta.ganhoPotencialMultipla ? dadosAposta.ganhoPotencialMultipla : '0.00'}</p>
            </div>
        `;
    } else {
        // Para apostas individuais, mostrar o total
        const totalApostado = dadosAposta.apostasIndividuais ? 
            dadosAposta.apostasIndividuais.reduce((total, aposta) => total + aposta.valorApostado, 0) : 0;
        const totalGanhoPotencial = dadosAposta.apostasIndividuais ?
            dadosAposta.apostasIndividuais.reduce((total, aposta) => total + parseFloat(aposta.ganhoPotencial), 0) : 0;
        
        html += `
            <p><strong>Total Apostado:</strong> R$ ${totalApostado.toFixed(2)}</p>
            <p><strong>Quantidade de Apostas Individuais:</strong> ${dadosAposta.apostasIndividuais ? dadosAposta.apostasIndividuais.length : 0}</p>
            <div class="ganho-potencial">
                <p><strong>Ganho Potencial Total:</strong> R$ ${totalGanhoPotencial.toFixed(2)}</p>
            </div>
        `;
    }
    
    html += `</div>`; // Fecha aposta-pendente
    
    // Detalhes dos Jogos
    html += `<h4 style="margin: 20px 0 10px 0; color: #8A05BE;">🎯 Detalhes dos Jogos:</h4>`;
    
    if (dadosAposta.apostas && dadosAposta.apostas.length > 0) {
        dadosAposta.apostas.forEach((aposta, index) => {
            html += `
                <div class="jogo-resumo">
                    <div class="jogo-titulo">
                        ${aposta.jogo.timeCasa} vs ${aposta.jogo.timeFora}
                        <small>${aposta.quantidadeSelecoes} seleção(ões) - Odd Combinada: ${aposta.valor.toFixed(2)}</small>
                    </div>
                    <div class="detalhes-selecoes">
            `;
            
            // Listar seleções
            if (aposta.selecoes && aposta.selecoes.length > 0) {
                aposta.selecoes.forEach(selecao => {
                    html += `
                        <div class="selecao-item">
                            <span class="selecao-nome">${selecao.nome}</span>
                            <span class="selecao-odd">${selecao.valor}</span>
                        </div>
                    `;
                });
            }
            
            html += `</div>`; // Fecha detalhes-selecoes
            
            // Se for aposta individual, mostrar valor apostado e ganho potencial específico
            if (dadosAposta.tipo === 'individuais' && dadosAposta.apostasIndividuais) {
                const apostaIndividual = dadosAposta.apostasIndividuais.find(a => a.jogo.id === aposta.jogo.id);
                if (apostaIndividual) {
                    html += `
                        <div class="resumo-individual">
                            <div class="valores-individuais">
                                <span><strong>Valor Apostado:</strong> R$ ${apostaIndividual.valorApostado.toFixed(2)}</span>
                                <span><strong>Ganho Potencial:</strong> R$ ${apostaIndividual.ganhoPotencial}</span>
                            </div>
                        </div>
                    `;
                }
            }
            
            html += `</div>`; // Fecha jogo-resumo
        });
    } else {
        html += `<p>Nenhum jogo encontrado na aposta.</p>`;
    }
    
    resumoAposta.innerHTML = html;
}

// Voltar para página inicial
function voltarParaIndex() {
    window.location.href = 'index.html';
}

// Finalizar aposta
function finalizarAposta() {
    const nome = nomeInput.value.trim();
    const email = emailInput.value.trim();
    const telefone = telefoneInput.value.trim();
    
    // Validações
    if (!nome) {
        mostrarErro('Por favor, insira seu nome completo');
        return;
    }
    
    if (nome.length < 3) {
        mostrarErro('O nome deve ter pelo menos 3 caracteres');
        return;
    }
    
    if (!email) {
        mostrarErro('Por favor, insira seu email');
        return;
    }
    
    if (!isValidEmail(email)) {
        mostrarErro('Por favor, insira um email válido');
        return;
    }
    
    if (!telefone) {
        mostrarErro('Por favor, insira seu telefone');
        return;
    }
    
    if (telefone.replace(/\D/g, '').length < 10) {
        mostrarErro('Por favor, insira um telefone válido com DDD');
        return;
    }
    
    // Se todas as validações passarem, prosseguir
    processarFinalizacaoAposta(nome, email, telefone);
}

// Mostrar erro
function mostrarErro(mensagem) {
    alert('❌ ' + mensagem);
}

// Processar finalização da aposta
async function processarFinalizacaoAposta(nome, email, telefone) {
    // Atualizar dados da aposta com informações do usuário
    dadosAposta.nome = nome;
    dadosAposta.email = email;
    dadosAposta.telefone = telefone;
    dadosAposta.data = new Date().toLocaleString('pt-BR');
    
    // Salvar dados atualizados no localStorage
    localStorage.setItem('dadosAposta', JSON.stringify(dadosAposta));
    
    // Mostrar loading no botão
    const btnOriginal = btnConfirmarAposta.innerHTML;
    btnConfirmarAposta.innerHTML = '🔄 Enviando...';
    btnConfirmarAposta.disabled = true;
    
    try {
        // Enviar email de confirmação
        const emailEnviado = await enviarEmailConfirmacao();
        
        if (emailEnviado) {
            alert('✅ Aposta finalizada com sucesso! Email de confirmação enviado.\n\nAgora você será redirecionado para a página de pagamento.');
            // Redirecionar para página de pagamento
            setTimeout(() => {
                window.location.href = 'pagamento.html';
            }, 2000);
        } else {
            alert('❌ Erro ao enviar email de confirmação. Sua aposta foi registrada, mas o email não foi enviado. Entre em contato conosco.');
            btnConfirmarAposta.innerHTML = btnOriginal;
            btnConfirmarAposta.disabled = false;
        }
    } catch (error) {
        console.error('Erro ao finalizar aposta:', error);
        alert('❌ Erro ao finalizar aposta. Tente novamente.');
        btnConfirmarAposta.innerHTML = btnOriginal;
        btnConfirmarAposta.disabled = false;
    }
}

// Validar email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ========== FUNÇÕES DE EMAIL ========== //

// Inicializar EmailJS
(function() {
    emailjs.init("gP-FJKwK1pL-13ok-");
})();

// GERAR HTML DETALHADO PARA O EMAIL
function gerarHtmlEmail() {
    let html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #8A05BE, #6D0B9E); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0; font-size: 24px;">🎯 NOVA APOSTA REGISTRADA</h1>
                <p style="margin: 5px 0 0 0; opacity: 0.9;">Sistema de Apostas - Confirmação</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border: 1px solid #e9ecef;">
                <h2 style="color: #8A05BE; margin-bottom: 15px;">📋 DADOS DO APOSTADOR</h2>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #dee2e6; font-weight: bold; width: 150px;">Nome:</td>
                        <td style="padding: 8px; border-bottom: 1px solid #dee2e6;">${dadosAposta.nome}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #dee2e6; font-weight: bold;">Email:</td>
                        <td style="padding: 8px; border-bottom: 1px solid #dee2e6;">${dadosAposta.email}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #dee2e6; font-weight: bold;">Telefone:</td>
                        <td style="padding: 8px; border-bottom: 1px solid #dee2e6;">${dadosAposta.telefone}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #dee2e6; font-weight: bold;">Data/Hora:</td>
                        <td style="padding: 8px; border-bottom: 1px solid #dee2e6;">${dadosAposta.data}</td>
                    </tr>
                </table>
            </div>
    `;

    // Adicione o resto do HTML do email aqui (o mesmo que estava antes)
    // ... [mantenha o resto do código do email igual] ...
    
    return html;
}

// ENVIAR EMAIL DE CONFIRMAÇÃO
// ENVIAR EMAIL DE CONFIRMAÇÃO - VERSÃO FUNCIONAL
// ENVIAR EMAIL DE CONFIRMAÇÃO - VERSÃO SUPER SIMPLES QUE FUNCIONA
// ENVIAR EMAIL PARA CADA APOSTA INDIVIDUAL
async function enviarEmailConfirmacao() {
    try {
        console.log('Iniciando envio de emails para cada aposta...');
        
        let emailsEnviados = 0;
        let totalApostas = 0;

        // Para apostas múltiplas - enviar 1 email com o total
        if (dadosAposta.tipo === 'multipla') {
            totalApostas = 1;
            const enviado = await enviarEmailMultipla();
            if (enviado) emailsEnviados++;
        } 
        // Para apostas individuais - enviar 1 email para CADA aposta
        else if (dadosAposta.tipo === 'individuais' && dadosAposta.apostasIndividuais) {
            totalApostas = dadosAposta.apostasIndividuais.length;
            
            // Enviar email para CADA aposta individual
            for (let i = 0; i < dadosAposta.apostasIndividuais.length; i++) {
                const apostaIndividual = dadosAposta.apostasIndividuais[i];
                const enviado = await enviarEmailApostaIndividual(apostaIndividual, i + 1);
                if (enviado) emailsEnviados++;
                
                // Pequeno delay entre emails para não sobrecarregar
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        console.log(`✅ ${emailsEnviados} de ${totalApostas} emails enviados com sucesso`);
        return emailsEnviados > 0;
        
    } catch (error) {
        console.error('❌ Erro ao enviar emails:', error);
        return false;
    }
}

// ENVIAR EMAIL PARA APOSTA INDIVIDUAL - VERSÃO SIMPLES E FUNCIONAL
async function enviarEmailApostaIndividual(apostaIndividual, numeroAposta) {
    try {
        const apostaId = `AP${Date.now()}-${numeroAposta}`;
        
        console.log(`Enviando email para aposta ${numeroAposta}:`, apostaIndividual);

        // Encontrar os dados do jogo correspondente
        const jogo = dadosAposta.apostas.find(a => a.jogo.id === apostaIndividual.jogo.id);
        if (!jogo) {
            console.error('Jogo não encontrado para a aposta:', apostaIndividual);
            return false;
        }

        // SOLUÇÃO: Organizar seleções por categoria com títulos
        const selecoesPorCategoria = {};
        
        jogo.selecoes.forEach(selecao => {
            if (!selecoesPorCategoria[selecao.categoria]) {
                selecoesPorCategoria[selecao.categoria] = [];
            }
            selecoesPorCategoria[selecao.categoria].push(selecao);
        });

        // Criar texto formatado com categorias
        let selecoesTexto = '';
        
        // Aposta Principal primeiro
        if (selecoesPorCategoria['principal']) {
            selecoesTexto += `🎯 APOSTA PRINCIPAL:\n`;
            selecoesPorCategoria['principal'].forEach(selecao => {
                selecoesTexto += `• ${selecao.nome} (Odd: ${selecao.valor})\n`;
            });
            selecoesTexto += `\n`;
        }

        // Gols
        if (selecoesPorCategoria['gols']) {
            selecoesTexto += `⚽ TOTAL DE GOLS:\n`;
            selecoesPorCategoria['gols'].forEach(selecao => {
                selecoesTexto += `• ${selecao.tipo} (Odd: ${selecao.valor})\n`;
            });
            selecoesTexto += `\n`;
        }

        // Escanteios
        if (selecoesPorCategoria['escanteios']) {
            selecoesTexto += `📐 TOTAL DE ESCANTEIOS:\n`;
            selecoesPorCategoria['escanteios'].forEach(selecao => {
                selecoesTexto += `• ${selecao.tipo} (Odd: ${selecao.valor})\n`;
            });
            selecoesTexto += `\n`;
        }

        // Tempo de Gols
        if (selecoesPorCategoria['tempo_gols']) {
            selecoesTexto += `⏰ TEMPO COM MAIS GOLS:\n`;
            selecoesPorCategoria['tempo_gols'].forEach(selecao => {
                selecoesTexto += `• ${selecao.tipo} (Odd: ${selecao.valor})\n`;
            });
            selecoesTexto += `\n`;
        }

        // Calcular retorno percentual
        const retornoPercentual = ((apostaIndividual.ganhoPotencial / apostaIndividual.valorApostado - 1) * 100).toFixed(1);

        const templateParams = {
            to_email: 'juliazaqueli08@gmail.com',
            from_name: 'Sistema de Apostas',
            reply_to: 'juliazaqueli08@gmail.com',
            subject: `🎯 APOSTA ${numeroAposta} - ${dadosAposta.nome} - ${apostaId}`,
            
            // Dados básicos
            nome: dadosAposta.nome || 'Não informado',
            email: dadosAposta.email || 'Não informado',
            telefone: dadosAposta.telefone || 'Não informado',
            data: dadosAposta.data || new Date().toLocaleString('pt-BR'),
            aposta_id: apostaId,
            
            // Dados da aposta específica - FORMATO ORGANIZADO
            jogo: `${jogo.jogo.timeCasa} vs ${jogo.jogo.timeFora}`,
            jogo_data: jogo.jogo.data || 'Data não informada',
            quantidade_selecoes: jogo.selecoes.length.toString(),
            selecoes: selecoesTexto,
            odd_combinada: jogo.valor.toFixed(2),
            valor_apostado: apostaIndividual.valorApostado.toFixed(2),
            ganho_potencial: apostaIndividual.ganhoPotencial,
            retorno_percentual: retornoPercentual
        };

        console.log(`Enviando email ${numeroAposta} com params:`, templateParams);

        const response = await emailjs.send(
            'service_cnsqjyf',
            'template_k093fum', 
            templateParams
        );
        
        console.log(`✅ Email ${numeroAposta} enviado com sucesso!`);
        return true;
        
    } catch (error) {
        console.error(`❌ Erro ao enviar email ${numeroAposta}:`, error);
        return false;
    }
}

async function enviarEmailMultipla() {
    try {
        const apostaId = `AP${Date.now()}-MULT`;
        
        console.log('Enviando email para aposta múltipla:', dadosAposta);

        // Preparar texto organizado por categorias para cada jogo
        let selecoesTexto = '';
        
        dadosAposta.apostas.forEach((aposta, index) => {
            // Organizar seleções por categoria
            const selecoesPorCategoria = {};
            
            aposta.selecoes.forEach(selecao => {
                if (!selecoesPorCategoria[selecao.categoria]) {
                    selecoesPorCategoria[selecao.categoria] = [];
                }
                selecoesPorCategoria[selecao.categoria].push(selecao);
            });

            selecoesTexto += `🎮 JOGO ${index + 1}: ${aposta.jogo.timeCasa} vs ${aposta.jogo.timeFora}\n`;
            selecoesTexto += `📅 Data: ${aposta.jogo.data || 'Não informada'}\n\n`;

            // Aposta Principal
            if (selecoesPorCategoria['principal']) {
                selecoesTexto += `🎯 APOSTA PRINCIPAL:\n`;
                selecoesPorCategoria['principal'].forEach(selecao => {
                    selecoesTexto += `• ${selecao.nome} (Odd: ${selecao.valor})\n`;
                });
                selecoesTexto += `\n`;
            }

            // Gols
            if (selecoesPorCategoria['gols']) {
                selecoesTexto += `⚽ TOTAL DE GOLS:\n`;
                selecoesPorCategoria['gols'].forEach(selecao => {
                    selecoesTexto += `• ${selecao.tipo} (Odd: ${selecao.valor})\n`;
                });
                selecoesTexto += `\n`;
            }

            // Escanteios
            if (selecoesPorCategoria['escanteios']) {
                selecoesTexto += `📐 TOTAL DE ESCANTEIOS:\n`;
                selecoesPorCategoria['escanteios'].forEach(selecao => {
                    selecoesTexto += `• ${selecao.tipo} (Odd: ${selecao.valor})\n`;
                });
                selecoesTexto += `\n`;
            }

            // Tempo de Gols
            if (selecoesPorCategoria['tempo_gols']) {
                selecoesTexto += `⏰ TEMPO COM MAIS GOLS:\n`;
                selecoesPorCategoria['tempo_gols'].forEach(selecao => {
                    selecoesTexto += `• ${selecao.tipo} (Odd: ${selecao.valor})\n`;
                });
                selecoesTexto += `\n`;
            }

            selecoesTexto += `📊 ODD DO JOGO: ${aposta.valor.toFixed(2)}\n`;
            selecoesTexto += `────────────────────────────\n\n`;
        });

        const templateParams = {
            to_email: 'juliazaqueli08@gmail.com',
            from_name: 'Sistema de Apostas',
            reply_to: 'juliazaqueli08@gmail.com',
            subject: `🎯 APOSTA MÚLTIPLA - ${dadosAposta.nome} - ${apostaId}`,
            
            // Dados básicos
            nome: dadosAposta.nome || 'Não informado',
            email: dadosAposta.email || 'Não informado',
            telefone: dadosAposta.telefone || 'Não informado',
            data: dadosAposta.data || new Date().toLocaleString('pt-BR'),
            aposta_id: apostaId,
            
            // Dados da aposta múltipla - FORMATO ORGANIZADO
            jogo: `APOSTA MÚLTIPLA - ${dadosAposta.apostas.length} JOGOS`,
            jogo_data: 'Todos os jogos listados abaixo',
            quantidade_selecoes: dadosAposta.apostas.reduce((total, aposta) => total + aposta.selecoes.length, 0).toString(),
            selecoes: selecoesTexto,
            odd_combinada: dadosAposta.oddTotal,
            valor_apostado: dadosAposta.valorMultipla.toFixed(2),
            ganho_potencial: dadosAposta.ganhoPotencialMultipla,
            retorno_percentual: ((dadosAposta.ganhoPotencialMultipla / dadosAposta.valorMultipla - 1) * 100).toFixed(1)
        };

        console.log('Enviando email múltipla com params:', templateParams);

        const response = await emailjs.send(
            'service_cnsqjyf',
            'template_k093fum',
            templateParams
        );
        
        console.log('✅ Email múltipla enviado com sucesso!');
        return true;
        
    } catch (error) {
        console.error('❌ Erro ao enviar email múltipla:', error);
        return false;
    }
}
