import fs from 'fs';
import path from 'path';
import { createHeaders, getKeyId } from '@interledger/http-signature-utils';

const keyCache = new Map();

class HttpRequestError extends Error {
  constructor(message, { status, body }) {
    super(message);
    this.name = 'HttpRequestError';
    this.status = status;
    this.body = body;
  }
}

const loadPrivateKey = (privateKeyPath) => {
  if (!privateKeyPath) {
    throw new Error('privateKeyPath is required when signing requests');
  }

  const resolvedPath = path.isAbsolute(privateKeyPath)
    ? privateKeyPath
    : path.resolve(process.cwd(), privateKeyPath);

  if (keyCache.has(resolvedPath)) {
    return keyCache.get(resolvedPath);
  }

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Private key file not found at ${resolvedPath}`);
  }

  const key = fs.readFileSync(resolvedPath, 'utf8');
  keyCache.set(resolvedPath, key);
  return key;
};

const parseResponse = async (response) => {
  const text = await response.text();
  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const shouldSignRequest = (method, accessToken, signExplicit) => {
  if (typeof signExplicit === 'boolean') {
    return signExplicit;
  }

  if (accessToken) {
    return true;
  }

  return method.toUpperCase() !== 'GET';
};

export const httpRequest = async ({
  method = 'GET',
  url,
  body,
  accessToken,
  config,
  headers = {},
  sign
}) => {
  const upperMethod = method.toUpperCase();
  const requestHeaders = {
    Accept: 'application/json',
    ...headers
  };

  if (accessToken) {
    requestHeaders.Authorization = `GNAP ${accessToken}`;
  }

  let bodyString;
  if (body !== undefined && body !== null) {
    bodyString = JSON.stringify(body);
  }

  if (shouldSignRequest(upperMethod, accessToken, sign)) {
    if (!config) {
      throw new Error('Signing requested but no config provided');
    }

    const privateKey = loadPrivateKey(config.privateKeyPath);
    const signatureHeaders = await createHeaders({
      request: {
        method: upperMethod,
        url,
        headers: requestHeaders,
        body: bodyString
      },
      privateKey,
      keyId: config.keyId
    });

    Object.assign(requestHeaders, signatureHeaders);

    if (config.keyId && requestHeaders['Signature-Input']) {
      const keyId = getKeyId(requestHeaders['Signature-Input']);

      if (!keyId || keyId !== config.keyId) {
        const baseSignature = requestHeaders['Signature-Input'].split(';keyid=')[0];
        requestHeaders['Signature-Input'] = `${baseSignature};keyid="${config.keyId}"`;
      }
    }
  } else if (bodyString && !requestHeaders['Content-Type']) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    method: upperMethod,
    headers: requestHeaders,
    body: bodyString
  });

  const parsedBody = await parseResponse(response);

  if (!response.ok) {
    const errorMessage = `HTTP ${upperMethod} ${url} failed with status ${response.status}`;
    throw new HttpRequestError(errorMessage, {
      status: response.status,
      body: parsedBody
    });
  }

  return parsedBody;
};

export const httpGet = (url, options = {}) =>
  httpRequest({
    method: 'GET',
    url,
    sign: options.sign ?? false,
    ...options
  });

export const httpPost = (url, body, options = {}) =>
  httpRequest({
    method: 'POST',
    url,
    body,
    ...options
  });

export class HttpError extends Error {
  constructor({ message, status, response }) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.response = response;
  }
}

