import express from 'express'
import cors from 'cors'
import fetch from 'node-fetch'
const app = express()
const PORT = 3001

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Keep-alive para mantener conexiones activas
app.use((req, res, next) => {
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('Keep-Alive', 'timeout=5, max=1000')
  next()
})

// Proxy para LinkedIn
app.post('/linkedin/token', async (req, res) => {
  try {
    const { code, client_id, client_secret, redirect_uri } = req.body
    console.log('Proxy: Token exchange request received')
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 segundos timeout
    
    const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirect_uri,
        client_id: client_id,
        client_secret: client_secret,
      }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)
    const data = await response.json()
    console.log('Proxy: Token exchange successful')
    res.json(data)
  } catch (error) {
    console.error('Proxy: Error in LinkedIn token exchange:', error)
    res.status(500).json({ error: error.message })
  }
})

// Proxy para LinkedIn API
app.get('/linkedin/profile', async (req, res) => {
  try {
    const { access_token } = req.query
    console.log('Proxy: Profile fetch request received')
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 segundos timeout
    
    const response = await fetch('https://api.linkedin.com/v2/people/~', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'X-Restli-Protocol-Version': '2.0.0',
      },
      signal: controller.signal
    })

    clearTimeout(timeoutId)
    const data = await response.json()
    console.log('Proxy: Profile fetch successful')
    res.json(data)
  } catch (error) {
    console.error('Proxy: Error fetching LinkedIn profile:', error)
    res.status(500).json({ error: error.message })
  }
})

// Proxy para LinkedIn email
app.get('/linkedin/email', async (req, res) => {
  try {
    const { access_token } = req.query
    console.log('Proxy: Email fetch request received')
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 6000) // 6 segundos timeout
    
    const response = await fetch('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'X-Restli-Protocol-Version': '2.0.0',
      },
      signal: controller.signal
    })

    clearTimeout(timeoutId)
    const data = await response.json()
    console.log('Proxy: Email fetch successful')
    res.json(data)
  } catch (error) {
    console.error('Proxy: Error fetching LinkedIn email:', error)
    res.status(500).json({ error: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`)
})
