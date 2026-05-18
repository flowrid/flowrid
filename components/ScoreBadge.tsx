/**
 * Score Badge — 评分徽章组件
 *
 * 0–100 分制
 * 90+ = 绿色 (Success)
 * 70–89 = 蓝色 (Primary)
 * <70 = 灰色
 */
export default function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 90 ? "bg-success" : score >= 70 ? "bg-primary" : "bg-gray-400";

  return (
    <span
      className={`inline-flex items-center justify-center ${color} text-white text-sm font-bold rounded-lg min-w-[3rem] h-8 px-2`}
    >
      {score}
    </span>
  );
}
