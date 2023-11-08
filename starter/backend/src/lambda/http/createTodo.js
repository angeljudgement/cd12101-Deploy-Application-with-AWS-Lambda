import middy from '@middy/core'
import httpErrorHandler from '@middy/http-error-handler'
import { createTodoHelper } from '../../../helpers/api.helper.mjs'
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
    const newTodo = JSON.parse(event.body)
    const userId = getUserId(event)
    const item = await createTodoHelper(userId, newTodo)
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        item
      })
    }
  })
