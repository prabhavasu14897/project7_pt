"use client";

import Link from "next/link";
import { useState } from "react";
import { productConfig } from "@config/product.config";
import { fillTemplate, formatDateTime, formatDay } from "@/lib/format";
import { routes } from "@/lib/routes";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { useJourney } from "@/features/journey/store";
import { getReport, type ReportView } from "./healthData";

const { content, categories } = productConfig;
const strings = content.reports;
const doctorsHref = categories.find((item) => item.key === "doctors")?.href ?? "/explore";

/** A plain-text copy of the report, so "Download" leaves the user with a real file. */
function reportFile(report: ReportView, patient: string): string {
  const lines = [
    strings.fileHeading,
    "",
    report.testName,
    `${strings.patient}: ${patient}`,
    `${strings.lab}: ${report.labName}`,
    `${strings.collected}: ${formatDateTime(report.collectedAt)}`,
    `${strings.reportedOn}: ${formatDateTime(report.reportedAt)}`,
    fillTemplate(strings.reference, { id: report.id }),
    "",
    `${strings.columns.test} | ${strings.columns.value} | ${strings.columns.range}`,
    ...report.results.map((row) => `${row.name} | ${row.value} ${row.unit}`.trimEnd() + ` | ${row.range}${row.unit && /\d/.test(row.range) ? ` ${row.unit}` : ""}`),
    "",
    fillTemplate(strings.rangeNote, { lab: report.labName }),
  ];
  return lines.join("\n");
}

export function ReportDetailScreen({ id }: { id: string }) {
  const state = useJourney();
  const report = getReport(state, id);
  const [saved, setSaved] = useState(false);

  if (!report) {
    return (
      <div className="container-page py-8">
        <EmptyState icon="lab-tests" title={strings.notFoundTitle} description={strings.notFoundBody} action={{ label: strings.title, href: routes.reports() }} />
      </div>
    );
  }

  const patient = state.familyMembers.find((member) => member.id === report.patientId);
  const patientName = patient ? `${patient.name} · ${patient.relation}` : "";

  function download() {
    if (!report) return;
    const blob = new Blob([reportFile(report, patientName)], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${report.id}-${report.testId}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setSaved(true);
  }

  // Units belong with numbers; a range written in words ("Below 200") takes the unit too.
  const withUnit = (text: string, unit: string) => (unit && /\d/.test(text) ? `${text} ${unit}` : text);

  return (
    <div className="container-page flex max-w-3xl flex-col gap-5 pb-12 pt-4 sm:pt-6 lg:pb-16 lg:pt-8">
      <nav aria-label={strings.breadcrumbLabel}>
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-text-muted">
          <li>
            <Link href={routes.health(report.patientId)} className="inline-flex min-h-11 items-center hover:text-text">
              {strings.backToHealth}
            </Link>
          </li>
          <li aria-hidden="true">
            <Icon name="chevron-right" size={14} />
          </li>
          <li>
            <Link href={routes.reports(report.patientId)} className="inline-flex min-h-11 items-center hover:text-text">
              {strings.title}
            </Link>
          </li>
          <li aria-hidden="true">
            <Icon name="chevron-right" size={14} />
          </li>
          <li aria-current="page" className="font-semibold text-text">
            {report.testName}
          </li>
        </ol>
      </nav>

      <Card padding="lg" className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <span
              aria-hidden="true"
              className="flex size-12 shrink-0 items-center justify-center rounded-lg"
              style={{ color: "var(--cn-tone-lab-tests-fg)", backgroundColor: "var(--cn-tone-lab-tests-bg)" }}
            >
              <Icon name="lab-tests" size={24} />
            </span>
            <div className="flex min-w-0 flex-col gap-0.5">
              <h1 className="text-h2 font-extrabold tracking-tight text-text">{report.testName}</h1>
              <p className="text-sm text-text-muted tabular">{fillTemplate(strings.reference, { id: report.id })}</p>
            </div>
          </div>
          <Button variant="outline" leftIcon="download" onClick={download} className="self-start">
            {strings.download}
          </Button>
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 border-t border-border pt-4 text-sm sm:grid-cols-4">
          {[
            [strings.patient, patientName],
            [strings.lab, report.labName],
            [strings.collected, formatDay(report.collectedAt)],
            [strings.reportedOn, formatDay(report.reportedAt)],
          ].map(([term, value]) => (
            <div key={term} className="flex flex-col gap-0.5">
              <dt className="text-text-muted">{term}</dt>
              <dd className="font-semibold text-text tabular">{value}</dd>
            </div>
          ))}
        </dl>
        <p role="status" className={saved ? "flex items-center gap-1.5 text-sm text-success-text" : "sr-only"}>
          {saved && <Icon name="check" size={16} aria-hidden="true" />}
          {saved ? strings.downloaded : ""}
        </p>
      </Card>

      <Card as="section" aria-labelledby="results" padding="lg" className="flex flex-col gap-4">
        <h2 id="results" className="text-h3 font-bold text-text">
          {strings.resultsTitle}
        </h2>
        {/* Values exactly as printed, beside the lab's own range. No flags, colours or verdicts: reading them is the doctor's job. */}
        <table className="hidden w-full text-left text-sm sm:table">
          <thead>
            <tr className="border-b border-border text-text-muted">
              <th scope="col" className="py-2 pr-4 font-semibold">{strings.columns.test}</th>
              <th scope="col" className="py-2 pr-4 font-semibold">{strings.columns.value}</th>
              <th scope="col" className="py-2 font-semibold">{strings.columns.range}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {report.results.map((row) => (
              <tr key={row.name}>
                <th scope="row" className="py-3 pr-4 font-semibold text-text">{row.name}</th>
                <td className="py-3 pr-4 font-bold text-text tabular">{withUnit(row.value, row.unit)}</td>
                <td className="py-3 text-text-muted tabular">{withUnit(row.range, row.unit)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <dl className="flex flex-col divide-y divide-border sm:hidden">
          {report.results.map((row) => (
            <div key={row.name} className="flex flex-col gap-1 py-3 first:pt-0">
              <dt className="text-sm font-semibold text-text">{row.name}</dt>
              <dd className="flex flex-wrap items-baseline justify-between gap-x-4 text-sm tabular">
                <span className="font-bold text-text">{withUnit(row.value, row.unit)}</span>
                <span className="text-text-muted">
                  {strings.columns.range}: {withUnit(row.range, row.unit)}
                </span>
              </dd>
            </div>
          ))}
        </dl>
        <p className="text-xs text-text-muted">{fillTemplate(strings.rangeNote, { lab: report.labName })}</p>
      </Card>

      <section aria-labelledby="discuss" className="flex flex-col gap-3 rounded-lg bg-secondary-soft p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex flex-col gap-1">
          <h2 id="discuss" className="text-body font-bold text-text">
            {strings.discussTitle}
          </h2>
          <p className="text-sm text-text">{strings.discussBody}</p>
          <Link href={routes.insight("reading-reports")} className="inline-flex min-h-11 items-center gap-1 self-start text-sm font-semibold text-secondary-text hover:underline">
            <Icon name="insight" size={16} aria-hidden="true" />
            {strings.readGuide}
          </Link>
        </div>
        <Button href={doctorsHref} rightIcon="chevron-right" className="shrink-0 self-start sm:self-center">
          {strings.bookDoctor}
        </Button>
      </section>
    </div>
  );
}
