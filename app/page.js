"use client";

import Image from "next/image";
import { useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Alert,
} from "@nextui-org/react";

export default function Home() {
  const [link, setLink] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [formats, setFormats] = useState([]);
  const [clickedIndex, setClickedIndex] = useState(null);
  const [validLink, setValidLink] = useState(true);

  const buttonStyle =
    "rounded-lg border border-solid flex items-center justify-center text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44 ";

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleDownload = async () => {
    setDownloading(true);

    try {
      const response = await fetch(
        `http://localhost:3001/download?url=${encodeURIComponent(link)}`
      );
      if (!response.ok) {
        await delay(2000);
        setValidLink(false);
        setLink("");
        return;
      }

      setValidLink(true);

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = "video.mp4";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);

      setLink("");
    } catch (error) {
      console.error("Error downloading video:", error);
      setValidLink(false);
    } finally {
      setDownloading(false);
    }
  };

  const handleInfo = async () => {
    setFetching(true);

    try {
      const response = await fetch(
        `http://localhost:3001/info?url=${encodeURIComponent(link)}`
      );
      if (!response.ok) {
        setValidLink(false);
        return;
      }

      setValidLink(true);

      const info = await response.json();
      setFormats(info);
    } catch (error) {
      console.error("Error fetching video info:", error);
      alert("Error fetching video info");
    } finally {
      setFetching(false);
    }
  };

  const handleClear = () => {
    setFormats([]);
    setLink("");
  };

  const handleSpecificDownload = async (format, index) => {
    setClickedIndex(index);
    setDownloading(true);

    try {
      const response = await fetch(
        `http://localhost:3001/specificdownload?url=${encodeURIComponent(
          link
        )}&format=${encodeURIComponent(JSON.stringify(format))}`
      );
      if (!response.ok) {
        throw new Error("Failed to download video");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `video.${format.container}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading video:", error);
      alert("Error downloading video");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
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
        {/* <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        /> */}
        <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="mb-2">
            Please read the disclaimer before using this service.
            {/* <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-semibold">
              app/page.js
            </code>
            . */}
          </li>
          <li>
            Choosing the desired specification of the video to download when the
            processing is ready.
          </li>
        </ol>

        {formats.length === 0 ? (
          <div className="flex gap-4 items-center flex-col sm:flex-row">
            <label className="sr-only" htmlFor="link">
              YouTube link
            </label>
            <input
              className="block w-full sm:w-96 px-4 py-2 border border-solid border-black/[.08] dark:border-white/[.145] rounded placeholder-black/[.5] dark:placeholder-white/[.5] focus:outline-none focus:border-black/[.2] dark:focus:border-white/[.2] focus:ring-2 focus:ring-black/[.1] dark:focus:ring-white/[.1] dark:bg-black/[.05] dark:text-white/[.9] transition-colors"
              id="link"
              type="url"
              placeholder="Link here"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
            <div className="transition-all duration-1000 ease-in-out">
              {!downloading ? (
                <button
                  className={
                    buttonStyle +
                    "border-transparent transition-colors bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc]"
                  }
                  onClick={handleDownload}
                  disabled={!link}
                >
                  Download
                </button>
              ) : (
                <button
                  className={
                    "animate-pulse " +
                    buttonStyle +
                    "border-black/[.08] dark:border-white/[.145] transition-colors"
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
                    "border-black/[.08] dark:border-white/[.145] transition-colors hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent"
                  }
                  onClick={handleInfo}
                  disabled={!link}
                >
                  More options
                </button>
              ) : (
                <button
                  className={
                    "animate-pulse " +
                    buttonStyle +
                    "border-black/[.08] dark:border-white/[.145] transition-colors hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent"
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
                "border-black/[.08] dark:border-white/[.145] transition-colors hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent"
              }
              onClick={handleClear}
            >
              Back
            </button>
          </div>
        )}

        {formats.length > 0 && (
          <div className="w-full mt-8">
            <Table aria-label="video specification table">
              <TableHeader>
                <TableColumn>Quality</TableColumn>
                <TableColumn>Format</TableColumn>
                <TableColumn>Audio</TableColumn>
                <TableColumn></TableColumn>
              </TableHeader>
              <TableBody>
                {formats.map((format, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-center">
                      {format.quality}
                    </TableCell>
                    <TableCell className="text-center">
                      {format.container}
                    </TableCell>
                    <TableCell className="text-center">
                      {format.hasAudio ? "Yes" : "No"}
                    </TableCell>
                    <TableCell className="flex justify-center items-center text-center">
                      <button
                        className={
                          buttonStyle +
                          " sm:min-w-20 border-black/[.08] dark:border-white/[.145] transition-colors " +
                          (downloading
                            ? ""
                            : "hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent")
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
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://github.com/igloo-9/tubing"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Code
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href=""
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Disclaimer
        </a>
      </footer>
    </div>
  );
}
