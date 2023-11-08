import middy from '@middy/core'
import httpErrorHandler from '@middy/http-error-handler'
import { getDBTodos } from '../../../services/queryDatabase.mjs'
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
    const userId = getUserId(event)
    const todos = await getDBTodos(userId)

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        items: todos
      })
    }
  })
