import fs from 'node:fs'
import process from 'node:process'
import { randomUUID } from 'node:crypto'
import admin from 'firebase-admin'
import sharp from 'sharp'

const PROJECT_ID = 'muzi-maison-db'
const BUCKET_NAME = 'muzi-maison-db.firebasestorage.app'

function parseArgs(argv) {
  const args = { limit: 0, force: false }
  argv.forEach((arg) => {
    if (arg.startsWith('--limit=')) {
      const n = Number(arg.replace('--limit=', ''))
      args.limit = Number.isFinite(n) ? Math.max(0, n) : 0
    } else if (arg === '--force') {
      args.force = true
    }
  })
  return args
}

function buildFirebaseDownloadUrl(bucketName, objectPath, token) {
  return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(objectPath)}?alt=media&token=${token}`
}

function getCredential() {
  const serviceAccountFile =
    process.env.FIREBASE_SERVICE_ACCOUNT_FILE || process.env.GOOGLE_APPLICATION_CREDENTIALS

  if (serviceAccountFile && fs.existsSync(serviceAccountFile)) {
    const json = JSON.parse(fs.readFileSync(serviceAccountFile, 'utf8'))
    return admin.credential.cert(json)
  }
  return admin.credential.applicationDefault()
}

async function fetchImageBuffer(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`download failed (${res.status})`)
  const arr = await res.arrayBuffer()
  return Buffer.from(arr)
}

async function main() {
  const { limit, force } = parseArgs(process.argv.slice(2))
  console.log('[thumb-migrate] start', { limit, force })

  admin.initializeApp({
    credential: getCredential(),
    projectId: PROJECT_ID,
    storageBucket: BUCKET_NAME
  })

  const db = admin.firestore()
  const bucket = admin.storage().bucket(BUCKET_NAME)

  const snapshot = await db.collection('products').get()
  const allProducts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  let targets = allProducts.filter((p) => p.image && (force || !p.thumbUrl))
  if (limit > 0) targets = targets.slice(0, limit)

  console.log(`[thumb-migrate] products=${allProducts.length}, targets=${targets.length}`)
  if (targets.length === 0) {
    console.log('[thumb-migrate] nothing to migrate')
    return
  }

  let success = 0
  let failed = 0

  for (let i = 0; i < targets.length; i += 1) {
    const product = targets[i]
    const label = `${i + 1}/${targets.length} ${product.id}`
    try {
      console.log(`[thumb-migrate] processing ${label}`)
      const original = await fetchImageBuffer(product.image)
      const thumbBuffer = await sharp(original).resize({ width: 480, withoutEnlargement: true }).webp({ quality: 78 }).toBuffer()

      const objectPath = `products/thumbs/${product.id}_${Date.now()}.webp`
      const token = randomUUID()
      await bucket.file(objectPath).save(thumbBuffer, {
        metadata: {
          contentType: 'image/webp',
          cacheControl: 'public,max-age=31536000,immutable',
          metadata: {
            firebaseStorageDownloadTokens: token
          }
        }
      })

      const thumbUrl = buildFirebaseDownloadUrl(BUCKET_NAME, objectPath, token)
      await db.collection('products').doc(product.id).set({ thumbUrl }, { merge: true })
      success += 1
      console.log(`[thumb-migrate] ok ${label}`)
    } catch (error) {
      failed += 1
      console.error(`[thumb-migrate] failed ${label}: ${error.message}`)
    }
  }

  console.log(`[thumb-migrate] done success=${success} failed=${failed}`)
  if (failed > 0) process.exitCode = 1
}

main().catch((error) => {
  console.error('[thumb-migrate] fatal:', error)
  process.exit(1)
})
