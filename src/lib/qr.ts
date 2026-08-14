import QRCode from "qrcode";

/**
 * QR codes always encode the SHORT URL, never the destination — so changing
 * the destination later never invalidates a printed / shared QR code.
 */
export async function qrPngBuffer(url: string): Promise<Buffer> {
  return QRCode.toBuffer(url, {
    type: "png",
    errorCorrectionLevel: "M",
    margin: 2,
    width: 512,
    color: { dark: "#000000", light: "#ffffff" },
  });
}

export async function qrDataUrl(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 256,
  });
}
