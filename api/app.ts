import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import querystring from 'querystring'
import authRoutes from './routes/auth.js'
import paymentRoutes from './routes/payment.js'
import creemRoutes from './routes/creem.js'
import { initDonationsTable } from './services/donationService.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const app: express.Application = express()

app.use(cors())
app.use(express.raw({ limit: '10mb', type: '*/*' }))

app.use((req: Request, res: Response, next: NextFunction) => {
  const rawBody = req.body
  ;(req as any).rawBody = rawBody

  const contentType = req.headers['content-type'] || ''
  if (contentType.includes('application/json')) {
    try {
      req.body = JSON.parse(rawBody?.toString() || '{}')
    } catch {
      req.body = {}
    }
  } else if (contentType.includes('application/x-www-form-urlencoded')) {
    req.body = querystring.parse(rawBody?.toString() || '')
  } else {
    req.body = rawBody?.toString() || ''
  }
  next()
})

app.use('/api/auth', authRoutes)
app.use('/api/payment', paymentRoutes)
app.use('/api/creem', creemRoutes)

app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

app.use('/api/*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

app.use(express.static(path.join(__dirname, '../client')))

app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../client/index.html'))
})

initDonationsTable().catch(console.error)

export default app
