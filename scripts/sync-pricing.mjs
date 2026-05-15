import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const src = path.join(root, 'src', 'shared', 'orderPricing.js')
const dest = path.join(root, 'functions', 'orderPricing.mjs')

fs.copyFileSync(src, dest)
console.log('sync-pricing: copied', src, '->', dest)
