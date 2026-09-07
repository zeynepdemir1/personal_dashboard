import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type ProxyOptions, type Plugin } from 'vite'
import { v2 as cloudinary } from 'cloudinary'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // İkinci argüman '' -> yalnızca VITE_ önekli değil, TÜM .env
  // değişkenlerini oku (GCAL_ICS_URL'nin tarayıcıya sızmaması için
  // bilinçli olarak VITE_ öneki yok — bkz. .env.example).
  const env = loadEnv(mode, process.cwd(), '')
  const icsUrl = env.GCAL_ICS_URL
  const ollamaUrl = env.OLLAMA_URL || 'http://localhost:11434'

  const proxy: Record<string, ProxyOptions> = {}
  if (icsUrl) {
    const parsed = new URL(icsUrl)
    proxy['/api/calendar.ics'] = {
      target: parsed.origin,
      changeOrigin: true,
      rewrite: () => parsed.pathname + parsed.search,
    }
  }
  // Ollama'nın yerel API'sine de aynı sebeple (CORS) proxy üzerinden
  // gidiyoruz — bu şekilde OLLAMA_ORIGINS ayarıyla uğraşmaya gerek kalmıyor.
  proxy['/api/ollama'] = {
    target: ollamaUrl,
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api\/ollama/, ''),
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
    plugins: [react(), uploadImageDevPlugin],
    // Bu proxy'ler SADECE `vite dev` sırasında çalışır — statik `vite
    // build` çıktısında sunucu tarafı yok. Google Calendar için yayına
    // alınca ayrı bir küçük sunucu/serverless fonksiyon gerekecek (bkz.
    // PLAN.md Aşama 12); Ollama zaten YALNIZCA bu bilgisayarda çalıştığı
    // için bu özellik doğası gereği hep yerel kalacak — hosting'e taşınsa
    // bile Ollama'ya erişim ancak aynı makineden mümkün olur.
    server: { proxy },
  }
})
