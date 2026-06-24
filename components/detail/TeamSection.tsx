import { getTranslations } from "next-intl/server";

interface TeamSectionProps {
  name: string;
}

/** 生成团队成员占位数据 */
function generateTeam(name: string) {
  const firstNames = ["Michael", "Sarah", "David", "Jennifer", "Robert"];
  const lastNames = ["Chen", "Williams", "Garcia", "Johnson", "Lee"];
  const titleKeys: string[] = [
    "detail.ceo",
    "detail.vpOps",
    "detail.dirClient",
    "detail.headWarehouse",
    "detail.cto",
  ];

  // 使用公司名的hash一致性生成
  const hash = name.split("").reduce((s, c) => s + c.charCodeAt(0), 0);

  return firstNames.map((fn, i) => ({
    name: `${fn} ${lastNames[(hash + i) % lastNames.length]}`,
    titleKey: titleKeys[i],
    color: ["#F97316", "#3B82F6", "#10B981", "#8B5CF6", "#EC4899"][i],
  }));
}

export default async function TeamSection({ name }: TeamSectionProps) {
  const t = await getTranslations();
  const team = generateTeam(name);

  return (
    <section>
      <h2 className="text-xl md:text-2xl font-bold text-text mb-1">{t("detail.teamHeading", { name })}</h2>
      <p className="text-text-secondary text-sm mb-4">
        {t("detail.teamDesc", { name })}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {team.map((member) => (
          <div key={member.name} className="bg-card border border-border rounded-xl overflow-hidden">
            {/* 头像占位 */}
            <div
              className="aspect-[3/4] flex items-center justify-center"
              style={{ backgroundColor: `${member.color}15` }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
                style={{ backgroundColor: member.color }}
              >
                {member.name.split(" ").map((n) => n[0]).join("")}
              </div>
            </div>
            <div className="p-3 text-center">
              <p className="font-medium text-text text-sm">{member.name}</p>
              <p className="text-xs text-text-secondary mt-0.5">{t(member.titleKey)}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
