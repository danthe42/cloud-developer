import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'
import { JwtToken } from '../../auth/JwtToken'

const logger = createLogger('auth')

const jwksUrl = 'https://danthe42.eu.auth0.com/.well-known/jwks.json'
let jwksCachedContent = undefined 

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
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

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt
  let kid = jwt.header.kid;

  if (!jwksCachedContent)
  {
    const rsp = await Axios.get( jwksUrl )
    const jsonrsp = JSON.parse( rsp.data )
    console.debug("Debug: Downloaded jwks content: " + JSON.stringify( jsonrsp ));  
    jwksCachedContent = jsonrsp.keys;
    console.debug("Debug: Downloaded jwks keys: " + JSON.stringify( jwksCachedContent ));  
    if (!jwksCachedContent || !jwksCachedContent.length) {
      throw new Error( 'The JWKS endpoint did not contain any keys');
    }
  }
  const signingKey = jwksCachedContent.find(key => key.kid === kid);
  if (!signingKey) {
    throw new Error(`Unable to find a signing key that matches '${kid}'`);
  }
  return verify(token, certToPEM( signingKey.x5c ), { algorithms: ['RS256'] }) as JwtToken
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

function certToPEM( cert ) {
  let pem = cert.match( /.{1,64}/g ).join( '\n' );
  pem = `-----BEGIN CERTIFICATE-----\n${ cert }\n-----END CERTIFICATE-----\n`;
  return pem;
}
