// 이 파일은 API(주소로 데이터를 주고받는 통로)의 "응답"을 일관된 모양으로
// 만들어 주는 도우미 모음이다. 성공은 { ok: true, data }, 실패는 { ok: false, error }
// 형태로 통일해서, 화면(프론트엔드) 쪽에서 결과를 처리하기 쉽게 한다.
// HTTP 상태 코드(예: 400=잘못된 요청, 401=로그인 필요, 404=없음)도 함께 담는다.
import { NextResponse } from "next/server";
// ZodError = 입력값 검사 라이브러리 Zod가 검사에 실패했을 때 던지는 오류 타입.
import { ZodError } from "zod";

// 성공 응답을 만든다. 결과 데이터를 { ok: true, data } 형태로 감싸서 돌려준다.
export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, init);
}

// 실패 응답을 만든다. 오류 메시지와 상태 코드(기본 400)를 담는다.
// ...extra 는 필요하면 추가 정보(예: 어느 입력칸이 틀렸는지)를 함께 넣는 부분.
export function jsonError(
  message: string,
  status = 400,
  extra?: Record<string, unknown>,
) {
  return NextResponse.json(
    { ok: false, error: message, ...extra },
    { status },
  );
}

// Zod 검사 실패를 응답으로 바꾼다. 첫 번째 오류 메시지를 대표로 보여주고,
// 상태 코드 422(입력값이 형식에 안 맞음)와 함께 칸별 오류 목록(fieldErrors)도 담는다.
export function handleZodError(error: ZodError) {
  const first = error.errors[0];
  return jsonError(first?.message ?? "Invalid input.", 422, {
    fieldErrors: error.flatten().fieldErrors,
  });
}

// 401 = 인증 안 됨(로그인/세션이 필요함).
export function jsonUnauthorized() {
  return jsonError("You must be signed in.", 401);
}

// 403 = 권한 없음(로그인은 했지만 이 자원에 접근할 자격이 없음).
export function jsonForbidden() {
  return jsonError("You do not have access to this resource.", 403);
}

// 404 = 찾을 수 없음(요청한 자원이 존재하지 않음).
export function jsonNotFound(what = "Resource") {
  return jsonError(`${what} not found.`, 404);
}
