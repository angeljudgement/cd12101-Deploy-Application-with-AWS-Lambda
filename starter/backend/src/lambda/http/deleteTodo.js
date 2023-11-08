import middy from '@middy/core'
import httpErrorHandler from '@middy/http-error-handler'
import { deleteDBTodo } from '../../../services/queryDatabase.mjs'
import getUserId from '../utils.mjs'
import httpCors from '@middy/http-cors'

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    httpCors({
      credentials: true
    })
  )
  .handler(async (event) => {
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)
    const updatedTodo = await deleteDBTodo(userId, todoId)

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        item: updatedTodo
      })
    }
  })
