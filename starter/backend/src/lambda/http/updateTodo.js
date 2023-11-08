import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
  .handler(async (event) => {
    console.log('Processing event: ', event)

    // const scanCommand = {
    //   TableName: groupsTable
    // }
    // const result = await dynamoDbClient.scan(scanCommand)
    // const items = event
    const updatedTodoId = event.pathParameters.todoId
    const updatedTodoBody = JSON.parse(event.body)

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        updatedTodoId,
        updatedTodoBody
      })
    }
  })
