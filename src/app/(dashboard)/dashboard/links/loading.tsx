// 파일 목적: 링크 목록 페이지의 데이터를 불러오는 동안 보여주는 로딩 화면입니다.
//   (loading.tsx = 데이터 준비 중 자동으로 뜨는 임시 화면, Skeleton은 자리표시용 회색 박스)
import { Skeleton } from "@/components/ui/skeleton";

export default function LinksLoading() {
  return (
    <div>
      <Skeleton className="h-8 w-32" />
      <Skeleton className="mt-2 h-4 w-64" />
      <div className="mt-6 flex gap-3">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 w-40" />
      </div>
      <div className="mt-4 space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    </div>
  );
}
