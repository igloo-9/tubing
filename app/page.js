'use client'

import Image from 'next/image'
import { useState } from 'react'
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Alert,
  Tooltip,
} from '@nextui-org/react'

export default function Home() {
  const [link, setLink] = useState('')
  const [downloading, setDownloading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [formats, setFormats] = useState([])
  const [clickedIndex, setClickedIndex] = useState(null)
  const [validLink, setValidLink] = useState(true)

  const buttonStyle =
    'rounded-lg border border-solid flex items-center justify-center text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44 '

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

  const handleDownload = async () => {
    setDownloading(true)

    try {
      const response = await fetch(
        `http://localhost:3001/download?url=${encodeURIComponent(link)}`,
      )
      if (!response.ok) {
        await delay(2000)
        setValidLink(false)
        setLink('')
        return
      }

      setValidLink(true)

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = 'video.mp4'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)

      setLink('')
    } catch (error) {
      console.error('Error downloading video:', error)
    } finally {
      setDownloading(false)
    }
  }

  const handleInfo = async () => {
    setFetching(true)

    try {
      const response = await fetch(
        `http://localhost:3001/info?url=${encodeURIComponent(link)}`,
      )
      if (!response.ok) {
        await delay(2000)
        setValidLink(false)
        setLink('')
        return
      }

      setValidLink(true)

      const info = await response.json()
      setFormats(info)
    } catch (error) {
      console.error('Error fetching video info:', error)
    } finally {
      setFetching(false)
    }
  }

  const handleClear = () => {
    setFormats([])
    setLink('')
  }

  const handleSpecificDownload = async (format, index) => {
    setClickedIndex(index)
    setDownloading(true)

    try {
      const response = await fetch(
        `http://localhost:3001/specificdownload?url=${encodeURIComponent(
          link,
        )}&format=${encodeURIComponent(JSON.stringify(format))}`,
      )
      if (!response.ok) {
        throw new Error('Failed to download video')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `video.${format.container}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading video:', error)
      alert('Error downloading video')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start -mt-20">
        {!validLink && (
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 mt-4">
            <Alert
              key="flat"
              color="danger"
              title="Please provide a valid YouTube link"
              variant="flat"
            />
          </div>
        )}
        {formats.length === 0 ? (
          <img src="/logo.svg" alt="Logo" width={240} height={80} />
        ) : (
          <img src="/smlogo.svg" alt="Small Logo" width={80} height={80} />
        )}
        {formats.length === 0 ? (
          <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
            <li className="mb-2">
              Please read the disclaimer before using this service.
            </li>
            <li className="mb-2">
              Download in default format or choose the desired audio and video
              quality by checking more options.
            </li>
            <li className="mb-2">
              Write to me with your feedback and perhaps buy me a coffee {`<`}3
            </li>
          </ol>
        ) : (
          <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
            <li className="mb-2">
              Choose the desired audio and video quality (please note that not
              all formats support audio.)
            </li>
            <li className="mb-2">Any kind of support is appreciated {`<`}3</li>
          </ol>
        )}

        {formats.length === 0 ? (
          <div className="flex gap-4 items-center flex-col sm:flex-row">
            <label className="sr-only" htmlFor="link">
              YouTube link
            </label>
            <input
              className="block w-full sm:w-96 px-4 py-2 border border-solid border-black/[.08] dark:border-white/[.145] rounded placeholder-black/[.5] dark:placeholder-white/[.5] focus:outline-none focus:border-black/[.2] dark:focus:border-white/[.2] focus:ring-2 focus:ring-black/[.1] dark:focus:ring-white/[.1] dark:bg-black/[.05] dark:text-white/[.9] transition-colors"
              id="link"
              type="url"
              placeholder="YouTube link here"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
            <div className="transition-all duration-1000 ease-in-out">
              {!downloading ? (
                <button
                  className={
                    buttonStyle +
                    'border-transparent transition-colors bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc]'
                  }
                  onClick={handleDownload}
                  disabled={!link}
                >
                  Download
                </button>
              ) : (
                <button
                  className={
                    'animate-pulse ' +
                    buttonStyle +
                    'border-black/[.08] dark:border-white/[.145] transition-colors'
                  }
                  disabled={true}
                >
                  Just a moment...
                </button>
              )}
            </div>
            <div className="transition-all duration-1000 ease-in-out">
              {!fetching ? (
                <button
                  className={
                    buttonStyle +
                    'border-black/[.08] dark:border-white/[.145] transition-colors hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent'
                  }
                  onClick={handleInfo}
                  disabled={!link}
                >
                  More options
                </button>
              ) : (
                <button
                  className={
                    'animate-pulse ' +
                    buttonStyle +
                    'border-black/[.08] dark:border-white/[.145] transition-colors hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent'
                  }
                >
                  Just a moment...
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="transition-all duration-1000 ease-in-out">
            <button
              className={
                buttonStyle +
                'border-black/[.08] dark:border-white/[.145] transition-colors hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent'
              }
              onClick={handleClear}
            >
              Back
            </button>
          </div>
        )}

        {formats.length > 0 && (
          <div className="w-full mt-8">
            <Table className="dark" aria-label="video specification table">
              <TableHeader>
                <TableColumn>Quality</TableColumn>
                <TableColumn>Format</TableColumn>
                <TableColumn>Audio</TableColumn>
                <TableColumn></TableColumn>
              </TableHeader>
              <TableBody>
                {formats.map((format, index) => (
                  <TableRow key={index}>
                    <TableCell>{format.quality}</TableCell>
                    <TableCell>{format.container}</TableCell>
                    <TableCell>{format.hasAudio ? 'Yes' : 'No'}</TableCell>
                    <TableCell className="flex justify-center items-center text-center">
                      <button
                        className={
                          buttonStyle +
                          ' sm:min-w-20 border-black/[.08] dark:border-white/[.145] transition-colors ' +
                          (downloading
                            ? ''
                            : 'hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent')
                        }
                        onClick={() => handleSpecificDownload(format, index)}
                        disabled={downloading}
                      >
                        {clickedIndex === index && downloading ? (
                          <img
                            src="/loading.gif"
                            alt="Loading"
                            width={24}
                            height={24}
                          />
                        ) : (
                          <Image
                            aria-hidden
                            src="/download.svg"
                            alt="Download icon"
                            width={16}
                            height={16}
                          />
                        )}
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
      <footer className="row-start-3 flex gap-12 flex-wrap items-center justify-center">
        <Tooltip
          className="dark"
          content={
            <span>
              If you use Chrome, <br /> kindly refer to{' '}
              <a
                href="https://support.google.com/chrome/thread/57026170/how-to-add-gmail-as-default-mailto-handler?hl=en"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                this guide
              </a>{' '}
              if having trouble emailing
            </span>
          }
          placement="top"
        >
          <a
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="mailto:ikcyr@hotmail.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              aria-hidden
              src="/voicemail.svg"
              alt="Voicemail icon"
              width={22}
              height={22}
            />
            Contact me
          </a>
        </Tooltip>
        <Tooltip
          className="dark"
          content={
            <div className="px-1 py-2">
              <div className="text-small font-bold">
                This service is provided for educational and personal use only!
              </div>
              <div className="text-tiny">
                Downloading videos from YouTube may violate YouTube's terms of
                service. It is your responsibility to ensure that your use of
                this service complies with all applicable laws and regulations.
              </div>
              <div className="text-tiny">
                We do not endorse or condone the illegal downloading or
                distribution of copyrighted content.
              </div>
              <div className="text-tiny">
                By using this service, you agree to assume all risks and
                liabilities associated with the use of this service.
              </div>
            </div>
          }
          placement="top"
        >
          <a
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href=""
            rel="noopener noreferrer"
          >
            <Image
              aria-hidden
              src="/scroll.svg"
              alt="Scroll icon"
              width={20}
              height={20}
            />
            Disclaimer
          </a>
        </Tooltip>

        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://paypal.me/ikcyr?country.x=US&locale.x=en_US"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/paypal.svg"
            alt="Paypal icon"
            width={16}
            height={16}
          />
          Send love
        </a>
      </footer>
    </div>
  )
}
