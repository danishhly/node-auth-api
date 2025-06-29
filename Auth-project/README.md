# Node Auth API

A secure and modular REST API built using Node.js, Express.js, MongoDB, and JWT authentication. This project provides user registration, login, and protected routes, and is a great starter template for building full-stack apps.

---

## 🚀 Features

- User registration & login
- JWT-based authentication
- Password hashing with bcrypt
- MongoDB integration via Mongoose
- Modular route & controller structure
- Error handling middleware

## 🧰 Tech Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT for authentication
- Bcrypt for password hashing

---
📁 Project Structure
bash
Copy code
AUTH-PROJECT/
├── controllers/        # Business logic for each route
├── middlewares/        # Custom Express middlewares (e.g., validators, auth checks)
├── models/             # Mongoose models and schemas
├── routers/            # Express routers mapping endpoints to controllers
├── utils/              # Utility/helper functions
├── .env                # Actual environment variables (not committed)
├── .env.example        # Example environment config (for reference)
├── .gitignore          # Files/folders to ignore by git
├── index.js            # Entry point of the application
├── package.json        # Project metadata and dependencies
├── package-lock.json   # Dependency lock file
└── README.md           # Project documentation


📁 Key Folders Explained
controllers/: Handles logic for requests (e.g., register, login).

middlewares/: Contains middlewares like input validation and auth.

models/: Mongoose schemas for MongoDB collections.

routers/: Defines API routes and links them to controllers.

utils/: General utility functions (e.g., token generation, hashing).



📌 License
This project is licensed under the MIT License.



📌 Future Improvements

Swagger API documentation

Unit & integration testing

Docker support

Rate limiting & security headers


