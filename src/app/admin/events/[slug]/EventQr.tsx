"use client";

import { QRCodeSVG } from "qrcode.react";
import QRCode from "qrcode";
import { useState } from "react";

type Props = {
  url: string;
  eventName?: string;
  eventDate?: string;
  venue?: string;
  host?: string | null;
  slug?: string;
};

const formatDate = (d?: string) => {
  if (!d) return "";
  try {
    const [y, m, day] = d.split("-").map(Number);
    const date = new Date(y, m - 1, day);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return d;
  }
};

export default function EventQr({
  url,
  eventName = "Event RSVP",
  eventDate,
  venue = "",
  host,
  slug,
}: Props) {
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const formattedDate = formatDate(eventDate);

  async function handlePrint() {
    try {
      setIsPrinting(true);

      // Generate crisp vector SVG for the print sheet (no async image decode lag)
      const svgString = await QRCode.toString(url, {
        type: "svg",
        margin: 1,
        color: {
          dark: "#150705",
          light: "#ffffff",
        },
      });

      const printHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Table QR - ${eventName}</title>
            <style>
              @page {
                size: auto;
                margin: 12mm;
              }
              * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
              }
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                background: #ffffff;
                color: #150705;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                padding: 16px;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .table-card {
                width: 100%;
                max-width: 440px;
                border: 3px solid #150705;
                border-radius: 20px;
                padding: 36px 28px;
                text-align: center;
                background: #ffffff;
                margin: auto;
              }
              .badge {
                display: inline-block;
                background: #150705;
                color: #f7b731;
                font-size: 11px;
                font-weight: 800;
                letter-spacing: 0.35em;
                text-transform: uppercase;
                padding: 6px 16px;
                border-radius: 9999px;
                margin-bottom: 18px;
              }
              .event-title {
                font-size: 28px;
                font-weight: 900;
                text-transform: uppercase;
                letter-spacing: 0.04em;
                color: #150705;
                line-height: 1.15;
                margin-bottom: 8px;
              }
              .event-meta {
                font-size: 14px;
                color: #555555;
                font-weight: 500;
                margin-bottom: 24px;
              }
              .qr-container {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                background: #ffffff;
                padding: 16px;
                border: 2px dashed #150705;
                border-radius: 16px;
                margin-bottom: 20px;
              }
              .qr-container svg {
                display: block;
                width: 230px;
                height: 230px;
              }
              .scan-kicker {
                font-size: 18px;
                font-weight: 800;
                text-transform: uppercase;
                letter-spacing: 0.15em;
                color: #150705;
                margin-bottom: 8px;
              }
              .instructions {
                font-size: 13px;
                color: #555555;
                line-height: 1.5;
                max-width: 320px;
                margin: 0 auto 20px auto;
              }
              .footer-rule {
                border-top: 1px solid #dddddd;
                padding-top: 14px;
                font-size: 11px;
                letter-spacing: 0.2em;
                text-transform: uppercase;
                color: #888888;
                font-weight: 600;
              }
              @media print {
                body {
                  min-height: auto;
                  padding: 0;
                }
                .table-card {
                  box-shadow: none;
                  page-break-inside: avoid;
                }
              }
            </style>
          </head>
          <body>
            <div class="table-card">
              <div class="badge">★ TABLE RSVP ★</div>
              <h1 class="event-title">${eventName}</h1>
              <p class="event-meta">${formattedDate ? formattedDate + " · " : ""}${venue}${host ? " · Hosted by " + host : ""}</p>
              
              <div class="qr-container">
                ${svgString}
              </div>

              <p class="scan-kicker">SCAN TO JOIN GUESTLIST</p>
              <p class="instructions">
                Open your phone's camera and point it at the code to claim your spot on tonight's list.
              </p>
              <p class="footer-rule">Free Admission · Instant Confirmation</p>
            </div>
          </body>
        </html>
      `;

      // Use a hidden iframe for seamless printing without blank popup issues
      let iframe = document.getElementById("qr-print-frame") as HTMLIFrameElement | null;
      if (!iframe) {
        iframe = document.createElement("iframe");
        iframe.id = "qr-print-frame";
        iframe.style.position = "fixed";
        iframe.style.right = "0";
        iframe.style.bottom = "0";
        iframe.style.width = "0";
        iframe.style.height = "0";
        iframe.style.border = "none";
        document.body.appendChild(iframe);
      }

      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(printHtml);
        doc.close();

        // Give the iframe document a brief moment to finish layout before opening print dialog
        setTimeout(() => {
          iframe?.contentWindow?.focus();
          iframe?.contentWindow?.print();
          setIsPrinting(false);
        }, 150);
      } else {
        // Fallback popup if iframe document is inaccessible
        const win = window.open("", "_blank");
        if (win) {
          win.document.open();
          win.document.write(printHtml);
          win.document.close();
          setTimeout(() => {
            win.focus();
            win.print();
            setIsPrinting(false);
          }, 250);
        } else {
          setIsPrinting(false);
        }
      }
    } catch (err) {
      console.error("Print error:", err);
      setIsPrinting(false);
    }
  }

  async function handleDownload() {
    try {
      setIsDownloading(true);
      const dataUrl = await QRCode.toDataURL(url, {
        width: 1024,
        margin: 2,
        color: {
          dark: "#150705",
          light: "#ffffff",
        },
      });

      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `table-qr-${slug || "event"}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("Download QR error:", err);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="relative flex flex-col justify-between rounded-2xl border border-gold/25 bg-cream p-5">
      <span className="absolute left-1/2 top-2 z-10 -translate-x-1/2 rounded-sm bg-ink px-3 py-1 font-display text-[9px] tracking-[0.35em] text-gold">
        TABLE QR
      </span>

      <div className="mt-4 flex items-center justify-center rounded-lg bg-ink/5 p-4">
        <QRCodeSVG
          value={url}
          size={160}
          level="M"
          bgColor="#f6ead6"
          fgColor="#150705"
          includeMargin={false}
        />
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <button
          onClick={handlePrint}
          disabled={isPrinting}
          className="btn w-full bg-ink py-2.5 text-xs tracking-wider text-gold hover:bg-brick transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          {isPrinting ? "PREPARING…" : "🖨️ PRINT TABLE QR"}
        </button>

        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="btn w-full border border-ink/20 bg-transparent py-2 text-xs tracking-wider text-ink hover:bg-ink/5 transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          {isDownloading ? "SAVING…" : "📥 DOWNLOAD PNG"}
        </button>
      </div>
    </div>
  );
}