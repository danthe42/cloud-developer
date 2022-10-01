import * as uuid from 'uuid'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { TodoAccess } from '../dataLayer/todoAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
//import * as createError from 'http-errors'


const todoAccess = new TodoAccess()

// this should be a sync. function
export async function deleteTodo(
  todoId: string,
  userId: string
) : Promise<void> {

  const todo = await todoAccess.getItem( todoId, userId )
  if (!todo)
    throw new Error("Todo record was not found, or the current user is not the owner of it")

  await todoAccess.deleteTodoItem( todoId, userId )
} 

export async function updateTodo(
  updatedTodo: UpdateTodoRequest,
  userId: string,
  todoId: string
): Promise<void> {
  const todo = await todoAccess.getItem( todoId, userId )
  if (!todo)
    throw new Error("Todo record was not found, or the current user is not the owner of it")

  await todoAccess.updateTodoItem( todoId, userId, updatedTodo as TodoUpdate )
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {

  const itemId = uuid.v4()

  return await todoAccess.createTodoItem({
    userId: userId,
    todoId: itemId,
    createdAt: new Date().toISOString(),
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    done: false
  })
}

export async function getTodosForUser ( 
  userId: string 
) : Promise<TodoItem[]> {
  return await todoAccess.getTodosForUser( userId )
}
