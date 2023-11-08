import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { insertImagetoDB } from '../../../services/queryDatabase.mjs'
import getUserId from '../utils.mjs'
import middy from '@middy/core'
import httpErrorHandler from '@middy/http-error-handler'
import httpCors from '@middy/http-cors'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('Todos-Query-Database')

const bucketName = process.env.IMAGES_S3_BUCKET
const s3Client = new S3Client()
const urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION)

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    httpCors({
      credentials: true
    })
  )
  .handler(async (event) => {
    const getUploadUrl = async (imageId) => {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: imageId
      })

      try {
        const url = await getSignedUrl(s3Client, command, {
          expiresIn: urlExpiration
        })

        logger.info(`generateUploadUrl - getUploadUrl: Url Retrieved`)
        return url
      } catch (e) {
        logger.info(
          `generateUploadUrl - getUploadUrl: A problem has occurred while retrieving SignedUrl`
        )
        logger.error(e)
        return ''
      }
    }

    const userId = getUserId(event)
    const todoId = event.pathParameters.todoId
    const imageUrl = await getUploadUrl(todoId) // Return this temporary image

    // Insert new created S3 to DB
    await insertImagetoDB(userId, todoId)

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        uploadUrl: imageUrl
      })
    }
  })
