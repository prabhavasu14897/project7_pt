import Image from "next/image";
import Link from "next/link";
import { productConfig } from "@config/product.config";
import { fillTemplate } from "@/lib/format";
import { catalogImage } from "@/lib/images";
import { routes } from "@/lib/routes";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Notice } from "@/components/feedback/Notice";
import { MobileActionBar, PayTotal } from "@/components/navigation/MobileActionBar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Price } from "@/components/ui/Price";
import { Rating } from "@/components/ui/Rating";
import { getHealthPackage, packageCategoryLabel } from "@/features/booking/servicesData";

const { content, categories } = productConfig;
const strings = content.healthPackages;
const listHref = categories.find((item) => item.key === "health-packages")?.href ?? "/";

export function HealthPackageDetailScreen({ id }: { id: string }) {
  const item = getHealthPackage(id);
  if (!item) {
    return (
      <div className="container-page py-8">
        <EmptyState icon="health-packages" title={content.booking.notFoundTitle} description={content.booking.notFoundDescription} action={{ label: strings.title, href: listHref }} />
      </div>
    );
  }
  const bookHref = routes.book("package", item.id);
  const photo = catalogImage(routes.healthPackage(item.id));

  return (
    <div className="container-page flex flex-col gap-5 pb-12 pt-4 sm:pt-6 lg:pb-16 lg:pt-8">
      <nav aria-label={content.doctorDetail.breadcrumbLabel}>
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-text-muted">
          <li>
            <Link href={listHref} className="inline-flex min-h-11 items-center rounded-sm hover:text-text">
              {strings.title}
            </Link>
          </li>
          <li aria-hidden="true">
            <Icon name="chevron-right" size={14} />
          </li>
          <li aria-current="page" className="font-semibold text-text">
            {item.name}
          </li>
        </ol>
      </nav>

      <div className="grid gap-5 lg:grid-cols-12 lg:items-start lg:gap-8">
        <div className="flex min-w-0 flex-col gap-5 lg:col-span-7">
          <Card padding="lg" className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex size-24 shrink-0 items-center justify-center self-start overflow-hidden rounded-lg bg-[var(--cn-tone-health-packages-bg)] text-[var(--cn-tone-health-packages-fg)] sm:size-28">
              {photo ? <Image src={photo.src} alt={photo.alt} fill sizes="112px" className="object-cover" /> : <Icon name="health-packages" size={44} strokeWidth={1.6} />}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <h1 className="text-h1 font-extrabold tracking-tight text-text">{item.name}</h1>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="neutral">{packageCategoryLabel(item.category)}</Badge>
                  <Rating value={item.rating} count={item.reviews} size="md" />
                </div>
              </div>
              <Price amount={item.price} mrp={item.mrp} size="lg" />
              <ul className="flex flex-col gap-1.5 text-sm text-text">
                <li className="flex items-center gap-2">
                  <Icon name="lab-tests" size={16} className="shrink-0 text-text-muted" />
                  {fillTemplate(strings.testsCount, { count: item.tests })}
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="home" size={16} className="shrink-0 text-text-muted" />
                  {content.booking.collection} · {fillTemplate(strings.collectedBy, { lab: item.lab.name })}
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="clock" size={16} className="shrink-0 text-text-muted" />
                  {fillTemplate(strings.reportIn, { time: item.reportTime })}
                </li>
              </ul>
            </div>
          </Card>

          <Card padding="lg" className="flex flex-col gap-3">
            <h2 className="text-h3 font-bold text-text">{strings.includedTitle}</h2>
            <ul className="flex flex-col divide-y divide-border">
              {item.groups.map((group) => (
                <li key={group.name} className="flex items-baseline justify-between gap-3 py-2.5 text-sm first:pt-0 last:pb-0">
                  <span className="text-text">{group.name}</span>
                  <span className="shrink-0 text-text-muted tabular">{fillTemplate(strings.groupTests, { count: group.count })}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="flex min-w-0 flex-col gap-5 lg:sticky lg:top-24 lg:col-span-5">
          <Card padding="lg" className="flex flex-col gap-4">
            <h2 className="text-h3 font-bold text-text">{strings.benefitsTitle}</h2>
            <ul className="flex flex-col gap-2 text-sm text-text">
              {item.benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2">
                  <Icon name="check" size={16} className="mt-0.5 shrink-0 text-success" />
                  {benefit}
                </li>
              ))}
            </ul>
            <Notice tone="info" icon="alert" title={strings.preparationTitle}>
              {item.preparation}
            </Notice>
            <span className="hidden lg:contents">
              <Button href={bookHref} size="lg" fullWidth rightIcon="chevron-right">
                {strings.bookCta}
              </Button>
            </span>
          </Card>
        </div>
      </div>

      <MobileActionBar summary={<PayTotal label={content.booking.fee} amount={item.price} />}>
        <Button href={bookHref} rightIcon="chevron-right">
          {strings.bookCta}
        </Button>
      </MobileActionBar>
    </div>
  );
}
