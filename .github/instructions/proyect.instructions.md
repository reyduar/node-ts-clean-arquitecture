---
description: Microservicio de Pedidos
applyTo: 'src/**'
---

- *Dominio*: Order, Price, SKU, Quantity, eventos de dominio.
- *Application*: casos de uso CreateOrder, AddItemToOrder, puertos y DTOs.
- *Infra*: repositorio, InMemory, pricing estatico, event bus no-op. 
- *HTTP*: endpoints minimos con Fastify.
- *Composición*: container.ts como composition root.
- *Tests*: dominio + aceptación de casos de uso.

## Comportamiento
- `POST /orders` crea un pedido.
- `POST /orders/:orderId/items` agrega una linea (SKU + qty) con precio actual.
- Devuelve el total del pedido.

## Estructura de carpetas

/src
  /domain
    /entities
    /value-objects
    /events
    /errors
  /application
    /use-cases
    /ports
    /dto
    /errors.ts
  /infrastructure
    /persistence/in-memory
    /http/controllers
    /http
    /messaging
  /composition
    /shared
/tests