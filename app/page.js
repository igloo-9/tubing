"use client";

import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [link, setLink] = useState("");
  const [downloading, setDownloading] = useState(false);

  const downloadButtonStyle =
    "rounded-lg border border-solid flex items-center justify-center text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44 ";

  const handleDownload = async () => {
    if (!link) {
      alert("Please enter a valid link");
      return;
    }

    setDownloading(true);

    try {
      const response = await fetch(
        `http://localhost:3001/download?url=${encodeURIComponent(link)}`
      );
      if (!response.ok) {
        throw new Error("Failed to download video");
      }

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
      alert("Error downloading video");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
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

        {/* <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our docs
          </a>
        </div> */}

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
                  downloadButtonStyle +
                  "border-transparent transition-colors bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc]"
                }
                onClick={handleDownload}
              >
                Download
              </button>
            ) : (
              <button
                className={
                  "animate-pulse " +
                  downloadButtonStyle +
                  "border-black/[.08] dark:border-white/[.145] transition-colors"
                }
                onClick={handleDownload}
                disabled={true}
              >
                Just a moment...
              </button>
            )}
          </div>
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        {/* <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
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
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
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
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a> */}
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
