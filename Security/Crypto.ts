'use strict';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const sk = "123434564567.$=";

function createToken(payload: object): string {
    const secretKey = 'tu_clave_secreta';
    const expiresIn = '8h';
    const token = jwt.sign(payload, sk, { expiresIn });
    return token;
}

function decodeToken(token: string): any {
    const decoded = jwt.verify(token, sk);
    return decoded;
  }

  function generateHash(input: string): string {
    const algorithm = 'sha256';
    const hash = crypto.createHash(algorithm).update(input).digest('hex');
    return hash;
  }

  
export {createToken, decodeToken, generateHash};