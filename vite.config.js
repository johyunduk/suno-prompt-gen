import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { existsSync } from 'node:fs'
import path from 'node:path'

const ROOT = path.dirname(fileURLToPath(import.meta.url))

// 요청 본문을 JSON으로 모은다(이미지 base64 대비 넉넉히).
function readJsonBody(req) {
  return new Promise((resolve) => {
    let data = ''
    req.on('data', (chunk) => { data += chunk })
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}) } catch { resolve({}) }
    })
    req.on('error', () => resolve({}))
  })
}

// Node res를 Vercel 핸들러가 기대하는 형태(res.status().json())로 어댑트한다.
function adaptRes(res) {
  res.status = (code) => { res.statusCode = code; return res }
  res.json = (obj) => {
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(obj))
    return res
  }
  return res
}

// 개발 서버에서 /api/* 서버리스 함수를 그대로 실행해주는 플러그인.
// (운영은 Vercel이 처리하므로 dev에서만 적용)
function devApi(env) {
  return {
    name: 'dev-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next()

        const route = req.url.split('?')[0].replace(/^\/api\//, '')
        const modPath = path.join(ROOT, 'api', `${route}.js`)
        if (!route || !existsSync(modPath)) return next()

        try {
          req.body = await readJsonBody(req)
          // .env.local의 키를 핸들러(process.env)에서 쓸 수 있게 주입
          if (env.GEMINI_KEY) process.env.GEMINI_KEY = env.GEMINI_KEY
          const mod = await server.ssrLoadModule(modPath)
          await mod.default(req, adaptRes(res))
        } catch (e) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: e.message || '개발 서버 API 오류' }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ROOT, '')
  return {
    plugins: [react(), devApi(env)],
  }
})
