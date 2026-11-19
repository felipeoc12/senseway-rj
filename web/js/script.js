/* =====================================================================
   SenseWay RJ · Interações em JavaScript
   FIAP Global Solution 2026.2 · Web Development
   Equipe: Samuel Dantas Silva de Medeiros (RM 576922)
           Felipe de Oliveira Corrêa (RM 574803)

   Interações desta página:
     1. Modo claro / escuro (com preferência salva no navegador)
     2. Menu que abre e fecha no celular
     3. Simulador de distância da pulseira (mesmas regras do Wokwi e do Python)
     4. Registro comunitário de barreiras (validação, lista e filtro)
   ===================================================================== */

// Avisa o CSS que o JavaScript carregou (usado no menu do celular)
document.documentElement.classList.add("js");


/* =====================================================================
   1. MODO CLARO / ESCURO
   ===================================================================== */

const botaoTema = document.getElementById("tema-botao");
const textoTema = document.getElementById("tema-texto");
const CHAVE_TEMA = "senseway-tema"; // nome usado no localStorage

function aplicarTema(tema) {
  // o CSS troca todas as cores a partir deste atributo
  document.documentElement.setAttribute("data-theme", tema);

  if (tema === "dark") {
    textoTema.textContent = "Modo claro";
    botaoTema.setAttribute("aria-pressed", "true");
  } else {
    textoTema.textContent = "Modo escuro";
    botaoTema.setAttribute("aria-pressed", "false");
  }
}

function alternarTema() {
  const temaAtual = document.documentElement.getAttribute("data-theme");
  const novoTema = temaAtual === "dark" ? "light" : "dark";

  aplicarTema(novoTema);

  // guarda a escolha só neste navegador (nenhum dado é enviado para servidor)
  try {
    localStorage.setItem(CHAVE_TEMA, novoTema);
  } catch (erro) {
    // se o navegador bloquear o armazenamento, o tema só não fica salvo
  }
}

function carregarTemaInicial() {
  let temaSalvo = null;
  try {
    temaSalvo = localStorage.getItem(CHAVE_TEMA);
  } catch (erro) {
    temaSalvo = null;
  }

  if (temaSalvo === "dark" || temaSalvo === "light") {
    aplicarTema(temaSalvo);
  } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    // sem escolha salva: segue a preferência do sistema operacional
    aplicarTema("dark");
  } else {
    aplicarTema("light");
  }
}

botaoTema.addEventListener("click", alternarTema);
carregarTemaInicial();


/* =====================================================================
   2. MENU DO CELULAR
   ===================================================================== */

const botaoMenu = document.getElementById("menu-botao");
const listaMenu = document.getElementById("menu-principal");

function alternarMenu() {
  const aberto = listaMenu.classList.toggle("aberto");
  botaoMenu.setAttribute("aria-expanded", String(aberto));
}

function fecharMenu() {
  listaMenu.classList.remove("aberto");
  botaoMenu.setAttribute("aria-expanded", "false");
}

botaoMenu.addEventListener("click", alternarMenu);

// ao escolher uma seção, o menu fecha sozinho
const linksMenu = listaMenu.querySelectorAll("a");
for (let i = 0; i < linksMenu.length; i++) {
  linksMenu[i].addEventListener("click", fecharMenu);
}


/* =====================================================================
   3. SIMULADOR DA PULSEIRA
   Regra única do projeto (igual ao sketch.ino e ao Python):
     LIVRE    d > 120 cm
     ATENÇÃO  50 < d <= 120 cm
     PRÓXIMO  2 <= d <= 50 cm
     FALHA    d < 2, d > 400 ou valor que não é número
   ===================================================================== */

const DIST_MIN_VALIDA = 2;
const DIST_MAX_VALIDA = 400;
const LIMITE_PROXIMO = 50;
const LIMITE_ATENCAO = 120;
const MAX_FAIXA = 450; // fim do controle deslizante

const faixaDistancia = document.getElementById("distancia-faixa");
const campoDistancia = document.getElementById("distancia-numero");
const painel = document.getElementById("painel");
const painelEstado = document.getElementById("painel-estado");
const painelDistancia = document.getElementById("painel-distancia");
const painelMensagem = document.getElementById("painel-mensagem");
const painelSom = document.getElementById("painel-som");
const marcadorRegua = document.getElementById("regua-marcador");
const botoesAtalho = document.querySelectorAll(".atalho");

// Recebe a distância (número ou NaN) e devolve o estado
function classificarDistancia(distancia) {
  if (isNaN(distancia) || distancia < DIST_MIN_VALIDA || distancia > DIST_MAX_VALIDA) {
    return "FALHA"; // nunca assumir que o caminho está livre
  } else if (distancia <= LIMITE_PROXIMO) {
    return "PROXIMO";
  } else if (distancia <= LIMITE_ATENCAO) {
    return "ATENCAO";
  } else {
    return "LIVRE";
  }
}

// Textos de cada estado: o significado nunca depende só da cor
const INFO_ESTADOS = {
  LIVRE: {
    titulo: "LIVRE",
    classe: "painel--livre",
    mensagem: "Sem objeto no alcance do sensor. Isso não garante que o caminho é seguro.",
    som: "Som: desligado"
  },
  ATENCAO: {
    titulo: "ATENÇÃO",
    classe: "painel--atencao",
    mensagem: "Há um objeto à frente. Diminua o passo.",
    som: "Som: bip espaçado (1000 Hz a cada 0,8 s)"
  },
  PROXIMO: {
    titulo: "PRÓXIMO",
    classe: "painel--proximo",
    mensagem: "Objeto muito próximo! Pare ou desvie.",
    som: "Som: bip rápido (2000 Hz a cada 0,2 s)"
  },
  FALHA: {
    titulo: "FALHA",
    classe: "painel--falha",
    mensagem: "Leitura inválida. Não confie no sensor agora e use a bengala.",
    som: "Som: bip duplo grave (400 Hz)"
  }
};

// Converte o texto digitado em número ("80,5" também vale)
function lerNumero(texto) {
  const textoLimpo = String(texto).trim().replace(",", ".");
  if (textoLimpo === "") {
    return NaN;
  }
  return Number(textoLimpo);
}

// Atualiza o painel, a régua e os controles com uma nova distância
function atualizarSimulador(distancia) {
  const estado = classificarDistancia(distancia);
  const info = INFO_ESTADOS[estado];

  // troca a classe de cor do painel
  painel.classList.remove("painel--livre", "painel--atencao", "painel--proximo", "painel--falha");
  painel.classList.add(info.classe);

  painelEstado.textContent = info.titulo;
  painelMensagem.textContent = info.mensagem;
  painelSom.textContent = info.som;

  if (isNaN(distancia)) {
    painelDistancia.textContent = "sem leitura";
  } else {
    painelDistancia.textContent = distancia + " cm";
  }

  // posiciona o marcador na régua (limitado entre 0 e o fim do controle)
  let posicao = isNaN(distancia) ? MAX_FAIXA : distancia;
  if (posicao < 0) {
    posicao = 0;
  } else if (posicao > MAX_FAIXA) {
    posicao = MAX_FAIXA;
  }
  marcadorRegua.style.left = (posicao / MAX_FAIXA) * 100 + "%";
}

// Controle deslizante -> atualiza o campo de texto e o painel
faixaDistancia.addEventListener("input", function () {
  const distancia = Number(faixaDistancia.value);
  campoDistancia.value = distancia;
  atualizarSimulador(distancia);
});

// Campo de texto -> atualiza o controle deslizante e o painel
campoDistancia.addEventListener("input", function () {
  const distancia = lerNumero(campoDistancia.value);
  if (!isNaN(distancia)) {
    faixaDistancia.value = distancia; // o navegador limita entre 0 e 450
  }
  atualizarSimulador(distancia);
});

// Botões de atalho (180, 80, 30 cm e "sem eco")
for (let i = 0; i < botoesAtalho.length; i++) {
  botoesAtalho[i].addEventListener("click", function () {
    const valor = botoesAtalho[i].getAttribute("data-distancia");

    if (valor === "sem-eco") {
      // sensor não devolveu medida: é a mesma situação do botão de teste no Wokwi
      campoDistancia.value = "";
      atualizarSimulador(NaN);
    } else {
      const distancia = Number(valor);
      faixaDistancia.value = distancia;
      campoDistancia.value = distancia;
      atualizarSimulador(distancia);
    }
  });
}

atualizarSimulador(Number(faixaDistancia.value));


/* =====================================================================
   4. REGISTRO COMUNITÁRIO DE BARREIRAS
   Os registros ficam só na memória da página (somem ao recarregar).
   Não pedimos nenhum dado pessoal.
   ===================================================================== */

const formulario = document.getElementById("formulario-barreira");
const campoTipo = document.getElementById("campo-tipo");
const campoLocal = document.getElementById("campo-local");
const campoDescricao = document.getElementById("campo-descricao");
const contadorDescricao = document.getElementById("contador-descricao");
const retornoFormulario = document.getElementById("retorno-formulario");
const filtroTipo = document.getElementById("filtro-tipo");
const listaRegistros = document.getElementById("lista-registros");
const contagemRegistros = document.getElementById("contagem-registros");

const TAMANHO_MINIMO_LOCAL = 5;
const TAMANHO_MINIMO_DESCRICAO = 10;
const TAMANHO_MAXIMO_DESCRICAO = 200;

// Registros de exemplo (os mesmos que aparecem no HTML)
const registros = [
  {
    tipo: "Piso tátil danificado",
    local: "Saída da Estação Madureira, lado da Av. Ministro Edgard Romero",
    descricao: "Piso tátil interrompido perto da escada de acesso."
  },
  {
    tipo: "Obstáculo fixo",
    local: "Calçada em frente ao Mercadão de Madureira",
    descricao: "Poste e banca ocupando quase toda a largura da calçada."
  },
  {
    tipo: "Obra ou interdição",
    local: "Rua Carolina Machado, próximo à passarela",
    descricao: "Tapume sem sinalização sonora bloqueando a passagem."
  }
];

// Cria o <li> de um registro. Usa textContent para o texto digitado
// nunca ser interpretado como HTML (evita injeção de código).
function criarItemRegistro(registro, ehNovo) {
  const item = document.createElement("li");
  item.className = ehNovo ? "registro registro--novo" : "registro";

  const tipo = document.createElement("p");
  tipo.className = "registro__tipo";
  tipo.textContent = registro.tipo;

  const local = document.createElement("p");
  local.className = "registro__local";
  local.textContent = registro.local;

  const descricao = document.createElement("p");
  descricao.className = "registro__descricao";
  descricao.textContent = registro.descricao;

  const selo = document.createElement("p");
  selo.className = "registro__selo";
  selo.textContent = "Relato simulado · não verificado";

  item.appendChild(tipo);
  item.appendChild(local);
  item.appendChild(descricao);
  item.appendChild(selo);
  return item;
}

// Desenha a lista respeitando o filtro escolhido
function mostrarRegistros(destacarPrimeiro) {
  const tipoEscolhido = filtroTipo.value;
  listaRegistros.innerHTML = "";

  let quantidade = 0;
  for (let i = 0; i < registros.length; i++) {
    if (tipoEscolhido === "todos" || registros[i].tipo === tipoEscolhido) {
      const ehNovo = destacarPrimeiro === true && i === 0;
      listaRegistros.appendChild(criarItemRegistro(registros[i], ehNovo));
      quantidade++;
    }
  }

  if (quantidade === 0) {
    const vazio = document.createElement("li");
    vazio.className = "registros__vazio";
    vazio.textContent = "Nenhuma barreira deste tipo foi registrada.";
    listaRegistros.appendChild(vazio);
  }

  // texto da contagem (singular ou plural)
  const palavra = quantidade === 1 ? "registro" : "registros";
  if (tipoEscolhido === "todos") {
    contagemRegistros.textContent = quantidade + " " + palavra + " no total.";
  } else {
    contagemRegistros.textContent = quantidade + " " + palavra + " do tipo \"" + tipoEscolhido + "\".";
  }
}

// Mostra ou limpa a mensagem de erro de um campo
function marcarErro(campo, idErro, mensagem) {
  const elementoErro = document.getElementById(idErro);
  elementoErro.textContent = mensagem;

  if (mensagem === "") {
    campo.classList.remove("campo--invalido");
    campo.removeAttribute("aria-invalid");
  } else {
    campo.classList.add("campo--invalido");
    campo.setAttribute("aria-invalid", "true");
  }
}

// Confere os três campos. Devolve true se estiver tudo certo.
function validarFormulario() {
  const tipo = campoTipo.value;
  const local = campoLocal.value.trim();
  const descricao = campoDescricao.value.trim();
  let valido = true;
  let primeiroInvalido = null;

  if (tipo === "") {
    marcarErro(campoTipo, "erro-tipo", "Escolha o tipo de barreira.");
    valido = false;
    primeiroInvalido = primeiroInvalido || campoTipo;
  } else {
    marcarErro(campoTipo, "erro-tipo", "");
  }

  if (local === "") {
    marcarErro(campoLocal, "erro-local", "Informe uma referência do local.");
    valido = false;
    primeiroInvalido = primeiroInvalido || campoLocal;
  } else if (local.length < TAMANHO_MINIMO_LOCAL) {
    marcarErro(campoLocal, "erro-local", "A referência precisa ter pelo menos " + TAMANHO_MINIMO_LOCAL + " caracteres.");
    valido = false;
    primeiroInvalido = primeiroInvalido || campoLocal;
  } else {
    marcarErro(campoLocal, "erro-local", "");
  }

  if (descricao === "") {
    marcarErro(campoDescricao, "erro-descricao", "Descreva o obstáculo.");
    valido = false;
    primeiroInvalido = primeiroInvalido || campoDescricao;
  } else if (descricao.length < TAMANHO_MINIMO_DESCRICAO) {
    marcarErro(campoDescricao, "erro-descricao", "A descrição precisa ter pelo menos " + TAMANHO_MINIMO_DESCRICAO + " caracteres.");
    valido = false;
    primeiroInvalido = primeiroInvalido || campoDescricao;
  } else {
    marcarErro(campoDescricao, "erro-descricao", "");
  }

  // leva o foco para o primeiro campo com problema
  if (primeiroInvalido !== null) {
    primeiroInvalido.focus();
  }
  return valido;
}

function atualizarContador() {
  const tamanho = campoDescricao.value.length;
  contadorDescricao.textContent = tamanho + " de " + TAMANHO_MAXIMO_DESCRICAO + " caracteres";
}

formulario.addEventListener("submit", function (evento) {
  evento.preventDefault(); // impede a página de recarregar
  retornoFormulario.textContent = "";

  if (!validarFormulario()) {
    return;
  }

  const novoRegistro = {
    tipo: campoTipo.value,
    local: campoLocal.value.trim(),
    descricao: campoDescricao.value.trim()
  };

  registros.unshift(novoRegistro); // o mais recente aparece primeiro

  // mostra o novo item mesmo que outro filtro estivesse escolhido
  filtroTipo.value = "todos";
  mostrarRegistros(true);

  formulario.reset();
  atualizarContador();
  retornoFormulario.textContent = "Barreira registrada! Ela aparece no topo da lista como relato não verificado.";
});

// limpa o erro assim que a pessoa corrige o campo
campoTipo.addEventListener("change", function () {
  if (campoTipo.value !== "") {
    marcarErro(campoTipo, "erro-tipo", "");
  }
});

campoLocal.addEventListener("input", function () {
  if (campoLocal.value.trim().length >= TAMANHO_MINIMO_LOCAL) {
    marcarErro(campoLocal, "erro-local", "");
  }
});

campoDescricao.addEventListener("input", function () {
  atualizarContador();
  if (campoDescricao.value.trim().length >= TAMANHO_MINIMO_DESCRICAO) {
    marcarErro(campoDescricao, "erro-descricao", "");
  }
});

filtroTipo.addEventListener("change", function () {
  mostrarRegistros(false);
});

mostrarRegistros(false);
