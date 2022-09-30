import * as uuid from 'uuid'
import { TodoItem } from '../models/TodoItem'
import { TodoAccess } from '../dataLayer/todoAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
//import * as createError from 'http-errors'


const todoAccess = new TodoAccess()

// this should be a sync. function
export function deleteTodo(
  todoId: string,
  userId: string
) {

  // Todo: check if user is allowed to delete the item, and throw exception if not

  todoAccess.deleteTodoItem( todoId, userId )
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
