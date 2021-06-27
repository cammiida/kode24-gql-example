const express = require("express");
const { ApolloServer, gql } = require("apollo-server-express");

const typeDefs = gql`
  enum DogeBreed {
    SHIBA_INU
    POMERANIAN
  }

  input DogeOwnerFilter {
    name: String!
  }

  type Doge {
    id: ID!
    name: String!
    breed: DogeBreed!
    isGoodDoge: Boolean!
  }

  type DogeOwner {
    id: ID!
    name: String!
    doges: [Doge!]
  }

  type Query {
    dogeOwner(id: ID!): DogeOwner
    dogeOwners(filter: DogeOwnerFilter): [DogeOwner!]
    doges: [Doge!]
    doge(id: ID!): Doge
  }
`;

const doges = [
  {
    id: "1",
    name: "Kabosu",
    breed: "SHIBA_INU",
    isGoodDoge: true,
    ownerId: "4",
  },
  {
    id: "2",
    name: "Charles",
    breed: "POMERANIAN",
    isGoodDoge: false,
    ownerId: "4",
  },
  {
    id: "3",
    name: "Lady",
    breed: "GOLDEN_RETRIEVER",
    isGoodDoge: true,
    ownerId: "5",
  },
];
const dogeOwners = [
  { id: "4", name: "Elon" },
  { id: "5", name: "Atsuko" },
];

async function startApolloServer() {
  const resolvers = {
    Query: {
      dogeOwner(_parent, args, _context, _info) {
        return dogeOwners.find((dogeOwner) => dogeOwner.id === args.id);
      },
      dogeOwners(_parent, args, _context, _info) {
        return args.filter
          ? dogeOwners.filter((dogeOwner) =>
              dogeOwner.name
                .toLocaleLowerCase()
                .includes(args.filter.name.toLocaleLowerCase())
            )
          : dogeOwners;
      },
      doge(_parent, args, _context, _info) {
        return doges.find((doge) => doge.id === args.id);
      },
    },
    DogeOwner: {
      doges(parent) {
        return doges.filter((doge) => doge.ownerId === parent.id);
      },
    },
  };

  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();

  const app = express();
  server.applyMiddleware({ app });

  await new Promise((resolve) => app.listen({ port: 4000 }, resolve));
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
  return { server, app };
}

startApolloServer();
