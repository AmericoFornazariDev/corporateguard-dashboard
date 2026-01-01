# CorporateGuard Dashboard

CorporateGuard Dashboard

O CorporateGuard Dashboard é um painel de controlo desenvolvido para a gestão, monitorização e governação de empresas no ecossistema CorporateGuard. O sistema foi pensado desde a base com foco em segurança, controlo rigoroso de acessos, conformidade operacional e clareza na visualização do estado das organizações, utilizadores e processos críticos.

A aplicação utiliza uma stack moderna baseada em React e TypeScript, com Vite como ferramenta de build, garantindo rapidez no desenvolvimento, boa performance e uma base sólida para crescimento futuro. A arquitetura do projeto é modular e orientada a componentes, permitindo manutenção simples, escalabilidade e separação clara de responsabilidades.

O dashboard é composto por diferentes áreas funcionais, incluindo painéis administrativos e operacionais, fluxos de autenticação, estados pendentes e aceitação de termos. Esta separação garante que regras de governação, permissões e estados de validação sejam respeitadas em todo o ciclo de vida das empresas e utilizadores dentro da plataforma.

A estrutura atual do projeto está organizada da seguinte forma:

A pasta components contém todos os componentes principais da interface, incluindo o painel administrativo (AdminDashboard.tsx), o painel operacional (OperationalDashboard.tsx), o dashboard principal (Dashboard.tsx), os ecrãs de autenticação (AuthScreen.tsx), estados pendentes (PendingScreen.tsx) e o modal de aceitação de termos (TermsModal.tsx). Estes componentes representam o núcleo visual e funcional da aplicação.

A pasta services contém serviços de apoio, como o mockBackend.ts, utilizado para simulação de dados ou lógica temporária durante o desenvolvimento, preparando o projeto para integração futura com um backend real.

A pasta server contém a base do backend local, incluindo o ficheiro index.js, responsável por servir ou apoiar o funcionamento da aplicação em contexto de desenvolvimento ou testes.

Na raiz do projeto encontram-se os ficheiros principais da aplicação, como App.tsx, que atua como orquestrador central da navegação e estados globais, index.tsx como ponto de entrada da aplicação React, index.html como base do documento HTML, types.ts para definição de tipos globais em TypeScript, vite.config.ts para configuração do Vite, package.json para gestão de dependências e scripts, e este ficheiro README.md para documentação do projeto.

Para executar o projeto localmente, é necessário ter o Node.js instalado, sendo recomendada a versão LTS. Após clonar o repositório, as dependências devem ser instaladas com o comando npm install. A aplicação pode ser iniciada em modo de desenvolvimento com npm run dev, ficando disponível por defeito em http://localhost:5173, com hot reload ativo para facilitar o desenvolvimento.

Este projeto encontra-se em desenvolvimento ativo e destina-se a uso privado no âmbito do sistema CorporateGuard. A lógica crítica relacionada com governação, revogação de acesso, conformidade e permissões é considerada núcleo do sistema e não deve ser alterada sem validação prévia. A estrutura atual serve como base sólida para evolução futura, integrações avançadas e ambiente produtivo.

---

## Tecnologias

- React
- TypeScript
- Vite
- Node.js
- HTML / CSS
- Arquitetura modular por componentes

---

## Estrutura do Projeto

corporate/
├── components/
│ ├── AdminDashboard.tsx
│ ├── OperationalDashboard.tsx
│ ├── Dashboard.tsx
│ ├── AuthScreen.tsx
│ ├── PendingScreen.tsx
│ └── TermsModal.tsx
├── services/
│ └── mockBackend.ts
├── server/
│ └── index.js
├── App.tsx
├── index.tsx
├── index.html
├── types.ts
├── vite.config.ts
├── package.json
└── README.md