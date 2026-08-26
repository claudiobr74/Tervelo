# TERVELO — Validação com frequencímetro Bluetooth Low Energy real

A CI e o Playwright **não** substituem este checklist. Usar um cinto/braçadeira compatível com Heart Rate Service (ex.: Polar H10) em navegador Chromium com contexto seguro (HTTPS ou localhost).

## Ambiente

- [ ] HTTPS ou `http://localhost`
- [ ] Chromium/Edge/Chrome (não usar user-agent como critério)
- [ ] Bluetooth ligado no sistema
- [ ] `heart_rate_enabled` começa **desligado**

## Fluxo

1. Configurações → Treino e dispositivos → ativar Frequência cardíaca
2. [ ] Explicação curta visível; seletor Bluetooth **não** abre sozinho
3. [ ] Conectar frequencímetro → seletor do sistema → autorização
4. [ ] Confirmação: “Frequencímetro conectado”
5. [ ] Iniciar treino com o dispositivo já autorizado
6. [ ] BPM atualiza no indicador discreto (não compete com carga/reps)
7. [ ] Registrar série → RestTimer existente inicia (sem segundo timer)
8. [ ] Recuperação em 60 s calculada no código (não no LLM)
9. [ ] Trocar de exercício → buffer faz flush
10. [ ] Cortar internet → BLE continua; “Salvo neste dispositivo • aguardando sincronização” se houver fila
11. [ ] Voltar internet → sync idempotente (`client_mutation_id`)
12. [ ] Desconectar BLE → treino segue; ♥ Desconectado + Reconectar
13. [ ] Reconectar (gesto do usuário se o navegador exigir)
14. [ ] Finalizar treino → resumo “Resposta ao treino” + gráfico
15. [ ] Coach: `HEART_RATE_CONTEXT` só com a preferência ligada e dados suficientes
16. [ ] Desligar o toggle → some do treino; histórico antigo permanece; Coach não usa FC em recomendações novas

## Não validar nesta etapa

VFC, ECG, arritmia, saturação, Health Connect, Apple Health, zonas para musculação.
