import { createLogger } from '../utils/logger.mjs'
import * as uuid from 'uuid'
import { AttachmentUtils } from '../fileStorage/attachmentUtils.mjs'
import { TodosAccess } from '../dataLayer/todosAccess.mjs'

const logger = createLogger('Todo task business logic !')
const attachmentUtils = new AttachmentUtils()
const todosAccess = new TodosAccess()

// write get todos function
export async function getTaskItems(userId) {
  logger.info('Get todo task for user')
  return todosAccess.getTodoTasks(userId)
}

// write create todo function
export async function createTaskItem(newTodo, userId) {
  logger.info('Create todo function called')

  const todoId = uuid.v4()
  const createdAt = new Date().toISOString()
  const s3AttachmentUrl = attachmentUtils.getAttachmentUrl(todoId)
  const newTask = {
    userId,
    todoId,
    createdAt,
    done: false,
    attachmentUrl: s3AttachmentUrl,
    ...newTodo
  }

  return await todosAccess.createTodoTask(newTask)
}

// write update todo function 
export async function updateTaskItem(userId, todoId, taskUpdate) {
  logger.info('Update task todo item for user')

  return todosAccess.updateTodoTask(userId, todoId, taskUpdate)
}

// write delete todo function 
export async function deleteTaskItem(todoId, userId) {
  logger.info('Delete task todo item for user')

  return todosAccess.deleteTodoTask(todoId, userId)
}

// write generate upload url function 
export async function createS3AttachmentPresignedUrl(todoId, userId) {
  logger.info('Create attachment function called by used', todoId, userId)

  return attachmentUtils.getUploadUrl(todoId)
}
