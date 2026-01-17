# Todo da Massa 🚀

Um gerenciador de tarefas estilo Kanban turbinado com Pomodoro, musica de fundo e estatísticas de produtividade.

**Link do Projeto**: [Acesse aqui](https://Cr-collab.github.io/todo-da-massa/)

## ✨ Funcionalidades

### 📋 Kanban Board
-   **Organização Visual**: Divida suas tarefas em colunas (ex: A Fazer, Em Progresso, Concluído).
-   **Drag & Drop**: Arraste tarefas entre as colunas facilmente.
-   **WIP Limit Real**: O sistema avisa se você tentar focar em mais de uma coisa ao mesmo tempo.
-   **Tarefas Automáticas**: configure templates de tarefas que se repetem automaticamente (ex: "Reunião Semanal" toda segunda).

### 🍅 Pomodoro Integrado
-   **Timer de Foco**: Inicie um timer de 25min (ou personalizado) direto da tarefa.
-   **Música de Fundo 🎵**: Cole qualquer link do YouTube (inclusive lives lofi) e o player toca em **loop infinito** enquanto você foca.
    -   *Truque*: Cole links normais do YouTube, o sistema converte automaticamente para o formato "embed" correto!
-   **Registro Automático**: Ao terminar um ciclo, a tarefa é movida para "Concluído" (se configurado) e o tempo é registrado.

### 📊 Estatísticas (Heatmap)
-   **Contribuições**: Visualize so sua produtividade em um gráfico estilo GitHub (heatmap).
-   **Histórico**: Veja quantas tarefas e pomodoros você completou em cada dia do ano.

## 🛠️ Tecnologias

-   **Frontend**: React, Vite, TypeScript
-   **Design**: Material UI (MUI) com tema escuro (Dark Mode)
-   **Banco de Dados**: Firebase Firestore (Realtime)
-   **Drag & Drop**: @hello-pangea/dnd

## 🚀 Como Rodar Localmente

1.  Clone o repositório:
    ```bash
    git clone https://github.com/Cr-collab/todo-da-massa.git
    cd todo-da-massa
    ```

2.  Instale as dependências:
    ```bash
    npm install
    ```

3.  Configure o Firebase:
    -   Crie um projeto no [Firebase Console](https://console.firebase.google.com/).
    -   Crie um arquivo `.env` na raiz com suas chaves:
        ```
        VITE_API_KEY=sua-api-key
        VITE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
        VITE_PROJECT_ID=seu-projeto-id
        VITE_STORAGE_BUCKET=seu-projeto.appspot.com
        VITE_MESSAGING_SENDER_ID=seu-id
        VITE_APP_ID=seu-app-id
        ```

4.  Rode o servidor de desenvolvimento:
    ```bash
    npm run dev
    ```

## 📦 Como Atualizar o Site

Para publicar novas versões no GitHub Pages:

```bash
npm run deploy
```

Isso irá criar o build otimizado e enviá-lo para a branch `gh-pages` automaticamente.
