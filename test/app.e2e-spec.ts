import { INestApplication } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { Test, TestingModule } from '@nestjs/testing';
import {
  ApolloServerTestClient,
  createTestClient,
} from 'apollo-server-testing';
import gql from 'graphql-tag';
import { createConnection } from 'typeorm';
import { OrderProductEntity } from '../src/orders/entities/order-product.entity';
import { OrderEntity } from '../src/orders/entities/order.entity';
import { ProductEntity } from '../src/products/entities/product.entity';
import { AppModule } from './../src/app.module';

const PRODUCTS = [
  { id: 1, name: 'tomato', lastCustomer: null, stock: 3 },
  { id: 2, name: 'potato', lastCustomer: null, stock: 10 },
];

const PRODUCTS_QUERY = gql`
  query {
    products {
      id
      name
      stock
      lastCustomer
    }
  }
`;

const CREATE_ORDER_MUTATION = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      id
    }
  }
`;

const CREATE_ORDER_2_MUTATION = gql`
  mutation CreateOrder2($input: CreateOrderInput!) {
    createOrder2(input: $input) {
      id
    }
  }
`;

const waait = (delay: number) =>
  new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, delay);
  });

const resetData = async () => {
  const connection = await createConnection({
    type: 'mysql',
    host: '127.0.0.1',
    port: 3306,
    username: 'docker',
    password: 'docker',
    database: 'db',
    entities: [OrderEntity, ProductEntity, OrderProductEntity],
    synchronize: true,
  });

  const orderProductsRepo = connection.getRepository(OrderProductEntity);
  const ordersRepo = connection.getRepository(OrderEntity);
  const productsRepo = connection.getRepository(ProductEntity);

  // DELETE ALL ORDER_PRODUCTS
  const orderProducts = await orderProductsRepo.find();
  await Promise.all(orderProducts.map((oP) => orderProductsRepo.delete(oP)));

  // DELETE ALL ORDERS
  const orders = await ordersRepo.find();
  await Promise.all(orders.map((o) => ordersRepo.delete(o)));

  // DELETE ALL PRODUCTS
  const products = await productsRepo.find();
  await Promise.all(products.map((p) => productsRepo.delete(p)));

  // SAVE PRODUCTS
  await productsRepo.save(PRODUCTS);

  await connection.close();
};

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let apolloClient: ApolloServerTestClient;

  beforeEach(async () => {
    await resetData();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    await app.init();

    const gqlModule: GraphQLModule = moduleFixture.get<GraphQLModule>(
      GraphQLModule,
    );
    apolloClient = createTestClient((gqlModule as any).apolloServer);
  });

  afterEach(async () => {
    await app.close();
  });

  it('check products', async () => {
    const { query } = apolloClient;
    const {
      data: { products },
    } = await query({
      query: PRODUCTS_QUERY,
    });
    expect(products).toEqual(PRODUCTS);
  });

  it('fail order: not enough stock', async () => {
    const { mutate } = apolloClient;
    const { errors } = await mutate({
      mutation: CREATE_ORDER_MUTATION,
      variables: {
        input: {
          user: 'John',
          orderProducts: [
            {
              productId: 1,
              quantity: 10,
            },
          ],
        },
      },
    });
    expect(errors.length).toBe(1);
  });

  it('ORDER 150ms delay : No deadlock', async () => {
    const { query, mutate } = apolloClient;

    const johnOrder = mutate({
      mutation: CREATE_ORDER_MUTATION,
      variables: {
        input: {
          user: 'John',
          orderProducts: [
            {
              productId: 1,
              quantity: 2,
            },
          ],
        },
      },
    });

    const bobOrder = waait(150).then(() => {
      return mutate({
        mutation: CREATE_ORDER_MUTATION,
        variables: {
          input: {
            user: 'Bob',
            orderProducts: [
              {
                productId: 1,
                quantity: 1,
              },
            ],
          },
        },
      });
    });

    await Promise.all([johnOrder, bobOrder]);

    const {
      data: { products },
    } = await query({
      query: PRODUCTS_QUERY,
    });

    expect(products.find((p) => p.id === 1).stock).toBe(0);
  });

  it('ORDER 10ms delay : deadlock', async () => {
    const { query, mutate } = apolloClient;

    const johnOrder = mutate({
      mutation: CREATE_ORDER_MUTATION,
      variables: {
        input: {
          user: 'John',
          orderProducts: [
            {
              productId: 1,
              quantity: 2,
            },
          ],
        },
      },
    });

    const bobOrder = waait(10).then(() => {
      return mutate({
        mutation: CREATE_ORDER_MUTATION,
        variables: {
          input: {
            user: 'Bob',
            orderProducts: [
              {
                productId: 1,
                quantity: 1,
              },
            ],
          },
        },
      });
    });

    await Promise.all([johnOrder, bobOrder]);

    const {
      data: { products },
    } = await query({
      query: PRODUCTS_QUERY,
    });

    expect(products.find((p) => p.id === 1).stock).toBe(0);
  });

  it('ORDER 2 150ms delay : No deadlock', async () => {
    const { query, mutate } = apolloClient;

    const johnOrder = mutate({
      mutation: CREATE_ORDER_2_MUTATION,
      variables: {
        input: {
          user: 'John',
          orderProducts: [
            {
              productId: 1,
              quantity: 2,
            },
          ],
        },
      },
    });

    const bobOrder = waait(150).then(() => {
      return mutate({
        mutation: CREATE_ORDER_2_MUTATION,
        variables: {
          input: {
            user: 'Bob',
            orderProducts: [
              {
                productId: 1,
                quantity: 1,
              },
            ],
          },
        },
      });
    });

    await Promise.all([johnOrder, bobOrder]);

    const {
      data: { products },
    } = await query({
      query: PRODUCTS_QUERY,
    });
    expect(products.find((p) => p.id === 1).stock).toBe(0);
  });

  it('ORDER 2 50ms delay : No deadlock', async () => {
    const { query, mutate } = apolloClient;

    const johnOrder = mutate({
      mutation: CREATE_ORDER_2_MUTATION,
      variables: {
        input: {
          user: 'John',
          orderProducts: [
            {
              productId: 1,
              quantity: 2,
            },
          ],
        },
      },
    });

    const bobOrder = waait(50).then(() => {
      return mutate({
        mutation: CREATE_ORDER_2_MUTATION,
        variables: {
          input: {
            user: 'Bob',
            orderProducts: [
              {
                productId: 1,
                quantity: 1,
              },
            ],
          },
        },
      });
    });

    await Promise.all([johnOrder, bobOrder]);

    const {
      data: { products },
    } = await query({
      query: PRODUCTS_QUERY,
    });
    expect(products.find((p) => p.id === 1).stock).toBe(0);
  });
});
