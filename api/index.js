const express = require('express')
const ytdl = require('@distube/ytdl-core')
const ytdlc = require('ytdl-core')
const cors = require('cors')
const { createProxyMiddleware } = require('http-proxy-middleware')
const axios = require('axios')

const app = express()

app.use(cors())

// config
const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
const COOKIES = ''
const MAX_RETRIES = 3

// retry logic with exponential backoff
async function retryWithBackoff(fn, retries = 0) {
  try {
    return await fn()
  } catch (error) {
    if (retries >= MAX_RETRIES) throw error
    await new Promise((r) => setTimeout(r, Math.pow(2, retries) * 1000))
    return retryWithBackoff(fn, retries + 1)
  }
}

/* app.get('/api/download', async (req, res) => {
  const { url } = req.query

  if (!url) {
    return res.status(400).json({ error: 'URL is required' })
  }

  try {
    const now = new Date().toLocaleString()
    console.log(`[server] (${now}) Downloading video: ${url}`)

    res.setHeader('Content-Disposition', 'attachment; filename="video.mp4"')
    res.setHeader('Content-Type', 'video/mp4')

    const stream = ytdl(url, { filter: 'audioandvideo', quality: 'highest' })

    stream.pipe(res)

    stream.on('finish', () => {
      const finishedNow = new Date().toLocaleString()
      console.log(`[server] (${finishedNow}) Downloaded video: ${url}`)
    })

    stream.on('error', (error) => {
      console.error('Error downloading video:', error)
      res
        .status(500)
        .json({ error: 'Error downloading video', details: error.message })
    })
  } catch (error) {
    console.error('Error fetching video:', error)
    res
      .status(500)
      .json({ error: 'Internal server error', details: error.message })
  }
}) */

app.get('/api/download', async (req, res) => {
  const { url } = req.query
  if (!url) return res.status(400).json({ error: 'URL required' })

  try {
    const videoInfo = await retryWithBackoff(() =>
      ytdl.getInfo(url, {
        requestOptions: {
          headers: {
            'User-Agent': USER_AGENT,
            Cookie: COOKIES,
          },
        },
      }),
    )

    res.setHeader('Content-Disposition', 'attachment; filename="video.mp4"')
    res.setHeader('Content-Type', 'video/mp4')

    const stream = ytdl.downloadFromInfo(videoInfo, {
      quality: 'highest',
      filter: 'audioandvideo',
      requestOptions: {
        headers: {
          'User-Agent': USER_AGENT,
          Cookie: COOKIES,
        },
      },
    })

    stream.pipe(res)

    stream.on('error', (error) => {
      console.error('Stream error:', error)
      if (!res.headersSent) {
        res
          .status(500)
          .json({ error: 'Download failed', details: error.message })
      }
    })
  } catch (error) {
    console.error('Download error:', error)
    res.status(500).json({
      error: 'Download failed',
      details: error.message,
      retryAfter: '60 seconds',
    })
  }
})

app.get('/api/info', async (req, res) => {
  const { url } = req.query

  if (!url) {
    return res.status(400).json({ error: 'URL is required' })
  }

  try {
    const info = await ytdl.getInfo(url)
    const formats = info.formats.filter((format) => format.qualityLabel)

    const uniqueFormats = Array.from(
      new Set(
        formats.map(
          (format) =>
            `${format.qualityLabel}-${
              format.container
            }-${!!format.audioBitrate}`,
        ),
      ),
    ).map((key) => {
      const [quality, container, hasAudio] = key.split('-')
      return formats.find(
        (format) =>
          format.qualityLabel === quality &&
          format.container === container &&
          !!format.audioBitrate === (hasAudio === 'true'),
      )
    })

    const formatOptions = uniqueFormats.map((format) => ({
      quality: format.qualityLabel,
      container: format.container,
      audioBitrate: format.audioBitrate,
      hasAudio: !!format.audioBitrate,
      url: format.url,
    }))

    res.json(formatOptions)
  } catch (error) {
    console.error('Error fetching video info:', error)
    res
      .status(500)
      .json({ error: 'Internal server error', details: error.message })
  }
})

app.get('/api/specificdownload', async (req, res) => {
  const { url, format } = req.query
  const formatObj = JSON.parse(format)

  if (!format) {
    return res.status(400).json({ error: 'URL and format are required' })
  }

  try {
    const now = new Date().toLocaleString()
    console.log(
      `[server] (${now}) Downloading video: ${url} in format: ${format}`,
    )

    const extension = formatObj.container
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="video.` + extension + `"`,
    )
    res.setHeader('Content-Type', 'video/' + extension)

    // use stringified format object to leverage speed
    // using format object signifanctly slow down the download process\
    const filter = formatObj.hasAudio ? 'audioandvideo' : 'video'
    const stream = ytdl(url, {
      filter: filter,
      format: format,
    })

    stream.pipe(res)

    stream.on('finish', () => {
      const finishedNow = new Date().toLocaleString()
      console.log(`[server] (${finishedNow}) Downloaded video: ${url}`)
    })

    stream.on('error', (error) => {
      console.error('Error downloading video:', error)
      res
        .status(500)
        .json({ error: 'Error downloading video', details: error.message })
    })
  } catch (error) {
    console.error('Error fetching video:', error)
    res
      .status(500)
      .json({ error: 'Internal server error', details: error.message })
  }
})

module.exports = app
