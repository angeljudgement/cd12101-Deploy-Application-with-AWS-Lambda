import jsonwebtoken from 'jsonwebtoken'
import { createLogger } from '../../utils/logger.mjs'
import axios from 'axios'

const logger = createLogger('auth')

const jwksUrl = `https://dev-ukzy5olgmoplicqn.us.auth0.com/.well-known/jwks.json`

export async function handler(event, context) {
  try {
    context.callbackWaitsForEmptyEventLoop = false
    const jwtToken = await verifyToken(event.authorizationToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader) {
  const token = getToken(authHeader)
  const jwt = jsonwebtoken.decode(token, { complete: true })

  try {
    const jwksData = await axios.get(jwksUrl)
    const retrievedKey = jwksData?.data?.keys?.find(
      (k) => k.kid === jwt.header.kid
    )
    if (!retrievedKey?.x5c?.[0]) {
      throw new Error('Either key is not found or invalid')
    }
    let secretKey = `-----BEGIN CERTIFICATE-----\n${retrievedKey?.x5c?.[0]}\n-----END CERTIFICATE-----`

    console.log(secretKey)

    const verification = jsonwebtoken.verify(token, secretKey)
    console.log(verification)

    return verification
  } catch (error) {
    // Token verification failure
    console.error('Token verification failure:', error.message)

    return null
  }
}

function getToken(authHeader) {
  if (!authHeader) {
    throw new Error('No authentication header')
  }

  if (!authHeader.toLowerCase().startsWith('bearer ')) {
    throw new Error('Invalid authentication header')
  }

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
