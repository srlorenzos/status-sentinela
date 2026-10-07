# status-sentinela

Monitor de disponibilidade **gratuito**, sem servidor: o GitHub Actions testa os sites de hora em hora e o GitHub Pages publica a página de status.

**Página de status:** https://srlorenzos.github.io/status-sentinela/

- Tempo de resposta, código HTTP e alerta de lentidão (acima de 2,5 s) para cada site.
- Disponibilidade (uptime) dos últimos 7 dias e gráfico das últimas 60 checagens.
- Zero dependências: Node 22 (`fetch` nativo) e uma página HTML estática.

## Monitorar os seus sites

1. Faça um fork.
2. Edite [`sites.json`](sites.json):
   ```json
   [{ "nome": "Meu site", "url": "https://exemplo.com.br/" }]
   ```
3. Em **Settings → Pages**, publique a pasta `/docs` do ramo `main`.
4. Em **Actions**, ative os workflows e rode **checagem** uma vez para gerar os primeiros dados.

Para testar localmente: `node check.mjs`.

O GitHub pausa workflows agendados em repositórios sem atividade por 60 dias; se isso acontecer, é só reativar em **Actions**.

## Licença

MIT © Eduardo Lorenzo
