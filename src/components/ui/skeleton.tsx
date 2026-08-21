// Skeleton(스켈레톤): 데이터를 불러오는 동안 잠깐 보여주는 회색 자리표시자 박스입니다.
// animate-pulse로 깜빡이며 "로딩 중"임을 시각적으로 알려줍니다.
import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton };
