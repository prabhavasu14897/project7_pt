"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { productConfig } from "@config/product.config";
import { fillTemplate, formatDay } from "@/lib/format";
import { routes } from "@/lib/routes";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { ListRow } from "@/components/ui/ListRow";
import { useJourney } from "@/features/journey/store";
import { SELF, memberFor, reportsFor } from "./healthData";
import { MemberTabs } from "./MemberTabs";

const { content, categories } = productConfig;
const strings = content.reports;
const labTestsHref = categories.find((item) => item.key === "lab-tests")?.href ?? "/explore";

export function ReportsScreen() {
  const state = useJourney();
  const params = useSearchParams();
  const member = memberFor(state, params.get("member"));
  const memberId = member?.id ?? SELF;
  const reports = reportsFor(state, memberId);

  return (
    <div className="container-page flex max-w-3xl flex-col gap-5 pb-12 pt-4 sm:pt-6 lg:pb-16 lg:pt-8">
      <Link href={routes.health(memberId)} className="inline-flex min-h-11 items-center gap-1 self-start text-sm text-text-muted hover:text-text">
        <Icon name="chevron-left" size={16} aria-hidden="true" />
        {strings.backToHealth}
      </Link>
      <div className="flex flex-col gap-1">
        <h1 className="text-h1 font-extrabold tracking-tight text-text">{strings.title}</h1>
        <p className="text-sm text-text-muted sm:text-body">{strings.subtitle}</p>
      </div>
      <MemberTabs members={state.familyMembers} value={memberId} />

      {reports.length > 0 ? (
        <Card padding="sm">
          <ul className="flex flex-col divide-y divide-border">
            {reports.map((report) => (
              <li key={report.id} className="py-1 first:pt-0 last:pb-0">
                <ListRow
                  href={report.href}
                  icon="lab-tests"
                  tone="lab-tests"
                  title={report.testName}
                  description={`${report.labName} · ${fillTemplate(strings.readyOn, { when: formatDay(report.reportedAt) })}`}
                  trailing={<span className="tabular">{fillTemplate(strings.reference, { id: report.id })}</span>}
                />
              </li>
            ))}
          </ul>
        </Card>
      ) : (
        <EmptyState
          icon="lab-tests"
          title={fillTemplate(strings.emptyTitle, { name: member?.name ?? "" })}
          description={strings.emptyBody}
          action={{ label: content.health.bookTest, href: labTestsHref }}
        />
      )}
    </div>
  );
}
