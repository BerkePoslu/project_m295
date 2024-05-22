const swaggerAutogen = require("swagger-autogen");

const doc = {
  info: {
    version: "1.0.0", // by default: '1.0.0'
    title: "Tasks REST API", // by default: 'REST API'
    description:
      "This is a simple REST API for a task manager. It allows you to create, read, update and delete tasks. You can also login and logout to get access to the Tasks.", // by default: ''
  },
  host: "localhost:3000", // by default: 'localhost:3000'
  basePath: "/", // by default: '/'
  schemes: ["http"], // by default: ['http']
  consumes: ["application/json"], // by default: ['application/json']
  produces: ["application/json"], // by default: ['application/json']
  tags: [
    {
      name: "Tasks",
      description: "Endpoints for managing tasks",
    },
    {
      name: "Authentication",
      description: "Endpoints for authentication",
    },
    // { ... }
  ],
  securityDefinitions: {
    basicAuth: {
      type: "basic",
    },
  },
  security: { basicAuth: [] },
  definitions: {},
};

const outputFile = "./swagger.json";
const endpointsFiles = ["./routes/auth.js", "./routes/tasks.js"];

swaggerAutogen(outputFile, endpointsFiles, doc);
