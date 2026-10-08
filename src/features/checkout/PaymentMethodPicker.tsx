"use client";

import { productConfig } from "@config/product.config";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { RadioCardGroup } from "@/components/ui/RadioCardGroup";
import { Select } from "@/components/ui/Select";
import { journey, useJourney } from "@/features/journey/store";

const { content, demoData } = productConfig;
const strings = content.payment;

const UPI_PATTERN = /^[\w.-]{2,}@[a-zA-Z]{2,}$/;

/** True when the chosen method has what it needs (a UPI ID that looks valid, or any other method). */
export function paymentReady(method: string, upiId: string): boolean {
  return method !== "upi" || UPI_PATTERN.test(upiId.trim());
}

interface PaymentMethodPickerProps {
  upiError?: string;
  onEdit?: () => void;
  disabled?: boolean;
  /** Methods to hide, e.g. cash for a video consult. */
  exclude?: readonly string[];
  /** Per-method copy changes, e.g. "Pay at visit" instead of "Cash on delivery" for services. */
  relabel?: Partial<Record<string, { label: string; detail: string }>>;
}

/** Payment method choice shared by checkout and bookings; the selection lives in the journey store. */
export function PaymentMethodPicker({ upiError, onEdit, disabled = false, exclude = [], relabel = {} }: PaymentMethodPickerProps) {
  const { checkout, savedPayments } = useJourney();
  const savedCard = savedPayments.find((item) => item.kind === "card")?.label;
  const methods = demoData.paymentMethods.filter((item) => !exclude.includes(item.id));
  const method = methods.some((item) => item.id === checkout.paymentMethod) ? checkout.paymentMethod : (methods[0]?.id ?? "");

  return (
    <RadioCardGroup
      legend={strings.methodTitle}
      value={method}
      onChange={(paymentMethod) => {
        journey.updateCheckout({ paymentMethod });
        onEdit?.();
      }}
      options={methods.map((item) => ({
        value: item.id,
        label: relabel[item.id]?.label ?? item.label,
        description: relabel[item.id]?.detail ?? item.detail,
        icon: item.icon,
        disabled,
      }))}
      renderSelected={(value) => {
        if (value === "upi")
          return (
            <Input
              label={strings.upiLabel}
              placeholder={strings.upiPlaceholder}
              hint={strings.upiHint}
              error={upiError}
              value={checkout.upiId}
              onChange={(event) => {
                journey.updateCheckout({ upiId: event.target.value });
                onEdit?.();
              }}
              inputMode="email"
              autoComplete="off"
              disabled={disabled}
            />
          );
        if (value === "card")
          return (
            <p className="flex items-center gap-2 text-sm text-text">
              <Icon name="card" size={16} className="text-text-muted" />
              {strings.savedCard}: <span className="font-semibold">{savedCard ?? demoData.savedCard}</span>
            </p>
          );
        if (value === "wallet")
          return (
            <Select
              label={strings.walletLabel}
              layout="stacked"
              value={checkout.wallet}
              options={demoData.wallets.map((wallet) => ({ value: wallet, label: wallet }))}
              onChange={(wallet) => journey.updateCheckout({ wallet })}
            />
          );
        return null;
      }}
    />
  );
}
