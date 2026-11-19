# SenseWay RJ

Tecnologia assistiva e colaboração cidadã para enfrentar barreiras de acessibilidade nas calçadas de Madureira, Rio de Janeiro.

FIAP · Global Solution 2026.2 · Desafio CitizenTech · Engenharia de Software, 1º ano · Turma 1ESSRQ-2026

## Ficha da CitizenTech

| Campo | Resposta |
| --- | --- |
| **Nome da CitizenTech** | SenseWay RJ |
| **Cidade e bairro** | Rio de Janeiro, Madureira (entorno da Estação Madureira, do Mercadão e da Av. Ministro Edgard Romero) |
| **Cidadão beneficiado** | Pessoas com deficiência visual que se deslocam entre transporte, comércio e serviços |
| **Problema, em uma frase** | Barreiras nas calçadas, como piso tátil interrompido, buracos e obstáculos fixos, nem sempre são percebidas a tempo por quem não enxerga. |
| **Como funciona** | Uma pulseira com sensor ultrassônico avisa, por som e luz (vibração no produto físico), quando há um objeto à frente. Um site permite simular a pulseira e registrar barreiras de forma comunitária. |
| **O que cada parte faz** | **Edge:** circuito no Wokwi que mede, decide e alerta sem internet. **Python:** classifica uma lista de leituras e calcula estatísticas. **Front-end:** landing page em HTML e CSS. **Web:** JavaScript do simulador, do registro comunitário e do tema claro/escuro. |
| **Link do repositório** | https://github.com/felipeoc12/senseway-rj |
| **Indicador de impacto** | % de leituras simuladas classificadas corretamente; % de leituras inválidas sinalizadas como FALHA; número de barreiras demonstrativas registradas e consultadas |
| **ODS conectados** | ODS 10 (Redução das Desigualdades) e ODS 11 (Cidades e Comunidades Sustentáveis) |

### Regra única de classificação (igual no Wokwi, no Python e no site)

| Estado | Distância | Resposta |
| --- | --- | --- |
| LIVRE | maior que 120 cm | LED verde, sem som |
| ATENÇÃO | de 51 a 120 cm | LED amarelo e bip espaçado |
| PRÓXIMO | de 2 a 50 cm | LED vermelho e bip rápido |
| FALHA | menor que 2 cm, maior que 400 cm ou sem leitura | alerta próprio; **nunca** é tratado como "livre" |

Os limites são de demonstração, não de segurança. A pulseira não substitui a bengala, não detecta buracos e desníveis e não é um equipamento certificado.

## Estrutura do repositório

```
senseway-rj/
├── README.md          ← este arquivo
├── AI.md              ← como usamos inteligência artificial
├── Integrantes.md
└── web/               ← Front-end Design + Web Development (o mesmo site)
    ├── index.html
    ├── integrantes.txt
    ├── css/style.css
    ├── js/script.js
    └── imagens/       ← logo e ilustrações (SVG feitos pela equipe)
```

## Como abrir o site

1. Baixe ou clone o repositório.
2. Abra o arquivo `web/index.html` no navegador (dois cliques).

Não precisa instalar nada nem rodar servidor. A fonte Atkinson Hyperlegible vem do Google Fonts; sem internet, o site usa uma fonte do sistema.

## Interações em JavaScript (Web Development)

Todo o código está em `web/js/script.js`, comentado e dividido em quatro partes. Os conceitos usados são os vistos em aula: funções, manipulação do DOM, eventos, operadores e condicionais.

| # | Interação | Como verificar | Funções principais |
| --- | --- | --- | --- |
| 1 | **Modo claro/escuro** | Clique em "Modo escuro" no topo. Todas as cores mudam. Recarregue a página: a escolha continua. | `aplicarTema()`, `alternarTema()`, `carregarTemaInicial()` |
| 2 | **Simulador da pulseira** | Na seção Simulador, arraste o controle, digite um valor ou use os atalhos. O estado, a cor, a mensagem e a régua mudam na hora. Teste 1, 2, 50, 51, 120, 121, 400, 401 e um texto: os limites são os mesmos do Python e do Wokwi. | `classificarDistancia()`, `lerNumero()`, `atualizarSimulador()` |
| 3 | **Registro comunitário** | Na seção Comunidade, clique em "Registrar barreira" com os campos vazios: aparecem mensagens de erro. Preencha tudo e envie: o relato aparece no topo da lista com o selo "não verificado". | `validarFormulario()`, `marcarErro()`, `criarItemRegistro()`, `mostrarRegistros()` |
| 4 | **Filtro por tipo** | Escolha um tipo em "Filtrar por tipo": a lista mostra só aquela categoria e a contagem é atualizada. | `mostrarRegistros()` |
| 5 | **Menu no celular** | Em tela estreita (ou com o navegador redimensionado), o botão de menu abre e fecha a navegação. | `alternarMenu()`, `fecharMenu()` |

### Decisões importantes no código

- **A mesma regra em todo lugar:** `classificarDistancia()` usa as constantes `DIST_MIN_VALIDA`, `DIST_MAX_VALIDA`, `LIMITE_PROXIMO` e `LIMITE_ATENCAO`, com os mesmos valores do `sketch.ino`.
- **Falha nunca vira "livre":** um valor fora de 2–400 cm, vazio ou que não é número cai em FALHA.
- **Sem injeção de HTML:** o texto digitado no formulário é inserido com `textContent`, nunca com `innerHTML`.
- **Privacidade:** o formulário não pede nome, CPF nem telefone. Os registros ficam só na memória da página e somem ao recarregar.
- **localStorage:** guarda apenas a escolha de tema (`senseway-tema`), no próprio navegador. Nada é enviado para servidor.
- **Acessibilidade:** os estados aparecem em texto, não só em cor. Os campos têm rótulos. Mensagens de erro e o painel do simulador são anunciados por leitores de tela (`aria-live`). Há um link "Pular para o conteúdo" e foco visível no teclado.

## Front-end Design

- HTML e CSS em arquivos separados (`index.html` e `css/style.css`).
- Menu de navegação com âncoras para as cinco seções: Início, O problema, Como funciona, Simulador e Comunidade.
- Rodapé padronizado com navegação, equipe e fontes.
- Imagens e ícones na pasta `imagens/` (SVG criados pela equipe) e ícones SVG no próprio HTML.
- Layout responsivo (desktop, tablet e celular), contraste adequado e fonte Atkinson Hyperlegible, criada para leitores com baixa visão.

## Edge Computing

O circuito da pulseira (Arduino Uno, sensor HC-SR04, LEDs, buzzer e botão de teste de falha) foi entregue separadamente, como simulação no Wokwi.

- Simulação no Wokwi: https://wokwi.com/projects/481117937897935873

## Fontes dos dados citados

- Câmara Municipal do Rio: audiência pública sobre calçadas, 04/09/2025 (29.490 reclamações no Portal 1746, jul/2023 a jul/2025, município inteiro).
- PROCON-RJ / SEDCON: fiscalização da Estação Madureira, 13/05/2026.
- AGETRANSP: fiscalização na Estação Madureira, 11/06/2024.
- Mobilize Brasil: Madureira entre os bairros com reclamações de calçadas em 2025.

Os registros comunitários do site são **simulados e não verificados**. Não representam denúncias reais nem um mapa real de obstáculos.

## Equipe

Veja [Integrantes.md](Integrantes.md).
