# Perfilador - Grupo Vázquez

Bienvenido al repositorio del Perfilador del Grupo Vázquez. Este proyecto implementa un sistema de evaluación por competencias que inicia como un motor determinístico y evolucionará hacia un agente conversacional inteligente.

## 🏗 Arquitectura y Principios

Este proyecto se ha diseñado siguiendo los **Principios SOLID** y **Clean Architecture**, asegurando que el código sea:
- **S**ingle Responsibility: Cada módulo hace una sola cosa.
- **O**pen/Closed: Abierto a la extensión (ej. nuevas reglas de scoring), cerrado a la modificación.
- **L**iskov Substitution: Interfaces claras para intercambiar implementaciones (ej. el bus de eventos).
- **I**nterface Segregation: Contratos pequeños y específicos.
- **D**ependency Inversion: El dominio no depende de la infraestructura.

## 📂 Taxonomía del Proyecto

La estructura del repositorio está diseñada para separar claramente las responsabilidades:

```text
perfilador-vazquez/
├── docs/           # Documentación técnica, diagramas, manuales y bitácoras de decisiones.
├── frontend/       # (Futuro) Interfaz de usuario y experiencia visual.
├── backend/        # Motor de scoring, APIs y emisión de eventos.
│   └── src/
│       ├── domain/         # Entidades centrales y contratos (independiente de frameworks).
│       ├── application/    # Casos de uso (orquestación del scoring).
│       └── infrastructure/ # Implementaciones técnicas (bus de eventos, logs).
└── agent/          # (Futuro) Lógica del agente conversacional LLM.
```

## 🚀 Fase Actual: MVP (Iteración 1)

Estamos construyendo el **Feature inicial: ScoreCompetencia**.
El objetivo es lograr un flujo determinístico: `diagnostico completado -> scoring por competencia -> evento ScoreCompetencia versionado`.

### Tareas Completadas / En Progreso
- [x] T0: Estructura base y taxonomía.
- [ ] T1: Formalizar contrato de entrada/salida de scoring.
- [ ] T2: Implementar motor de scoring determinístico (SOLID).
- [ ] T3: Emitir evento `ScoreCompetencia`.
- [ ] T4: Pruebas automatizadas mínimas (Jest).
- [ ] T5: Validación E2E técnica de la feature.

## 🛠 Stack Tecnológico

- **Backend:** Node.js con TypeScript.
- **Testing:** Jest (Unit, Contract y E2E).
- **Arquitectura:** Clean Architecture (Domain-Driven Design lite).

---
*Este documento se actualizará a medida que avancemos en las iteraciones.*
