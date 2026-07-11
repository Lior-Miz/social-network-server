## Android 2 2026 sem b project - BackEnd / API

## Lior Mizrachi | Amit Hazan | Abed Haj Yahia

* **FrontEnd website that the user would use**: https://social-network-frontend-android2-project.onrender.com
* **BackEnd api website**: https://social-network-backend-android2-project.onrender.com

## To be used in conjunture with 

* **FrontEnd** https://github.com/amith372/social-network-front

This repository contains the backend service for a real-time social/chat application. It provides RESTful APIs for user management, group chats, post feeds, and statistical data, along with real-time bidirectional communication using Socket.IO.

## Tech Stack

* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB (via Mongoose)
* **Authentication:** JSON Web Tokens (JWT)
* **Real-time:** Socket.IO
* **File Storage:** GridFS (for media uploads)

## Features

* **Secure Authentication:** JWT-based user registration and login.
* **Data Validation:** Strict backend validation for user creation, preventing empty fields, duplicate emails/usernames, and invalid dates of birth.
* **Complex Cascading Deletions:** When a user deletes their account, the system automatically removes their posts, transfers group admin privileges to random remaining members, and cleans up empty groups.
* **Real-time Updates:** Integrated Socket.IO events for live client updates.
* **Media Handling:** Support for `multipart/form-data` uploads for posts.

## Environment Variables

To run this project, you will need to add the following environment variables to your `.env` file:

* `JWT_SECRET`: Secret key for signing JSON Web Tokens.
* `MONGO_URI`: MongoDB connection string.

## API Routes Reference

### User Routes

| Method   | URL                            | Description 
| :---     | :---                           | :--- 
| `POST`   | `/api/users/register`          | Registers a new user and returns a JWT |
| `POST`   | `/api/users/login`             | Authenticates a user and returns a JWT |
| `GET`    | `/api/users/`                  | Retrieves all users (supports `?includeSelf=true`) |
| `PUT`    | `/api/users/change-password`   | Updates the authenticated user's password |
| `PUT`    | `/api/users/:id`               | Updates the authenticated user's profile information |
| `DELETE` | `/api/users/:id`               | Deletes the user account and cleans up associated data |

### Group Routes

| Method   | URL                            | Description 
| :---     | :---                           | :--- 
| `GET`    | `/api/groups/`                 | Retrieves groups (supports `?q=`, `?myGroups=true`, `?isGroupChat=true`) 
| `POST`   | `/api/groups/`                 | Creates a new group 
| `POST`   | `/api/groups/private`          | Creates a private 1-on-1 chat 
| `PUT`    | `/api/groups/:id`              | Updates group name and description (Admin only) 
| `DELETE` | `/api/groups/:id`              | Deletes a group entirely (Admin only) 
| `PATCH`  | `/api/groups/:id/members`      | Adds new members to a group (Admin only) 
| `PATCH`  | `/api/groups/:id/leave`        | Removes the current user from a group 
| `POST`   | `/api/groups/:id/request-join` | Sends a request to join a private group 
| `POST`   | `/api/groups/:id/accept-join`  | Accepts a user's join request (Admin only) 
| `POST`   | `/api/groups/:id/reject-join`  | Rejects a user's join request (Admin only) 

### Post Routes

| Method   | URL                             | Description 
| :---     | :---                            | :--- 
| `GET`    | `/api/posts/`                   | Retrieves posts (supports `?group=` to filter by feed) 
| `POST`   | `/api/posts/`                   | Creates a new post (supports file uploads) 
| `GET`    | `/api/posts/search`             | Searches posts (supports `?keyword=`, `?author=`, `?group=`) 
| `PUT`    | `/api/posts/:id`                | Updates an existing post (Author only) 
| `DELETE` | `/api/posts/:id`                | Deletes a post (Author or Group Admin only) 
| `GET`    | `/api/posts/file/:filename`     | Streams an uploaded media file from storage

### Stats & Base Routes

| Method   | URL                             | Description   
| :---     | :---                            | :--- 
| `GET`    | `/`                             | API health check and welcome message 
| `GET`    | `/api/stats/languages`          | Retrieves the top 5 user languages 
| `GET`    | `/api/stats/popular-groups`     | Retrieves the top 5 largest groups 

### API Project structure

```text
backend/
Project
├── controllers/
│   ├── groupController.js   # Logic for group actions, invites, and requests
│   ├── postController.js    # Logic for managing posts and streaming media
│   ├── statsController.js   # Aggregations for top languages and popular groups
│   └── userController.js    # Handles auth, registration, and cascading deletes
├── middleware/
│   ├── auth.js              # JWT verification and route protection
│   └── upload.js            # Multer integration with GridFS storage for posts
├── models/
│   ├── Group.js             # Mongoose schema for groups and private chats
│   ├── Post.js              # Mongoose schema for user-generated content
│   └── User.js              # Mongoose schema for profiles and login credentials
├── routes/
│   ├── groupRoutes.js       # Mounts group management endpoints
│   ├── index.js             # Combines and exports all API route variations
│   ├── postRoutes.js        # Mounts feed, search, and file streaming routes
│   ├── statsRoutes.js       # Mounts metrics and data analytics endpoints
│   └── userRoutes.js        # Mounts registration, login, and identity management
├── sockets/
│   └── socketHandler.js     # Orchestrates Socket.IO events (new_user, update_user)
├── .env                     # Local environment configurations (Secrets, URIs)
├── package.json             # Runtime scripts and node module dependencies
├── README.md                # General project layout and documentation
└── server.js                # Application bootstrapper and HTTP server listener
