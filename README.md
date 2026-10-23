# Simulador de Máquina de Turing

Projeto desenvolvido para a disciplina de **Teoria da Computação**, do curso de Ciência da Computação da Universidade Federal do Ceará (UFC), Campus de Russas.

O objetivo é simular o funcionamento de uma Máquina de Turing, permitindo informar uma palavra de entrada, definir estados e regras de transição e acompanhar a execução pela interface.

## Tecnologias utilizadas

- React
- TypeScript
- CSS Modules
- Vite

## Funcionalidades

- Escrever o programa-fonte da máquina.
- Carregar um programa escrito em arquivo.
- Visualizar a fita e a posição da cabeça de leitura e escrita.
- Executar a máquina passo a passo.
- Executar automaticamente com controle de velocidade.
- Reiniciar ou interromper a execução.
- Visualizar o estado atual, a quantidade de passos e a última transição.
- Identificar aceitação, rejeição e limite de execução.
- Verificar erros no formato do programa-fonte.

## Como executar o projeto

É necessário ter o [Node.js](https://nodejs.org/) instalado no computador.

1. Clone o repositório:

   ```bash
   git clone URL_DO_REPOSITORIO
   ```

2. Entre na pasta do projeto:

   ```bash
   cd NOME_DA_PASTA
   ```

3. Instale as dependências:

   ```bash
   npm install
   ```

4. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

5. Abra no navegador o endereço mostrado no terminal, normalmente `http://localhost:5173`.

## Formato do programa-fonte

O simulador utiliza um formato de texto simples para definir a máquina.

Exemplo:

```text
# Percorre a palavra e marca suas extremidades
fita 1011
init qi
accept qf
qi,1,qi,1,>
qi,0,qi,0,>
qi,_,q1,Y,<
q1,1,q1,1,<
q1,0,q1,0,<
q1,_,qf,X,>
```

### Comandos

| Comando | Descrição |
|---|---|
| `fita` | Define a palavra inicial da fita. |
| `init` | Define o estado inicial. |
| `accept` | Define o estado de aceitação. |

Cada regra de transição possui cinco campos separados por vírgulas:

```text
estado_atual,simbolo_lido,proximo_estado,simbolo_escrito,movimento
```

Por exemplo:

```text
qi,1,qi,1,>
```

Essa regra indica que, estando no estado `qi` e lendo `1`, a máquina escreve `1`, continua no estado `qi` e move a cabeça para a direita.

### Movimentos da cabeça

- `>` ou `R`: move para a direita.
- `<` ou `L`: move para a esquerda.
- `S` ou `N`: permanece na mesma posição.
- `_`: representa uma célula em branco na fita.

Linhas iniciadas por `#` ou `@` são ignoradas pelo interpretador.

## Organização do código

- `src/App.tsx`: interface e controles de execução.
- `src/App.module.css`: estilos da interface.
- `src/turingMachine.ts`: tipos, interpretação do programa e lógica da máquina.
- `src/data/examples.ts`: programa de exemplo utilizado inicialmente.

Os caminhos acima representam a organização esperada dos arquivos no projeto e podem ser ajustados caso estejam em outras pastas.

## Como funciona

O programa-fonte é interpretado e convertido em uma estrutura com a entrada, o estado inicial, os estados de aceitação e as regras de transição.

A máquina começa com a cabeça na primeira posição da fita. A cada passo, lê o símbolo atual, procura uma regra correspondente, escreve o novo símbolo, movimenta a cabeça e atualiza o estado.

A execução termina quando um estado de aceitação é alcançado, quando não existe uma transição aplicável ou quando o limite de passos é atingido.

## Limitações

Este é um simulador didático, desenvolvido para estudar os conceitos básicos de Máquinas de Turing. O formato de entrada é simplificado e pode não ser compatível com todos os simuladores disponíveis na internet.

O limite de passos ajuda a interromper execuções muito longas, mas não determina necessariamente se um programa entraria em loop.

## Referências

- [Turing Machine IO](https://turingmachine.io/)
- [Turing Machine Simulator](https://turingmachinesimulator.com/)
