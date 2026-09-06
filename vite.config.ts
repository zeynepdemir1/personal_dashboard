import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type ProxyOptions } from 'vite'

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

  return {
    plugins: [react()],
    // Bu proxy'ler SADECE `vite dev` sırasında çalışır — statik `vite
    // build` çıktısında sunucu tarafı yok. Google Calendar için yayına
    // alınca ayrı bir küçük sunucu/serverless fonksiyon gerekecek (bkz.
    // PLAN.md Aşama 12); Ollama zaten YALNIZCA bu bilgisayarda çalıştığı
    // için bu özellik doğası gereği hep yerel kalacak — hosting'e taşınsa
    // bile Ollama'ya erişim ancak aynı makineden mümkün olur.
    server: { proxy },
  }
})
