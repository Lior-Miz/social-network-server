## Android 2 2026 sem b project - BackEnd / API

## Lior Mizrachi | Amit Hazan | Abed Haj Yahia

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
├── config/
│   └── db.js                # MongoDB connection and GridFS initialization
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
