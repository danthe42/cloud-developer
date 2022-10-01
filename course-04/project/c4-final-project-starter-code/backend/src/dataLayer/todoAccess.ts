import * as AWS  from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('todoAccess')

export class TodoAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todoTable = process.env.TODOS_TABLE,
    private readonly todoTableIndexname = process.env.TODOS_CREATED_AT_INDEX

    ) {
  }

  deleteTodoItem(  
    todoId: string,
    userId: string
  ) : void {
    const todoItem = {
      Key: {
        userId: userId,
        todoId: todoId   
      },
      TableName: this.todoTable
    }
    this.docClient.delete( todoItem )
    console.debug("Deleted todo item successfully.")
  }

  async createTodoItem(todoItem: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
      TableName: this.todoTable,
      Item: todoItem
    }).promise()

    return todoItem
  }
  async getTodosForUser( userid: string ) : Promise<TodoItem[]> {
    logger.info("getTodosForUser", { userid: userid, todoTable: this.todoTable, todoTableIndexname: this.todoTableIndexname } )
    const result = await this.docClient.query({
      TableName: this.todoTable,
      IndexName: this.todoTableIndexname,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userid
      },
      ScanIndexForward: false
    }).promise()
    return result.Items as TodoItem[]
  } 
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}
