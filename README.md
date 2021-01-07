# Nest Transations

## Installation

`npm i`

## Run

`docker-compose up`

## Playground

`npm run dev` ==> http://localhost:3010/graphql
(voir Requêtes GQL plus bas)

## Test

`npm run test:e2e`

### Requêtes GQL

**Liste des produits**

```gql
query Products {
  products {
    id
    name
    stock
  }
}
```

** Liste des produits **

```gql
query Products {
  products {
    id
    name
    stock
  }
}
```

** Liste des commandes **

```gql
query Orders {
  orders {
    id
    user
    orderProducts {
      product {
        id
        name
      }
    }
  }
}
```

** Créer une commande **

```gql
mutation CreateOrder {
  createOrder(
    input: { user: "Jeanjean", orderProducts: [{ productId: 1, quantity: 1 }] }
  ) {
    id
    user
    orderProducts {
      quantity
      product {
        id
        name
        stock
      }
    }
  }
}
```
