import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./Icon";
import { Spinner } from "./Spinner";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "link" | "inverse" | "inverseOutline";
export type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary-dark text-white hover:bg-primary-deep active:bg-primary-deep disabled:bg-border disabled:text-text-muted",
  secondary:
    "bg-primary-soft text-primary-deep hover:bg-[color-mix(in_srgb,var(--color-primary-soft)_80%,var(--color-primary)_20%)] disabled:bg-surface-muted disabled:text-text-subtle",
  outline:
    "border border-border bg-surface text-text hover:border-primary-dark hover:text-primary-deep disabled:text-text-subtle disabled:hover:border-border",
  ghost: "text-text hover:bg-surface-muted disabled:text-text-subtle",
  danger: "bg-danger-text text-white hover:bg-[color-mix(in_srgb,var(--color-danger-text)_85%,black)] disabled:bg-border disabled:text-text-muted",
  link: "text-primary-dark underline-offset-4 hover:underline disabled:text-text-subtle",
  // For deep-teal surfaces such as the Home hero.
  inverse: "bg-white text-primary-deep hover:bg-primary-soft focus-visible:outline-white",
  inverseOutline: "border border-white/45 text-white hover:border-white hover:bg-white/10 focus-visible:outline-white",
};

const sizeClasses: Record<ButtonSize, string> = {
  // `sm` stays visually compact (as in the reference list rows) but expands its hit area to 44px.
  sm: "h-9 px-3.5 text-sm gap-1.5 rounded-md relative after:absolute after:-inset-x-0 after:-inset-y-1 after:content-['']",
  md: "h-11 px-5 text-body gap-2 rounded-md",
  lg: "h-12 px-6 text-body gap-2 rounded-lg",
};

const iconSize: Record<ButtonSize, number> = { sm: 16, md: 18, lg: 20 };

interface ButtonOwnProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: IconName;
  rightIcon?: IconName;
  loading?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
  className?: string;
}

type ButtonAsButton = ButtonOwnProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonOwnProps> & { href?: undefined };

type ButtonAsLink = ButtonOwnProps & {
  href: string;
  disabled?: boolean;
  onClick?: () => void;
  "aria-label"?: string;
};

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export function buttonClasses({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
}: Pick<ButtonOwnProps, "variant" | "size" | "fullWidth" | "className">): string {
  return cn(
    "inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap font-semibold",
    "transition-colors duration-150 disabled:cursor-not-allowed aria-disabled:pointer-events-none aria-disabled:opacity-60",
    variant !== "link" && sizeClasses[size],
    variant === "link" && "h-auto gap-1 px-0 text-sm",
    variantClasses[variant],
    fullWidth && "w-full",
    className,
  );
}

function omitOwnProps<T extends ButtonOwnProps & { href?: undefined }>(props: T) {
  const { variant, size, leftIcon, rightIcon, loading, fullWidth, children, className, href, ...rest } = props;
  return rest;
}

export function Button(props: ButtonProps) {
  const { variant = "primary", size = "md", leftIcon, rightIcon, loading = false, fullWidth, children, className } = props;
  const classes = buttonClasses({ variant, size, fullWidth, className });
  const content = (
    <>
      {loading ? <Spinner size={iconSize[size]} /> : leftIcon && <Icon name={leftIcon} size={iconSize[size]} />}
      <span>{children}</span>
      {rightIcon && !loading && <Icon name={rightIcon} size={iconSize[size]} />}
    </>
  );

  if (props.href !== undefined) {
    const isDisabled = props.disabled || loading;
    return (
      <Link
        href={props.href}
        className={classes}
        onClick={props.onClick}
        aria-label={props["aria-label"]}
        aria-disabled={isDisabled || undefined}
        tabIndex={isDisabled ? -1 : undefined}
      >
        {content}
      </Link>
    );
  }

  const { type = "button", disabled, ...nativeProps } = props;
  const rest = omitOwnProps(nativeProps);

  return (
    <button type={type} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {content}
    </button>
  );
}
