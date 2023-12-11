import Axios from 'axios'
import jsonwebtoken from 'jsonwebtoken'
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('auth')

const jwksUrl = 'https://dev-235r0ih7hsf8pqs3.us.auth0.com/.well-known/jwks.json'

export async function handler(event) {
  logger.info('Authorizing a user', event.authorizationToken)

  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

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
  logger.info('verifyingToken')
  const token = getToken(authHeader)
  const jwt = jsonwebtoken.decode(token, { complete: true })

  // TODO: Implement token verification
  const jwksRes = await Axios.get(jwksUrl)
  const keysData = jwksRes.data.keys
  const signedKeys = keysData.find(key => key.kid === jwt.header.kid)

  logger.info('signedKeys', signedKeys)

  // Check if JWKs not exist valid key
  if (!signedKeys) {
    throw new Error("The JWKs endpoint not contain ant valid signature keys!")
  }

  // convert to pem value
  const pemValue = signedKeys.x5c[0]

  // get certificate from pem value
  const certificate = `-----BEGIN CERTIFICATE-----\n${pemValue}\n-----END CERTIFICATE-----`

  // veritfy the token
  return jsonwebtoken.verify(token, certificate, {algorithms: ['RS256']})
}

function getToken(authHeader) {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
