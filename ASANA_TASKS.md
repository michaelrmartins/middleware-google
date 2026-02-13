# Middleware Google - Google Workspace Admin API

## 1. Configuração Inicial do Projeto
- Inicializar projeto Node.js com Express 5.1
- Criar estrutura de diretórios (src/api/v1/controllers, routes, services, models, config, middleware, utils)
- Configurar .gitignore para excluir credenciais, .env e node_modules
- Criar arquivo .env.example com variáveis de ambiente documentadas
- Criar Dockerfile com Node.js 24 Alpine
- Criar docker-compose.yml base

## 2. Integração com Google Admin SDK
- Configurar autenticação via Service Account com delegação de domínio
- Implementar Google Admin Service (googleAdminService.js) com escopos OAuth2
- Configurar escopos: Admin Directory, Drive, Reports
- Implementar cliente com timeout de 30s e retry automático
- Criar arquivo de teste de autenticação (googleTestService.js)

## 3. Endpoints de Gerenciamento de Usuários
- Implementar POST /api/v1/users/email-list — Listar todos os usuários do domínio
- Implementar POST /api/v1/users/email-create — Criar novo usuário no Google Workspace
- Implementar POST /api/v1/users/email-disable — Suspender conta de usuário
- Implementar POST /api/v1/users/email-enable — Reativar conta suspensa
- Implementar POST /api/v1/users/email-infos — Consultar informações do usuário
- Implementar POST /api/v1/users/email-password-reset — Redefinir senha do usuário
- Implementar POST /api/v1/users/drive-infos — Consultar quota do Google Drive

## 4. Utilitário de Geração de Senhas
- Criar gerador de senhas seguras (passwordGenerator.js)
- Implementar regras de complexidade (maiúsculas, minúsculas, números, especiais)
- Excluir caracteres ambíguos (0, O, 1, l, I)
- Implementar embaralhamento Fisher-Yates
- Garantir mínimo de 8 caracteres (padrão 12)

## 5. Banco de Dados PostgreSQL
- Adicionar serviço PostgreSQL 15 Alpine ao docker-compose
- Criar script init.sql com tabela request_logs e índices
- Configurar extensão uuid-ossp
- Implementar pool de conexões (config/database.js)
- Criar volume persistente para dados (postgres_data)
- Criar índices de performance (tenant_id, created_at, status_code)

## 6. Middleware de Auditoria e Logging
- Implementar middleware auditLogger.js para interceptar requisições/respostas
- Implementar sanitização de dados sensíveis (tokens, senhas, API keys)
- Limitar payload a 10KB com truncamento e preview
- Implementar proteção contra recursão (profundidade máxima 10)
- Rastrear duração das requisições em milissegundos
- Capturar IP do cliente com suporte a X-Forwarded-For
- Configurar rotas ignoradas (health check, métricas, favicon)

## 7. Endpoints de Logs e Monitoramento
- Implementar GET /api/v1/health — Health check do banco de dados
- Implementar GET /api/v1/logs — Buscar todos os logs
- Implementar GET /api/v1/logs/tenant — Listar todos os tenants
- Implementar GET /api/v1/logs/tenant/:tenantId — Filtrar logs por tenant
- Implementar GET /api/v1/logs/status/:statusCode — Filtrar logs por código HTTP
- Implementar GET /api/v1/logs/endpoint/:endpoint — Filtrar logs por endpoint
- Implementar GET /api/v1/logs/method/:httpMethod — Filtrar logs por método HTTP
- Implementar POST /api/v1/logs/daterange — Filtrar logs por intervalo de datas (DDMMYYYY)

## 8. Arquitetura Multi-Tenant
- Configurar tenant FMC (FMC EDU) com credenciais separadas
- Configurar tenant FBPN com credenciais separadas
- Criar containers separados por tenant no docker-compose
- Implementar segregação de dados por tenant_id no banco
- Configurar variáveis de ambiente por tenant (ADMIN_EMAIL, DOMAIN_EMAIL)

## 9. Nginx Reverse Proxy
- Configurar upstream para api_fmc (middleware-fmc:3000)
- Configurar upstream para api_fbpn (middleware-fbpn:3000)
- Configurar upstream para api_relatorios (web-interface:80)
- Implementar roteamento por domínio (fmc.api-google.intranet, fbpn.api-google.intranet, relatorios.api-google.intranet)
- Configurar autenticação HTTP Basic (.htpasswd)
- Configurar headers de proxy (X-Real-IP, X-Forwarded-For)
- Configurar suporte a CORS com preflight requests
- Configurar rede Docker bridge (intranet-network)

## 10. Interface Web — Dashboard de Monitoramento
- Criar página inicial (index.html) com indicador de status do sistema
- Implementar design moderno com tema escuro e gradientes
- Criar página de relatórios (report.html) com tabela de logs
- Implementar filtros avançados: por tenant, status HTTP, método HTTP, intervalo de datas
- Implementar cards de estatísticas: total de requisições, sucessos, erros, duração média
- Implementar badges coloridos para métodos HTTP e status codes
- Implementar indicadores de performance por duração (verde <500ms, amarelo <2s, vermelho >2s)
- Criar modal de detalhes com syntax highlighting para JSON
- Implementar detecção automática de host API com fallback
- Configurar autenticação Basic Auth para chamadas à API
- Adicionar favicon personalizado
- Implementar layout responsivo (mobile e desktop)

## 11. Configuração de CORS
- Implementar middleware CORS no Express (app.js)
- Configurar headers CORS adicionais no Nginx para preflight requests
- Permitir acesso da interface web aos endpoints da API

## 12. Documentação
- Criar README.md com visão geral da arquitetura
- Documentar todos os endpoints da API com exemplos curl
- Documentar configuração do Google Service Account
- Documentar escopos OAuth2 necessários
- Documentar processo de deploy com Docker Compose
- Criar diagrama de fluxo da arquitetura (docs/img/flow-1.png)

## 13. Refatoração e Melhorias de Código
- Refatorar estrutura de código para melhor legibilidade e manutenibilidade
- Melhorar mensagens de erro com contexto específico do Google API
- Remover logs de debug de dados sensíveis (segurança)
- Atualizar permissões de arquivos do projeto
- Limpar comentários e organizar configurações do Nginx
