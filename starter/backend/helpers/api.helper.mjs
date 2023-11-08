import { createDBTodo, updateDBTodo } from '../services/queryDatabase.mjs'
import { createLogger } from '../src/utils/logger.mjs'
import * as uuid from 'uuid'

const logger = createLogger('utils')
/**
 * Migrate into Todo Object and Create Todos
 * @param userId: string
 */
export async function createTodoHelper(userId, todo) {
  logger.info(
    `api.helper - createTodoHelper: Migrating Todo Object and Create Todo`
  )
  const todoId = uuid.v4()

  return createDBTodo({
    userId,
    todoId,
    createdAt: new Date().toISOString(),
    done: false,
    ...todo
  })
}

/**
 * Migrate into Todo Object and Update Todos
 * @param userId: string
 * @param todoId: string
 * @param todo: IUpdateTodo - Object to update Todo
 */
export async function updateTodoHelper(userId, todoId, todo) {
  logger.info(
    `api.helper - updateTodoHelper: Migrating Todo Object and Update Todo`
  )

  return updateDBTodo({
    userId,
    todoId,
    updateData: todo
  })
}
