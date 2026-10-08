"use client";

import Link from "next/link";
import { productConfig } from "@config/product.config";
import { fillTemplate } from "@/lib/format";
import { routes } from "@/lib/routes";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Notice } from "@/components/feedback/Notice";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { getInsight } from "./healthData";

const { content, demoData } = productConfig;
const strings = content.insights;

/** A short general-information read. Calm reading: one column, comfortable measure, no verdicts. */
export function InsightScreen({ id }: { id: string }) {
  const insight = getInsight(id);

  if (!insight) {
    return (
      <div className="container-page py-8">
        <EmptyState icon="insight" title={strings.notFoundTitle} action={{ label: strings.backToHealth, href: routes.health() }} />
      </div>
    );
  }

  const more = demoData.insights.filter((item) => item.id !== insight.id).slice(0, 3);

  return (
    <div className="container-page flex max-w-2xl flex-col gap-6 pb-12 pt-4 sm:pt-6 lg:pb-16 lg:pt-8">
      <Link href={routes.health()} className="inline-flex min-h-11 items-center gap-1 self-start text-sm text-text-muted hover:text-text">
        <Icon name="chevron-left" size={16} aria-hidden="true" />
        {strings.backToHealth}
      </Link>

      <article aria-labelledby="insight-title" className="flex flex-col gap-5">
        <header className="flex flex-col gap-3">
          <h1 id="insight-title" className="text-balance text-h1 font-extrabold tracking-tight text-text">
            {insight.title}
          </h1>
          <p className="text-body text-text-muted sm:text-lg">{insight.summary}</p>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-text-muted">
            <span className="inline-flex items-center gap-1.5 font-semibold text-secondary-text">
              <Icon name="insight" size={16} aria-hidden="true" />
              {strings.label}
            </span>
            <span aria-hidden="true">·</span>
            <span>{fillTemplate(content.health.readMinutes, { minutes: insight.minutes })}</span>
          </p>
        </header>

        <div className="flex max-w-[65ch] flex-col gap-4 border-t border-border pt-5">
          {insight.body.map((paragraph) => (
            <p key={paragraph} className="text-body leading-relaxed text-text">
              {paragraph}
            </p>
          ))}
        </div>

        <Notice tone="info" icon="info" title={strings.label}>
          {strings.disclaimer}
        </Notice>

        <Button href={insight.cta.href} variant="outline" rightIcon="chevron-right" className="self-start">
          {insight.cta.label}
        </Button>
      </article>

      {more.length > 0 && (
        <section aria-labelledby="more-reads" className="flex flex-col gap-2 border-t border-border pt-6">
          <h2 id="more-reads" className="text-h3 font-bold text-text">
            {content.health.insightsTitle}
          </h2>
          <ul className="flex flex-col divide-y divide-border">
            {more.map((item) => (
              <li key={item.id}>
                <Link href={routes.insight(item.id)} className="group flex min-h-14 items-center gap-3 py-3">
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-body font-semibold text-text group-hover:text-primary-deep">{item.title}</span>
                    <span className="text-sm text-text-muted">{fillTemplate(content.health.readMinutes, { minutes: item.minutes })}</span>
                  </span>
                  <Icon name="chevron-right" size={18} aria-hidden="true" className="shrink-0 text-text-subtle" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
