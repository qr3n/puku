import { readFile } from "node:fs/promises"
import { resolve } from "node:path"
import { promisify } from "node:util"
import { brotliDecompress } from "node:zlib"
import type { NextApiRequest, NextApiResponse } from "next"

const assets = resolve("../../packages/ui/assets/lottie")
const decompress = promisify(brotliDecompress)

function acceptsBrotli(header: string | undefined) {
  const encodings = header
    ?.toLowerCase()
    .split(",")
    .map((entry) => {
      const [encoding, ...params] = entry.trim().split(";")
      const quality = params.find((param) => param.trim().startsWith("q="))
      return [
        encoding?.trim(),
        quality ? Number(quality.trim().slice(2)) : 1,
      ] as const
    })
  const quality =
    encodings?.find(([encoding]) => encoding === "br")?.[1] ??
    encodings?.find(([encoding]) => encoding === "*")?.[1] ??
    0

  return quality > 0 && quality <= 1
}

// The App Router drops Content-Encoding from Route Handler responses.
export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.setHeader("Allow", "GET, HEAD")
    response.status(405).end()
    return
  }

  const { asset } = request.query
  if (
    typeof asset !== "string" ||
    !/^[a-z]+(?:-[a-z]+)*\.(json|webp)$/.test(asset)
  ) {
    response.status(404).end()
    return
  }

  const isAnimation = asset.endsWith(".json")
  const file = isAnimation ? `${asset}.br` : asset

  let bytes: Buffer
  try {
    bytes = await readFile(resolve(assets, file))
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      response.status(404).end()
      return
    }
    throw error
  }

  response.setHeader("Cache-Control", "public, max-age=86400")
  response.setHeader(
    "Content-Type",
    isAnimation ? "application/json" : "image/webp"
  )
  if (isAnimation) {
    response.setHeader("Vary", "Accept-Encoding")
    if (acceptsBrotli(request.headers["accept-encoding"])) {
      response.setHeader("Content-Encoding", "br")
    } else {
      bytes = await decompress(bytes)
    }
  }

  response.setHeader("Content-Length", bytes.byteLength)
  response.end(request.method === "HEAD" ? undefined : bytes)
}
