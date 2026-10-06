import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type ProxyOptions, type Plugin } from 'vite'
import { v2 as cloudinary } from 'cloudinary'
import { getGcalSources } from './gcal-sources.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // İkinci argüman '' -> yalnızca VITE_ önekli değil, TÜM .env
  // değişkenlerini oku (GCAL_ICS_URL'nin tarayıcıya sızmaması için
  // bilinçli olarak VITE_ öneki yok — bkz. .env.example).
  const env = loadEnv(mode, process.cwd(), '')
  const gcalSources = getGcalSources(env)
  const ollamaUrl = env.OLLAMA_URL || 'http://localhost:11434'

  const proxy: Record<string, ProxyOptions> = {}
  // Ollama'nın yerel API'sine de aynı sebeple (CORS) proxy üzerinden
  // gidiyoruz — bu şekilde OLLAMA_ORIGINS ayarıyla uğraşmaya gerek kalmıyor.
  proxy['/api/ollama'] = {
    target: ollamaUrl,
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api\/ollama/, ''),
  }

  // Google Calendar artık birden fazla takvimi destekliyor (bkz. PLAN.md
  // Aşama 31, gcal-sources.js) — hangi istekte hangi takvime gidileceği
  // `?cal=<index>` query param'ına bağlı, basit bir `proxy` hedefiyle
  // (sabit bir origin/path'e yönlendiren) ifade edilemiyor. Bu yüzden
  // production'daki (server.js) mantığın aynısını burada da küçük bir
  // dev middleware olarak tekrarlıyoruz (bkz. uploadImageDevPlugin,
  // aynı desen).
  const gcalIcsDevPlugin: Plugin = {
    name: 'dev-gcal-ics',
    configureServer(server) {
      server.middlewares.use('/api/calendars', (_req, res) => {
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ calendars: gcalSources.map(({ index, label }) => ({ index, label })) }))
      })
      server.middlewares.use('/api/calendar.ics', async (req, res) => {
        const url = new URL(req.url || '', 'http://localhost')
        const index = Number(url.searchParams.get('cal')) || 1
        const source = gcalSources.find((s) => s.index === index)
        if (!source) {
          res.statusCode = 404
          res.end()
          return
        }
        try {
          const upstream = await fetch(source.url)
          if (!upstream.ok) {
            res.statusCode = 502
            res.end()
            return
          }
          const text = await upstream.text()
          res.setHeader('Content-Type', 'text/calendar; charset=utf-8')
          res.end(text)
        } catch {
          res.statusCode = 502
          res.end()
        }
      })
    },
  }

  // Fotoğraf yükleme (bkz. PLAN.md Aşama 16) basit bir pass-through proxy
  // olamaz — Cloudinary SDK'sı sunucu tarafında imzalama/yükleme yapıyor.
  // Bu yüzden production'daki server.js ile aynı mantığı burada, sadece
  // `vite dev` sırasında çalışan küçük bir middleware olarak tekrarlıyoruz
  // — böylece Zeynep fotoğraf ekleme akışını `npm run dev` ile de test
  // edebiliyor, production'a deploy etmesi gerekmiyor.
  const cloudName = env.CLOUDINARY_CLOUD_NAME
  const apiKey = env.CLOUDINARY_API_KEY
  const apiSecret = env.CLOUDINARY_API_SECRET
  const cloudinaryConfigured = !!(cloudName && apiKey && apiSecret)
  if (cloudinaryConfigured) {
    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret })
  }

  const uploadImageDevPlugin: Plugin = {
    name: 'dev-upload-image',
    configureServer(server) {
      server.middlewares.use('/api/upload-image', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 404
          res.end()
          return
        }
        if (!cloudinaryConfigured) {
          res.statusCode = 503
          res.end(JSON.stringify({ error: 'image storage not configured' }))
          return
        }
        let body = ''
        req.on('data', (chunk) => { body += chunk })
        req.on('end', async () => {
          try {
            const parsed = JSON.parse(body)
            const image = parsed?.image
            if (typeof image !== 'string' || !image.startsWith('data:image/')) {
              res.statusCode = 400
              res.end(JSON.stringify({ error: 'invalid image' }))
              return
            }
            const result = await cloudinary.uploader.upload(image, {
              folder: 'muhendis-portal',
              resource_type: 'image',
            })
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ url: result.secure_url }))
          } catch (err) {
            console.error('[vite dev] Cloudinary yükleme hatası:', err)
            res.statusCode = 502
            res.end(JSON.stringify({ error: 'upload failed' }))
          }
        })
      })
    },
  }

  return {
    plugins: [react(), uploadImageDevPlugin, gcalIcsDevPlugin],
    // Bu proxy'ler SADECE `vite dev` sırasında çalışır — statik `vite
    // build` çıktısında sunucu tarafı yok. Google Calendar için yayına
    // alınca ayrı bir küçük sunucu/serverless fonksiyon gerekecek (bkz.
    // PLAN.md Aşama 12); Ollama zaten YALNIZCA bu bilgisayarda çalıştığı
    // için bu özellik doğası gereği hep yerel kalacak — hosting'e taşınsa
    // bile Ollama'ya erişim ancak aynı makineden mümkün olur.
    server: { proxy },
  }
})
