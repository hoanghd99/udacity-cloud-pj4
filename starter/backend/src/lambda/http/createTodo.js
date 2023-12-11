import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { getUserId } from '../utils.mjs'
import { createTaskItem } from '../../businessLogic/todos.mjs'

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
  .handler(async (event) => {
    const newTodo = JSON.parse(event.body)

    // TODO: Implement creating a new TODO item
    const userId = getUserId(event)
    const newTaskItem = await createTaskItem(newTodo, userId)

    return {
      statusCode: 201,
      body: JSON.stringify({
        item: newTaskItem
      })
    }
  })
