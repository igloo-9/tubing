const express = require('express')
const ytdl = require('@distube/ytdl-core')
const cors = require('cors')
const { createProxyMiddleware } = require('http-proxy-middleware')
const axios = require('axios')

const app = express()

app.use(cors())

// proxy middleware configuration
async function getRandomProxy() {
  try {
    const response = await axios.get(
      'https://www.proxy-list.download/api/v1/get?type=https',
    )
    const proxies = response.data.split('\r\n').filter(Boolean)
    const randomProxy = proxies[Math.floor(Math.random() * proxies.length)]
    return randomProxy
  } catch (error) {
    console.error('Error fetching proxy list:', error)
    return null
  }
}
// use the proxy middleware for YouTube requests
app.use('/youtube', async (req, res, next) => {
  const proxy = await getRandomProxy()
  if (proxy) {
    const [host, port] = proxy.split(':')
    createProxyMiddleware({
      target: 'https://www.youtube.com',
      changeOrigin: true,
      proxyTimeout: 5000,
      onProxyReq: (proxyReq, req, res) => {
        proxyReq.setHeader('Host', 'www.youtube.com')
        proxyReq.setHeader('X-Forwarded-For', host)
      },
      onError: (err, req, res) => {
        console.error('Proxy error:', err)
        res.status(500).json({ error: 'Proxy error', details: err.message })
      },
      agent: new (require('https').Agent)({
        host,
        port,
        keepAlive: true,
      }),
    })(req, res, next)
  } else {
    res.status(500).json({ error: 'Failed to get proxy' })
  }
})

app.get('/api/download', async (req, res) => {
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
