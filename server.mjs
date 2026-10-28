import { createServer } from 'node:http'
import { createReadStream, existsSync } from 'node:fs'
import { stat } from 'node:fs/promises'
import { resolve, extname, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('./dist/', import.meta.url))
const envFile = fileURLToPath(new URL('./.env', import.meta.url))
const providedPort = process.env.PORT
if (existsSync(envFile)) process.loadEnvFile(envFile)
const port = Number(providedPort || process.env.PORT || 3000)
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT musi być liczbą całkowitą od 1 do 65535.')
if (!existsSync(resolve(root, 'index.html'))) throw new Error('Brak dist/index.html. Najpierw uruchom npm run build.')

const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8' }
createServer(async (request, response) => {
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end()
    return
  }
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
    const file = resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`)
    if (!file.startsWith(root.endsWith(sep) ? root : root + sep)) {
      response.writeHead(403).end('Forbidden')
      return
    }
    const info = await stat(file)
    if (!info.isFile()) throw new Error('Not a file')
    response.writeHead(200, {
      'Content-Type': mime[extname(file)] || 'application/octet-stream',
      'Content-Length': info.size,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': pathname.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache',
    })
    if (request.method === 'HEAD') response.end()
    else createReadStream(file).on('error', () => response.destroy()).pipe(response)
  } catch {
    response.writeHead(404).end('Not found')
  }
}).listen(port, '0.0.0.0', () => console.log(`Godzinka: http://localhost:${port}`))
