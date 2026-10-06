import type { CardAction } from "@/types/models";
import { Button, type ButtonSize, type ButtonVariant } from "./Button";
import type { IconName } from "./Icon";

interface ActionButtonProps {
  action: CardAction;
  size?: ButtonSize;
  variant?: ButtonVariant;
  leftIcon?: IconName;
  pressed?: boolean;
  className?: string;
}

/** Renders a data-driven `CardAction` as a link or a button. */
export function ActionButton({ action, size = "sm", variant, leftIcon, pressed, className }: ActionButtonProps) {
  const shared = {
    size,
    variant: variant ?? action.variant ?? "primary",
    leftIcon,
    disabled: action.disabled,
    loading: action.loading,
    className,
  } as const;

  if (action.href && !action.disabled) {
    return (
      <Button {...shared} href={action.href} onClick={action.onClick} aria-label={action.ariaLabel}>
        {action.label}
      </Button>
    );
  }

  return (
    <Button {...shared} onClick={action.onClick} aria-pressed={pressed ?? action.pressed} aria-label={action.ariaLabel}>
      {action.label}
    </Button>
  );
}
