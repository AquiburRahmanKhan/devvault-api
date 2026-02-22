## Users

Create user
POST /users
{
  "email": "test@example.com",
  "name": "Test"
}

List users
GET /users?page=1&limit=10&sort=createdAt&order=desc&search=test

Get user
GET /users/:id

Update user
PATCH /users/:id
{
  "name": "New Name"
}

Delete user
DELETE /users/:id