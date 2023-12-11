import AWS from 'aws-sdk'
import AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger.mjs'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('data access')

export class TodosAccess {
  constructor() {
    this.docClient = new XAWS.DynamoDB.DocumentClient()
    this.todosTable = process.env.TODOS_TABLE
    this.todosIndex = process.env.TODOS_CREATED_AT_INDEX
  }

  async getTodoTasks(userId) {
    logger.info('Get all task data layer')

    const paramGetTodo = {
      TableName: this.todosTable,
      IndexName: this.todosIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }

    const result = await this.docClient
      .query(paramGetTodo)
      .promise()

    const items = result.Items
    return items
  }

  async createTodoTask(newTask) {
    logger.info('create new task item data layer')

    const paramCreateTodo = {
      TableName: this.todosTable,
      Item: newTask
    }

    const taskCreate = await this.docClient
      .put(paramCreateTodo)
      .promise()

      logger.info(`Create new task item: ${taskCreate}`)

    return newTask
  }

  async updateTodoTask(userId, todoId, updateTask) {
    logger.info('update task item data layer')

    const paramUpdate = {
      TableName: this.todosTable,
      Key: {
        todoId,
        userId
      },
      UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
      ExpressionAttributeValues: {
        ':name': updateTask.name,
        ':dueDate': updateTask.dueDate,
        ':done': updateTask.done
      },
      ExpressionAttributeNames: {
        '#name': 'name'
      },
      ReturnValues: 'UPDATED_NEW'
    }

    await this.docClient
      .update(paramUpdate)
      .promise()

    return updateTask
  }

  async deleteTodoTask(todoId, userId) {
    logger.info('delete task item data layer')

    const paramDelete = {
      TableName: this.todosTable,
      Key: {
        todoId,
        userId
      }
    }

    const resultDelete = await this.docClient
      .delete(paramDelete)
      .promise()

    logger.info('deleted task item successfully', resultDelete)

    return resultDelete
  }

  async updateTaskAttachmentUrl(todoId, userId, attachmentUrl) {
    logger.info('Update task attachment url data layer')

    const paramUpdateUrl = {
      TableName: this.todosTable,
      Key: {
        todoId,
        userId
      },
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': attachmentUrl
      }
    }

    await this.docClient
      .update(paramUpdateUrl)
      .promise()
  }
}
