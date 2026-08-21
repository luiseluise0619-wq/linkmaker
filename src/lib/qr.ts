// 이 파일은 QR 코드를 만드는 함수 모음이다.
// QR 코드 = 카메라로 찍으면 바로 그 주소로 이동하는 정사각형 흑백 무늬.
// 핵심 규칙: QR 코드에는 항상 "짧은 주소(short URL)"만 담는다. 최종 목적지 주소를
// 나중에 바꿔도, 이미 인쇄/공유된 QR 코드가 계속 잘 작동하도록 하기 위해서다.
import QRCode from "qrcode";

/**
 * QR codes always encode the SHORT URL, never the destination — so changing
 * the destination later never invalidates a printed / shared QR code.
 */
// 주어진 주소로 QR 코드를 만들어 PNG 이미지 데이터(Buffer=바이트 덩어리)로 돌려준다.
// 파일 다운로드처럼 실제 이미지 파일이 필요할 때 사용한다. width: 512는 512픽셀 크기,
// errorCorrectionLevel "M"은 일부가 가려져도 인식되게 하는 오류 복원 수준(중간).
export async function qrPngBuffer(url: string): Promise<Buffer> {
  return QRCode.toBuffer(url, {
    type: "png",
    errorCorrectionLevel: "M",
    margin: 2,
    width: 512,
    color: { dark: "#000000", light: "#ffffff" },
  });
}

// QR 코드를 "data URL" 문자열로 돌려준다. data URL = 이미지 데이터를 문자열 안에
// 통째로 담은 주소로, <img src="..."> 에 바로 넣어 화면에 표시할 때 편리하다.
export async function qrDataUrl(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 256,
  });
}
