import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils';
import { createTodo } from '../../businessLogic/todos'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    const userid = getUserId( event )
    const newItem = await createTodo(newTodo, userid)

    const item = {
      todoId: newItem.todoId,
      createdAt: newItem.createdAt,
      name: newItem.name,
      dueDate: newItem.dueDate,
      done: newItem.done,
      attachmentUrl: newItem.attachmentUrl
    }

    return {
      statusCode: 201,
      body: JSON.stringify({
        item: item
      })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
