const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');
// const res = require('express/lib/response');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers
  const user = users.find(user => user.username === username)
  if(!user){
    return response.status(404).json({
      error: 'User not found'
    })
  }

  request.user = user
  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  if(users.find(_user => _user.username == username)){
    return response.status(400).json({
      error: 'user already exists'
    })
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(newUser)
  return response.status(201).json(newUser);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request
  return response.json(user.todos)

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body
  const {user} = request
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: (new Date(deadline)),
    created_at: (new Date())
  }

  user.todos.push(todo)
  // users = users.filter(_user => _user.id != user.id)
  // users.push(user)

  response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {id} = request.params
  const {title, deadline} = request.body
  const {user} = request

  let todo = user.todos.find(_todo => _todo.id == id)


  if(!todo){
    return response.status(404).json({
      error: 'not found'
    })
  }

  todo = {
    ...todo,
    title,
    deadline: (new Date(deadline)).toISOString(),
  }
  user.todos = user.todos.filter(_todo => _todo.id != id)
  user.todos.push(todo)
  // users = users.filter(_user => _user.id != user.id)
  // users.push(user)

  response.json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {id} = request.params
  const {user} = request
  let todo = user.todos.find(_todo => _todo.id == id)

  if(!todo){
    return response.status(404).json({
      error: 'not found'
    })
  }


  todo = {
    ...todo,
    done: true
  }
  user.todos = user.todos.filter(_todo => _todo.id != id)
  user.todos.push(todo)
  // users = users.filter(_user => _user.id != user.id)
  // users.push(user)

  response.json(todo)

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {id} = request.params
  const {user} = request 
  const todo = user.todos.find(_todo => _todo.id == id)
  if(!todo){
    return response.status(404).json({
      error: 'not found'
    })
  }

  const todos = user.todos.filter(_todo => _todo.id != id)
  user.todos = todos
  return response.status(204)
});

module.exports = app;