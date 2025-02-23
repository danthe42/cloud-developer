import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { deleteTodo } from '../../businessLogic/todos'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const userid = getUserId( event )
    await deleteTodo(todoId, userid)
    return {
        statusCode: 204,
        body: ""
    }
  }  
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
