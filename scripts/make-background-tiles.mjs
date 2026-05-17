import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const assets =
  process.env.BG_ASSETS_DIR ||
  'C:/Users/xu3qo/.cursor/projects/c-Users-xu3qo-OneDrive-muzi-maison-app/assets'
const outDir = path.join(root, 'public/backgrounds')

function findDiamondSource() {
  if (process.env.DIAMOND_SRC && fs.existsSync(process.env.DIAMOND_SRC)) {
    return process.env.DIAMOND_SRC
  }
  const userLatest = path.join(
    assets,
    'c__Users_xu3qo_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_diamond-tile-729661fe-f0da-4262-bd8c-154d2b780d9f.png'
  )
  if (fs.existsSync(userLatest)) return userLatest
  const aiTileV2 = path.join(assets, 'diamond-tile-seamless-v2.png')
  if (fs.existsSync(aiTileV2)) return aiTileV2
  const files = fs.readdirSync(assets).filter((f) => f.includes('diamond') && f.endsWith('.png'))
  if (files.length) return path.join(assets, files[files.length - 1])
  throw new Error('找不到菱格紋來源圖')
}

async function makeDiamondFull(input, output) {
  await sharp(input)
    .resize(2560, 1440, { fit: 'cover', position: 'centre' })
    .webp({ quality: 88, effort: 6 })
    .toFile(output)
  const meta = await sharp(output).metadata()
  console.log(
    path.basename(output),
    `${meta.width}x${meta.height}`,
    `${(fs.statSync(output).size / 1024).toFixed(0)}KB`
  )
}

async function lightenMarble(input, output, size = 512) {
  await sharp(input)
    .resize(size, size, { fit: 'cover' })
    .modulate({ brightness: 1.16, saturation: 0.42 })
    .linear(0.9, 16)
    .blur(0.5)
    .webp({ quality: 88 })
    .toFile(output)
  console.log(path.basename(output), `${(fs.statSync(output).size / 1024).toFixed(1)}KB`)
}

fs.mkdirSync(outDir, { recursive: true })

const marbleRef = [
  path.join(assets, 'marble-tile-strong.png'),
  path.join(assets, 'bg-white-marble-reference.png'),
].find((p) => fs.existsSync(p))

await makeDiamondFull(findDiamondSource(), path.join(outDir, 'diamond-full.webp'))

if (marbleRef) {
  await lightenMarble(marbleRef, path.join(outDir, 'marble-tile.webp'), 512)
} else {
  console.log('略過 marble-tile.webp（找不到大理石來源圖）')
}

console.log('Done. 網站使用: diamond-full.webp + marble-tile.webp')
