"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { productConfig } from "@config/product.config";
import { fillTemplate, formatPrice } from "@/lib/format";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Notice } from "@/components/feedback/Notice";
import { PrototypeControls } from "@/components/feedback/PrototypeControls";
import { PriceBreakdown } from "@/components/marketplace/PriceBreakdown";
import { MobileActionBar, PayTotal } from "@/components/navigation/MobileActionBar";
import { StepIndicator } from "@/components/navigation/StepIndicator";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { journey, useJourney } from "@/features/journey/store";
import { PaymentMethodPicker, paymentReady } from "./PaymentMethodPicker";
import { computeTotals, toOrderLines } from "@/features/journey/pricing";
import { blockedLines, priceRows } from "@/features/journey/selectors";

const { content } = productConfig;
const strings = content.payment;
const cartStrings = content.cart;

/** How long the simulated bank round-trip takes. */
const PROCESSING_MS = 2200;

/** `done`: paid and navigating to tracking; the emptied cart must not flash the empty state. */
type Phase = "idle" | "processing" | "failed" | "done";

export function PaymentScreen() {
  const router = useRouter();
  const state = useJourney();
  const [phase, setPhase] = useState<Phase>("idle");
  const [upiError, setUpiError] = useState<string | undefined>();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const lines = toOrderLines(state.cart);
  const totals = computeTotals(lines, state.checkout);
  const method = state.checkout.paymentMethod;

  if (phase !== "done" && (lines.length === 0 || blockedLines(state).length > 0)) {
    return (
      <div className="container-page py-8">
        <EmptyState
          icon="cart"
          title={cartStrings.emptyTitle}
          description={content.checkout.emptyRedirect}
          action={{ label: content.checkout.steps[0] ?? "", href: content.medicineDetail.cartHref }}
        />
      </div>
    );
  }

  function pay() {
    if (!paymentReady(method, state.checkout.upiId)) {
      setUpiError(strings.upiError);
      return;
    }
    setPhase("processing");
    timer.current = setTimeout(() => {
      const result = journey.placeOrder();
      if (result.ok) {
        setPhase("done");
        router.push(`/orders/${result.orderId}`);
      }
      else setPhase("failed");
    }, PROCESSING_MS);
  }

  const busy = phase === "processing" || phase === "done";
  const payLabel = phase === "failed" ? strings.retry : fillTemplate(strings.pay, { amount: formatPrice(totals.total) });

  return (
    <div className="container-page flex flex-col gap-5 pb-12 pt-4 sm:pt-6 lg:pb-16 lg:pt-8">
      <div className="flex flex-col gap-3">
        <StepIndicator steps={content.checkout.steps} current={2} label={content.checkout.stepsLabel} />
        <h1 className="text-h1 font-extrabold tracking-tight text-text">{strings.title}</h1>
      </div>

      <div className="grid gap-5 lg:grid-cols-12 lg:items-start lg:gap-8">
        <div className="flex flex-col gap-5 lg:col-span-8">
          {phase === "failed" && (
            <Notice tone="danger" icon="alert" title={strings.failedTitle}>
              {strings.failedBody}
            </Notice>
          )}

          <Card padding="lg">
            <PaymentMethodPicker upiError={upiError} onEdit={() => setUpiError(undefined)} disabled={busy} />
          </Card>
        </div>

        {/* Purchase summary first; demo tooling after it, so it never pushes Pay out of reach. */}
        <div className="flex flex-col gap-5 lg:sticky lg:top-24 lg:col-span-4">
          <Card padding="lg" className="flex flex-col gap-5">
            <PriceBreakdown
              title={cartStrings.summaryTitle}
              rows={priceRows(totals)}
              total={{ label: cartStrings.total, amount: totals.total }}
              freeLabel={cartStrings.free}
            />
            {busy && (
              <Notice tone="info" icon="clock" title={strings.processingTitle}>
                {strings.processingBody}
              </Notice>
            )}
            <span className="hidden lg:contents">
              <Button size="lg" fullWidth leftIcon="lock" loading={busy} onClick={pay}>
                {payLabel}
              </Button>
            </span>
            <p className="flex items-start gap-2 text-xs text-text-muted">
              <Icon name="verified" size={14} className="mt-px shrink-0" />
              {strings.secure}
            </p>
          </Card>
          <PrototypeControls title={content.prototype.title} description={content.prototype.description}>
            <Button
              size="sm"
              variant={state.prototype.failNextPayment ? "secondary" : "outline"}
              leftIcon={state.prototype.failNextPayment ? "check" : "alert"}
              aria-pressed={state.prototype.failNextPayment}
              onClick={() => journey.setFailNextPayment(!state.prototype.failNextPayment)}
            >
              {content.prototype.failNextPayment}
            </Button>
          </PrototypeControls>
        </div>
      </div>

      {/* Always mounted, so processing and failure are announced reliably. */}
      <p role="status" className="sr-only">
        {busy ? strings.processingTitle : phase === "failed" ? strings.failedTitle : ""}
      </p>

      <MobileActionBar summary={<PayTotal label={cartStrings.total} amount={totals.total} />}>
        <Button leftIcon="lock" loading={busy} onClick={pay}>
          {phase === "failed" ? strings.retry : strings.payShort}
        </Button>
      </MobileActionBar>
    </div>
  );
}
