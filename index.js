//// imports ////
import http from 'http'
import fs from 'fs/promises'
import path from 'path'
/////////////////

const server = http.createServer()
// set logging to console-out: replace with your logger of choice
let logging = console

export const readFile = async (pathname) => {
  const filePath = path.resolve(process.cwd(), './public', pathname)
  try {
    return await fs.readFile(filePath)
  } catch (err) {
    logging.error(`Error reading file: ${err}`)
    throw err
  }
}

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
}

function mimeType(filePath) {
  const ext = path.extname(filePath)
  return mimeTypes[ext] || 'text/plain'
}

const routes = {
  '/health': (req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ status: 'ok' }))
  },
}

server.on('request', async (req, res) => {
  const { url, method, httpVersion, headers } = req
  const userAgent = headers['user-agent']
  const referer = headers.referer || headers.referrer
  const ip = req.socket.remoteAddress

  const parsedUrl = new URL(url, `http://${req.headers.host}`)
  const pathname = parsedUrl.pathname

  // Check if the endpoint exists in the endpoints object, and if so, handle it
  if (routes[pathname]) {
    routes[pathname](req, res)
    return // Return early to avoid handling the request further
  }

  // If not, try to serve a file from the public directory
  let filePath = pathname === '/' ? 'index.html' : pathname
  filePath = path.join(process.cwd(), 'public', filePath) // Ensuring the correct path

  try {
    // Serve the file from the public directory
    const data = await readFile(filePath)
    res.writeHead(200, { 'Content-Type': mimeType(filePath) })
    res.end(data)

    const responseSize = data.length
    const date = new Date().toISOString()
    logging.info(
      `${ip} - - [${date}] "${method} ${pathname} HTTP/${httpVersion}" 200 ${responseSize} "${referer}" "${userAgent}"`,
    )
  } catch (error) {
    logging.error(`Error reading file from directory: ${error}`)
    res.writeHead(404, { 'Content-Type': 'text/plain' })
    res.end('Not Found')

    const date = new Date().toISOString()
    logging.info(
      `${ip} - - [${date}] "${method} ${pathname} HTTP/${httpVersion}" 404 - "${referer}" "${userAgent}"`,
    )
  }
})

server.on('error', (err) => {
  logging.error(err)
})

export default function (config) {
  return {
    init: async () => {
      logging.info('[init] ui', { service: 'ui' })
      return true
    },
    start: async () => {
      server.listen(config.port)
      return 'running'
    },
    stop: () => {
      server.close()
      return 'stopped'
    },
    status: () => {
      return server.listening ? 'running' : 'stopped'
    },
  }
}
