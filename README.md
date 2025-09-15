# CompraVentaBe

## Project Description

CompraVentaBe is a backend project built with Node.js, Express, and Mongoose for managing product inventory and sales. It provides a RESTful API for user authentication, product management, and bill creation.

## Functionalities

*   **User Authentication:** Allows users to sign up and sign in to access protected API endpoints.
*   **Product Management:** Enables the creation, retrieval, updating, and listing of products.
*   **Sales Management:** Supports the creation of bills (invoices) and retrieval of bill details.
*   **Price Management:** Manages product prices in different currencies.

## Technologies Used

*   Node.js
*   Express
*   Mongoose
*   JSON Web Tokens (JWT)
*   Docker

## APIs

| Endpoint             | Method | Description                                         |
| -------------------- | ------ | --------------------------------------------------- |
| /api/auth/sign-in    | POST   | Authenticates a user and returns a JWT token.       |
| /api/auth/sign-up    | POST   | Registers a new user.                               |
| /api/product         | GET    | Retrieves a list of products.                       |
| /api/product         | POST   | Creates a new product.                              |
| /api/product/:productId | GET    | Retrieves a product by its ID.                      |
| /api/product/:productId | PUT    | Updates a product by its ID.                        |
| /api/price/coin      | GET    | Retrieves a list of available currencies.           |
| /api/price/product/:productId | GET    | Retrieves the price of a product by its ID.       |
| /api/price/:priceId/:coin | PUT    | Updates the price of a product.                     |
| /api/bill            | POST   | Creates a new bill.                                 |
| /api/bill            | GET    | Retrieves a list of bills.                          |
| /api/bill/detail/:billId | GET    | Retrieves the details of a bill by its ID.          |
| /api/doc             | GET    | Serves the Swagger UI for API documentation.        |

## Getting Started

### Prerequisites

*   Node.js and npm
*   MongoDB
*   Docker and Docker Compose (optional)

### Installation

1.  Clone the repository:

    ```sh
    git clone <repository-url>
    ```
2.  Install dependencies:

    ```sh
    npm ci
    ```

### Configuration

1.  Create a `.env` file in the root directory with the following variables:

    ```
    SERVER_PORT=3000
    SERVER_JWT_SESSION_SECRET=<your-secret-key>
    DB_HOST=<database-connection-string>
    DB_NAME=<database-name>
    ```

    You can use the [.env.example](.env.example) file as a template.
2.  (Optional) Configure the MongoDB database using the `mongo.env` file for Docker Compose. You can use the [mongo.env.example](mongo.env.example) file as a template.

### Database Configuration with Docker Compose

To configure the MongoDB database using Docker Compose, create a `mongo.env` file with the necessary environment variables:

```
MONGO_INITDB_ROOT_USERNAME=<your-mongo-root-username>
MONGO_INITDB_ROOT_PASSWORD=<your-mongo-root-password>
MONGO_INITDB_DATABASE=<your-mongo-database-name>
```

### Running the Application

1.  Start the application:

    ```sh
    npm run dev
    ```

    or

    ```sh
    npm start
    ```

### Running with Docker Compose

1.  Start the Docker Compose environment:

    ```sh
    docker-compose up -d
    ```

### API Documentation

The API documentation is available at `/api/doc/`.

## Scripts

The following scripts are available in the [package.json](package.json) file:

*   `start`: Starts the application using Node.js.
*   `dev`: Starts the application in development mode with Nodemon.

## Volume

The database uses the `mongo_db` folder as a volume for Docker.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
