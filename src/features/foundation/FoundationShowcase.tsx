"use client";

import { useState, type ReactNode } from "react";
import { productConfig } from "@config/product.config";
import { buildPrescriptionSteps, prescriptionStageCount } from "@/lib/prescription";
import { medicinePrimaryAction, ruleBadge } from "@/lib/medicine";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { IconButton } from "@/components/ui/IconButton";
import { Input } from "@/components/ui/Input";
import { Rating } from "@/components/ui/Rating";
import { SearchBar } from "@/components/ui/SearchBar";
import { TabPanel, Tabs } from "@/components/ui/Tabs";
import { CategoryCard } from "@/components/marketplace/CategoryCard";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { ProviderCard } from "@/components/marketplace/ProviderCard";
import { StatusTimeline } from "@/components/healthcare/StatusTimeline";
import { UploadBox } from "@/components/healthcare/UploadBox";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";

const { theme, categories, demoData, ui, content, statuses } = productConfig;

/*
 * Internal reference page for the shared foundation. Section titles here are developer-facing;
 * all product content comes from config so this page doubles as a check that config drives the UI.
 */

function Section({ id, title, note, children }: { id: string; title: string; note?: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-28 py-8 sm:py-10">
      <div className="mb-5 flex flex-col gap-1">
        <h2 id={`${id}-title`} className="text-h2 font-bold text-text">
          {title}
        </h2>
        {note && <p className="max-w-2xl text-sm text-text-muted">{note}</p>}
      </div>
      {children}
    </section>
  );
}

function Swatch({ name, value }: { name: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="size-10 shrink-0 rounded-md border border-border" style={{ backgroundColor: value }} />
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-text">{name}</span>
        <span className="block text-xs uppercase text-text-muted tabular">{value}</span>
      </span>
    </div>
  );
}

const typeClass = {
  display: "text-display",
  h1: "text-h1",
  h2: "text-h2",
  h3: "text-h3",
  body: "text-body",
  sm: "text-sm",
  xs: "text-xs",
} as const satisfies Record<keyof typeof theme.typography, string>;

type FilterKey = "all" | "otc" | "prescription";
type OrderTab = "ongoing" | "past";
type DemoState = "content" | "loading" | "empty" | "error";

export function FoundationShowcase() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [orderTab, setOrderTab] = useState<OrderTab>("ongoing");
  const [detailTab, setDetailTab] = useState("description");
  const [added, setAdded] = useState<ReadonlySet<string>>(new Set());
  const [pharmacy, setPharmacy] = useState<string>(demoData.pharmacies[0]?.id ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState(1);
  const [clarify, setClarify] = useState(false);
  const [demoState, setDemoState] = useState<DemoState>("content");
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);

  const medicines = demoData.medicines.filter((medicine) => filter === "all" || medicine.rule === filter);
  const toggleAdded = (id: string) =>
    setAdded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const emailError = emailTouched && email && !email.includes("@") ? "Enter an email like name@example.com." : undefined;

  return (
    <div className="container-page pb-10">
      <header className="flex flex-col gap-2 pt-8 sm:pt-10">
        <Badge tone="primary" icon="package">
          Shared foundation
        </Badge>
        <h1 className="text-h1 font-extrabold tracking-tight text-text lg:text-display">{productConfig.brand.name} components</h1>
        <p className="max-w-2xl text-body text-text-muted">{productConfig.brand.description}</p>
      </header>

      <Section id="colors" title="Color" note="Generated from theme.colors. Teal for actions and active states, blue for information, amber only for prescription review.">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {Object.entries(theme.colors).map(([name, value]) => (
            <Swatch key={name} name={name} value={value} />
          ))}
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {Object.entries(theme.categoryTones).map(([name, tone]) => (
            <div key={name} className="flex items-center gap-2 rounded-md p-2" style={{ backgroundColor: tone.bg }}>
              <span className="size-5 rounded-full" style={{ backgroundColor: tone.fg }} />
              <span className="text-xs font-semibold" style={{ color: tone.fg }}>
                {name}
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section id="type" title="Typography" note="Manrope. Display bold and compact; headings semibold; metadata smaller and muted.">
        <Card padding="lg" className="flex flex-col gap-4">
          {(Object.keys(theme.typography) as Array<keyof typeof theme.typography>).map((key) => {
            const [size, lineHeight] = theme.typography[key];
            const weight = key === "display" || key === "h1" ? "font-extrabold" : key.startsWith("h") ? "font-bold" : "font-normal";
            return (
              <div key={key} className="flex flex-col gap-1 border-b border-border pb-4 last:border-b-0 last:pb-0 sm:flex-row sm:items-baseline sm:gap-6">
                <span className="w-28 shrink-0 text-xs font-semibold uppercase tracking-wide text-text-muted">
                  {key} · {size}/{lineHeight}
                </span>
                <span className={`${typeClass[key]} ${weight} text-text`}>{content.home.heroTitle}</span>
              </div>
            );
          })}
        </Card>
      </Section>

      <Section id="buttons" title="Buttons" note="Small buttons stay compact as in the reference rows but keep a 44px hit area.">
        <Card padding="lg" className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-3">
            <Button>{ui.actions.continue}</Button>
            <Button variant="secondary">{ui.actions.browse}</Button>
            <Button variant="outline" leftIcon="upload">
              {ui.actions.uploadPrescription}
            </Button>
            <Button variant="ghost">{ui.actions.viewAll}</Button>
            <Button variant="danger">{ui.actions.remove}</Button>
            <Button variant="link" rightIcon="chevron-right">
              {ui.actions.viewAll}
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">{ui.actions.add}</Button>
            <Button size="md">{ui.actions.book}</Button>
            <Button size="lg">{ui.actions.continue}</Button>
            <Button loading>{ui.actions.continue}</Button>
            <Button disabled>{ui.actions.notAvailable}</Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {productConfig.navigation.headerActions.map((action) => (
              <IconButton key={action.key} icon={action.icon} label={action.label} count={action.key === "cart" ? 2 : undefined} />
            ))}
            <IconButton icon="search" label={ui.search.submit} variant="outline" />
            <IconButton icon="health" label={productConfig.navigation.mobile[3]?.label ?? ""} variant="soft" />
          </div>
          <Button fullWidth size="lg" className="sm:hidden">
            {ui.actions.continue}
          </Button>
        </Card>
      </Section>

      <Section id="inputs" title="Inputs and search">
        <div className="grid gap-5 lg:grid-cols-2">
          <Card padding="lg" className="flex flex-col gap-4">
            <Input
              label="Email or mobile number"
              leftIcon="profile"
              placeholder="name@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              onBlur={() => setEmailTouched(true)}
              error={emailError}
              hint={emailError ? undefined : "We'll send order updates here."}
            />
            <Input label="Coupon code" optionalLabel="(optional)" placeholder="SAVE10" />
            <Input label="Delivery address" disabled value={demoData.location} readOnly />
          </Card>
          <Card padding="lg" className="flex flex-col gap-4">
            <SearchBar size="lg" />
            <SearchBar appearance="filled" placeholder={content.home.searchPlaceholder} />
            <p className="text-sm text-text-muted">Submitting the header search goes to Explore with the query.</p>
          </Card>
        </div>
      </Section>

      <Section id="tabs" title="Tabs" note="Segmented for Orders, underline for detail sections, chips for listing filters. Arrow keys move between tabs.">
        <Card padding="lg" className="flex flex-col gap-6">
          <Tabs
            id="order-tabs"
            label="Orders"
            value={orderTab}
            onChange={setOrderTab}
            items={[
              { value: "ongoing", label: "Ongoing", count: 1 },
              { value: "past", label: "Past" },
            ]}
          />
          <div>
            <Tabs
              id="detail-tabs"
              variant="underline"
              label="Medicine details"
              value={detailTab}
              onChange={setDetailTab}
              hasPanels
              items={[
                { value: "description", label: "Description" },
                { value: "uses", label: "Uses" },
                { value: "side-effects", label: "Side effects" },
              ]}
            />
            <TabPanel id="detail-tabs" value={detailTab} className="pt-4 text-sm text-text-muted">
              {productConfig.medicineRules.prescription.description}
            </TabPanel>
          </div>
          <Tabs
            id="filter-tabs"
            variant="chips"
            label="Filter medicines"
            value={filter}
            onChange={setFilter}
            items={[
              { value: "all", label: "All" },
              { value: "otc", label: productConfig.medicineRules.otc.shortLabel },
              { value: "prescription", label: "Prescription" },
            ]}
          />
        </Card>
      </Section>

      <Section id="badges" title="Badges and rating" note="Status always pairs color with text, and an icon where it helps.">
        <Card padding="lg" className="flex flex-wrap items-center gap-3">
          {(["otc", "prescription", "restricted"] as const).map((rule) => {
            const badge = ruleBadge(rule);
            return (
              <Badge key={rule} tone={badge.tone} icon={badge.icon}>
                {badge.label}
              </Badge>
            );
          })}
          <Badge tone="success" icon="verified">
            {ui.labels.verified}
          </Badge>
          <Badge tone="info" icon="delivery">
            {statuses.prescription[4]?.label}
          </Badge>
          <Badge tone="primary" size="md" icon="clock">
            {demoData.pharmacies[0]?.eta}
          </Badge>
          <Rating value={4.8} count={2400} size="md" />
        </Card>
      </Section>

      <Section id="cards" title="Card">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <p className="text-sm font-semibold">Default</p>
            <p className="text-sm text-text-muted">White, soft border, restrained shadow.</p>
          </Card>
          <Card variant="outline">
            <p className="text-sm font-semibold">Outline</p>
            <p className="text-sm text-text-muted">Nested inside other surfaces.</p>
          </Card>
          <Card variant="muted">
            <p className="text-sm font-semibold">Muted</p>
            <p className="text-sm text-text-muted">Quick access and info blocks.</p>
          </Card>
          <Card variant="raised">
            <p className="text-sm font-semibold">Raised</p>
            <p className="text-sm text-text-muted">Sticky summaries and sheets.</p>
          </Card>
        </div>
      </Section>

      <Section id="categories" title="CategoryCard" note="Tile for the Home grid (4 across on mobile, 5 on desktop); row for Explore.">
        <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-5 sm:gap-4">
          {categories.map((category, index) => (
            <CategoryCard
              key={category.key}
              label={category.label}
              href={category.href}
              icon={category.icon}
              tone={category.key}
              className={index === 4 ? "hidden sm:flex" : undefined}
            />
          ))}
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {categories.map((category) => (
            <CategoryCard
              key={category.key}
              variant="row"
              label={category.label}
              description={category.description}
              href={category.href}
              icon={category.icon}
              tone={category.key}
            />
          ))}
        </div>
      </Section>

      <Section
        id="products"
        title="ProductCard"
        note="Prescription items offer upload, not Add, until verified. Restricted items explain why they can't be bought."
      >
        <div className="grid gap-3 md:grid-cols-2">
          {medicines.map((medicine) => {
            const primary = medicinePrimaryAction(medicine.rule);
            const isAdded = added.has(medicine.id);
            return (
              <ProductCard
                key={medicine.id}
                title={medicine.name}
                subtitle={medicine.pack}
                icon="medicines"
                tone="medicines"
                badge={ruleBadge(medicine.rule)}
                price={primary.kind === "unavailable" ? undefined : { amount: medicine.price, mrp: medicine.mrp }}
                note={primary.kind === "unavailable" ? primary.note : undefined}
                action={
                  primary.kind === "add"
                    ? {
                        label: isAdded ? ui.actions.added : primary.label,
                        variant: isAdded ? "secondary" : "primary",
                        onClick: () => toggleAdded(medicine.id),
                      }
                    : primary.kind === "upload"
                      ? { label: primary.label, variant: "outline", href: "#upload" }
                      : { label: primary.label, disabled: true, variant: "outline" }
                }
              />
            );
          })}
          {demoData.labTests.slice(0, 2).map((test) => (
            <ProductCard
              key={test.id}
              title={test.name}
              icon="lab-tests"
              tone="lab-tests"
              rating={{ value: test.rating, count: test.reviews }}
              meta={[{ icon: "home", label: test.mode }]}
              price={{ amount: test.price, mrp: test.mrp }}
              action={{
                label: added.has(test.id) ? ui.actions.added : ui.actions.book,
                variant: added.has(test.id) ? "secondary" : "primary",
                onClick: () => toggleAdded(test.id),
              }}
            />
          ))}
        </div>
      </Section>

      <Section id="providers" title="ProviderCard" note="Pharmacies use rounded logo tiles and can be selected; doctors use portraits.">
        <div className="flex flex-col gap-3">
          {demoData.pharmacies.map((item) => {
            const selected = pharmacy === item.id;
            return (
              <ProviderCard
                key={item.id}
                name={item.name}
                imageShape="rounded"
                verifiedLabel={item.verified ? ui.labels.verified : undefined}
                rating={{ value: item.rating, count: item.reviews }}
                meta={[
                  { icon: "clock", label: item.eta },
                  { icon: "distance", label: item.distance },
                ]}
                price={{ amount: demoData.medicines[1]?.price ?? 0 }}
                selected={selected}
                action={{ label: selected ? ui.actions.selected : ui.actions.select, onClick: () => setPharmacy(item.id) }}
              />
            );
          })}
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {demoData.doctors.map((doctor) => (
            <ProviderCard
              key={doctor.id}
              name={doctor.name}
              subtitle={doctor.specialty}
              rating={{ value: doctor.rating, count: doctor.reviews }}
              meta={[{ icon: "clock", label: doctor.duration }]}
              price={{ amount: doctor.fee }}
              action={{ label: ui.actions.book, href: `/doctors/${doctor.id}` }}
            />
          ))}
        </div>
      </Section>

      <div className="grid gap-x-8 lg:grid-cols-2">
        <Section id="upload" title="UploadBox" note="Validates type and size on the device. Try a .txt file to see the recovery message.">
          <UploadBox file={file} onFileChange={setFile} />
          <Button
            fullWidth
            size="lg"
            className="mt-4"
            disabled={!file}
            onClick={() => {
              setStage(1);
              setClarify(false);
              document.getElementById("timeline")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            {ui.actions.continue}
          </Button>
        </Section>

        <Section id="timeline" title="StatusTimeline" note="Starts at review, never auto-approved. Step through it or request clarification.">
          <Card padding="md">
            <StatusTimeline label={ui.upload.title} steps={buildPrescriptionSteps(stage, clarify)} />
            <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setClarify(false);
                  setStage((current) => Math.min(current + 1, prescriptionStageCount - 1));
                }}
                disabled={!clarify && stage >= prescriptionStageCount - 1}
              >
                Next status
              </Button>
              <Button size="sm" variant="outline" onClick={() => setClarify(true)} disabled={clarify || stage > 1}>
                {statuses.prescriptionClarification.label}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setStage(1);
                  setClarify(false);
                }}
              >
                Reset
              </Button>
            </div>
          </Card>
        </Section>
      </div>

      <Section id="states" title="Empty, loading and error" note="Switch states to compare. Skeletons mirror the real layout to avoid jumps.">
        <Tabs
          id="state-tabs"
          variant="segmented"
          label="Demo state"
          value={demoState}
          onChange={setDemoState}
          hasPanels
          items={[
            { value: "content", label: "Loaded" },
            { value: "loading", label: "Loading" },
            { value: "empty", label: "Empty" },
            { value: "error", label: "Error" },
          ]}
        />
        <TabPanel id="state-tabs" value={demoState} className="mt-5">
          {demoState === "content" && (
            <div className="grid gap-3 md:grid-cols-2">
              {demoData.labTests.slice(2).map((test) => (
                <ProductCard
                  key={test.id}
                  title={test.name}
                  icon="lab-tests"
                  tone="lab-tests"
                  meta={[{ icon: "home", label: test.mode }]}
                  price={{ amount: test.price, mrp: test.mrp }}
                  action={{ label: ui.actions.book, onClick: () => toggleAdded(test.id) }}
                />
              ))}
            </div>
          )}
          {demoState === "loading" && (
            <div className="flex flex-col gap-6">
              <LoadingState variant="tiles" count={5} label={ui.loading.results} />
              <LoadingState variant="list" count={2} label={ui.loading.results} />
            </div>
          )}
          {demoState === "empty" && (
            <Card padding="none">
              <EmptyState
                title={ui.states.emptySearchTitle}
                description={ui.states.emptySearchDescription}
                action={{ label: ui.actions.browse, href: "/explore" }}
                secondaryAction={{ label: ui.search.clear, onClick: () => setDemoState("content") }}
              />
            </Card>
          )}
          {demoState === "error" && (
            <Card padding="none">
              <ErrorState onRetry={() => setDemoState("loading")} />
            </Card>
          )}
        </TabPanel>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <Card padding="none">
            <EmptyState size="inline" icon="orders" title={content.emptyStates.orders} />
          </Card>
          <Card padding="none">
            <EmptyState size="inline" icon="prescription" title={content.emptyStates.prescriptions} />
          </Card>
          <Card padding="none">
            <LoadingState label={ui.loading.default} />
          </Card>
        </div>
      </Section>
    </div>
  );
}
