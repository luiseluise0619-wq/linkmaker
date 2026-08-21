// 파일 목적: loading.tsx = 대시보드 데이터를 불러오는 "동안" 잠깐 보여주는 로딩 화면입니다.
//   Next.js가 페이지의 서버 데이터 조회가 끝날 때까지 이 뼈대(Skeleton) 화면을 자동으로 띄워
//   사용자가 빈 화면 대신 회색 자리표시를 보게 합니다. (Skeleton = 내용이 채워질 자리 표시)
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div>
      <Skeleton className="h-8 w-48" />
      <Skeleton className="mt-2 h-4 w-72" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-72 w-full lg:col-span-2" />
        <Skeleton className="h-72 w-full" />
      </div>
    </div>
  );
}
