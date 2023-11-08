import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { createLogger } from './../src/utils/logger.mjs'

const dynamoDbClient = DynamoDBDocument.from(new DynamoDB())
const todosTable = process.env.TODOS_TABLE
const logger = createLogger('Todos-Query-Database')
const bucketName = process.env.IMAGES_S3_BUCKET

// Interfaces
const ITodo = { name: '', dueDate: '', done: '', attachmentUrl: '' }
const IUpdateTodo = {
  userId: '',
  todoId: '',
  updateData: ITodo
}

/**
 * Build update query to fetch DynamoDB data via .query
 * @param updateTodoObj: string - todo needs to be updated
 * To be converted to common soon ;)
 */
const buildUpdateQueryParams = (updateTodoObj) => ({
  TableName: todosTable,
  Key: { userId: updateTodoObj.userId, todoId: updateTodoObj.todoId },
  ConditionExpression: 'attribute_exists(todoId)',
  ExpressionAttributeNames: { '#nm': 'name' }, // Substitute for 'name' since is a keyword
  UpdateExpression: 'set #nm = :nm, dueDate = :dd, done = :dn',
  ExpressionAttributeValues: {
    ':nm': updateTodoObj?.updateData?.name,
    ':dd': updateTodoObj?.updateData?.dueDate,
    ':dn': updateTodoObj?.updateData?.done
  }
})

/**
 * Retrieve Todos from DynamoDB
 * @param userId: string - Specify Item that DynamoDB should return as the result of the query
 */
export async function getDBTodos(userId) {
  logger.info(`queryDatabase - getDBTodos: Get todos of ${userId}`)
  if (!userId) {
    logger.info(`queryDatabase - getDBTodos: Error, userId is invalid`)
    return
  }
  try {
    const result = await dynamoDbClient.query({
      TableName: todosTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    })

    const items = result?.Items ?? []
    logger.info(`queryDatabase - getDBTodos: Get todos of ${userId}`)

    return items
  } catch (e) {
    logger.info('queryDatabase - getDBTodos: Failed to retrive todo')
    logger.error(e)

    return []
  }
}

/**
 * Create Todos from DynamoDB
 * @param todo: ITodo - Specify Item that DynamoDB should return as the result of the query
 */
export const createDBTodo = async (todo) => {
  logger.info('queryDatabase - createTodo: Creating new todo')

  if (!todo) {
    logger.info(`queryDatabase - createTodo: Error, todo is invalid`)
    return
  }

  const todoObject = {
    TableName: todosTable,
    Item: todo
  }

  try {
    await dynamoDbClient.put(todoObject)

    logger.info('queryDatabase - createTodo: New todo created')
  } catch (e) {
    logger.info('queryDatabase - createTodo: Failed to create todo')
    logger.error(e)
  }

  return todo
}

/**
 * Update Todos from DynamoDB
 * @param updateTodoObj: IUpdateTodo - Object to update Todo
 */
export const updateDBTodo = async (updateTodoObj = { ...IUpdateTodo }) => {
  logger.info(`queryDatabase - updateTodo: Updating ${updateTodoObj.todoId}`)

  if (!updateTodoObj?.todoId) {
    logger.info(
      `queryDatabase - updateTodo: Error, ${updateTodoObj.todoId} is an invalid value`
    )
    return
  }

  if (!updateTodoObj?.updateData) {
    logger.info(
      `queryDatabase - updateTodo: Error, ${updateTodoObj.updateData} is an invalid value`
    )
    return
  }

  await dynamoDbClient.update(buildUpdateQueryParams(updateTodoObj))
  logger.info(`queryDatabase - updateTodo: ${updateTodoObj.todoId} Updated`)

  return updateTodoObj.updateData
}

/**
 * Delete Todos from DynamoDB
 * @param userId: IUpdateTodo - Object to update Todo
 * @param todoId: IUpdateTodo - Object to update Todo
 */
export const deleteDBTodo = async (userId, todoId) => {
  logger.info(`queryDatabase - deleteTodo: Deleting ${todoId}`)

  if (!todoId) {
    logger.info(
      `queryDatabase - deleteTodo: Error, ${todoId} is an invalid value`
    )
    return
  }

  if (!userId) {
    logger.info(
      `queryDatabase - deleteTodo: Error, ${userId} is an invalid value`
    )
    return
  }
  try {
    await dynamoDbClient.delete({
      TableName: todosTable,
      Key: { userId, todoId }
    })

    logger.info('queryDatabase - createTodo: New todo created')
  } catch (e) {
    logger.info(`queryDatabase - deleteTodo: Failed to perform Delete`)
    logger.error(e)
  }

  logger.info(`queryDatabase - deleteTodo: ${todoId} Deleted`)

  return `${todoId} has been deleted`
}

export const insertImagetoDB = async (userId, todoId) => {
  // Just lazy building common so im going to just use this as normal xD
  if (!todoId) {
    logger.info(
      `queryDatabase - insertImagetoDB: Error, ${todoId} is an invalid value`
    )
    return
  }

  if (!userId) {
    logger.info(
      `queryDatabase - insertImagetoDB: Error, ${userId} is an invalid value`
    )
    return
  }

  const bucketImgUrl = `https://${bucketName}.s3.amazonaws.com/${todoId}`

  try {
    await dynamoDbClient.update({
      TableName: todosTable,
      Key: { userId, todoId },
      ConditionExpression: 'attribute_exists(todoId)',
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': bucketImgUrl
      }
    })
    logger.info(`Updating image url for a todo item: ${bucketImgUrl}`)
  } catch (e) {
    logger.info(
      `queryDatabase - insertImagetoDB: failed to update ${bucketImgUrl}`
    )
    logger.error(e)
  }
}
