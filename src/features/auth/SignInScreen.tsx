"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { productConfig } from "@config/product.config";
import { fillTemplate } from "@/lib/format";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/cn";
import { PrototypeControls } from "@/components/feedback/PrototypeControls";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { Input } from "@/components/ui/Input";
import { Logo } from "@/components/navigation/Logo";
import { Spinner } from "@/components/ui/Spinner";
import { journey, useJourney } from "@/features/journey/store";
import { BrandPanel } from "./BrandPanel";
import { GoogleMark } from "./GoogleMark";
import { checkCredentials, maskIdentifier, parseIdentifier, safeNext, type IdentifierCheck } from "./credentials";

const { brand, content, demoData } = productConfig;
const strings = content.auth;
/** Prototype latency, so loading states are seen rather than flashed. */
const NETWORK_MS = 900;
const IDS = { identifier: "signin-identifier", password: "signin-password", resetIdentifier: "reset-identifier" };

type View = "sign-in" | "reset" | "reset-sent" | "success";
type Busy = "none" | "password" | "google" | "reset" | "resend";
type CredentialError = { reason: "unknown-account" | "wrong-password"; identifier: string };
type ValidIdentifier = Extract<IdentifierCheck, { ok: true }>;

function identifierError(check: IdentifierCheck): string | undefined {
  if (check.ok) return undefined;
  return check.reason === "required" ? strings.identifierRequired : strings.identifierInvalid;
}

function focusField(id: string) {
  requestAnimationFrame(() => document.getElementById(id)?.focus());
}

/** View heading: takes focus when the card changes view, so keyboard and screen-reader users follow along. */
function ViewHeading({ title, body, focusOnMount }: { title: string; body?: ReactNode; focusOnMount: boolean }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (focusOnMount) ref.current?.focus();
  }, [focusOnMount]);
  return (
    <div className="flex flex-col gap-1.5">
      <h1 ref={ref} tabIndex={-1} className="text-balance text-h1 font-extrabold tracking-tight text-text focus:outline-none">
        {title}
      </h1>
      {body && <p className="text-sm text-text-muted sm:text-body">{body}</p>}
    </div>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-text-muted">
      <span aria-hidden="true" className="h-px flex-1 bg-border" />
      {label}
      <span aria-hidden="true" className="h-px flex-1 bg-border" />
    </div>
  );
}

function StatusIcon({ icon, tone }: { icon: string; tone: "success" | "primary" }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-14 items-center justify-center rounded-full",
        tone === "success" ? "bg-success-soft text-success-text" : "bg-primary-soft text-primary-dark",
      )}
    >
      <Icon name={icon} size={26} />
    </span>
  );
}

export function SignInScreen() {
  const state = useJourney();
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));

  const [view, setView] = useState<View>("sign-in");
  const [moved, setMoved] = useState(false);
  const [busy, setBusy] = useState<Busy>("none");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ identifier?: string; password?: string; reset?: string }>({});
  const [credentialError, setCredentialError] = useState<CredentialError | null>(null);
  const [resetTo, setResetTo] = useState<ValidIdentifier | null>(null);
  const [resent, setResent] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function go(nextView: View) {
    setMoved(true);
    setView(nextView);
  }

  function later(run: () => void) {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(run, NETWORK_MS);
  }

  function succeed() {
    journey.signIn();
    setBusy("none");
    go("success");
    later(() => router.replace(next));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (busy !== "none") return;
    const check = parseIdentifier(identifier);
    const found = { identifier: identifierError(check), password: password ? undefined : strings.passwordRequired };
    setErrors(found);
    setCredentialError(null);
    if (found.identifier || found.password || !check.ok) {
      focusField(found.identifier ? IDS.identifier : IDS.password);
      return;
    }
    setBusy("password");
    later(() => {
      const result = checkCredentials(check, password, state.profile);
      if (result.ok) {
        succeed();
        return;
      }
      setBusy("none");
      setCredentialError({ reason: result.reason, identifier: identifier.trim() });
      if (result.reason === "wrong-password") {
        setPassword("");
        focusField(IDS.password);
      } else {
        focusField(IDS.identifier);
      }
    });
  }

  function continueWithGoogle() {
    if (busy !== "none") return;
    setBusy("google");
    setCredentialError(null);
    later(succeed);
  }

  function openReset() {
    setErrors({});
    setCredentialError(null);
    setResent(false);
    go("reset");
  }

  function requestReset(event: FormEvent) {
    event.preventDefault();
    if (busy !== "none") return;
    const check = parseIdentifier(identifier);
    const message = identifierError(check);
    setErrors({ reset: message });
    if (message || !check.ok) {
      focusField(IDS.resetIdentifier);
      return;
    }
    setBusy("reset");
    later(() => {
      setBusy("none");
      setResetTo(check);
      go("reset-sent");
    });
  }

  function resend() {
    if (busy !== "none") return;
    setResent(false);
    setBusy("resend");
    later(() => {
      setBusy("none");
      setResent(true);
    });
  }

  function backToSignIn() {
    setErrors({});
    setResent(false);
    go("sign-in");
  }

  const locked = busy !== "none";

  return (
    <div className="container-page flex min-h-dvh flex-col gap-6 py-4 sm:py-8 lg:justify-center lg:py-10">
      <header className="mx-auto flex w-full max-w-[440px] flex-col gap-1 lg:hidden">
        <Logo name={brand.name} className="self-start" />
        <p className="text-sm text-text-muted">{brand.tagline}</p>
      </header>

      <div className="grid w-full flex-1 items-start gap-8 lg:mx-auto lg:max-w-6xl lg:flex-none lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:items-center lg:gap-10 xl:gap-16">
        <BrandPanel className="hidden lg:flex lg:h-[min(46rem,calc(100dvh-5rem))] lg:min-h-[38rem]" />

        <div className="mx-auto flex w-full max-w-[440px] flex-col gap-4 lg:justify-center">
          <Card padding="lg" className="flex flex-col gap-6 sm:p-8">
            {view === "sign-in" && (
              <>
                <ViewHeading title={strings.title} body={strings.subtitle} focusOnMount={moved} />

                {credentialError && (
                  <div role="alert" className="flex gap-3 rounded-md bg-danger-soft p-4">
                    <Icon name="alert" size={20} className="mt-0.5 shrink-0 text-danger-text" />
                    <div className="flex min-w-0 flex-col gap-1">
                      <p className="break-words text-sm font-bold text-danger-text">
                        {credentialError.reason === "unknown-account"
                          ? fillTemplate(strings.unknownAccountTitle, { identifier: credentialError.identifier })
                          : strings.wrongPasswordTitle}
                      </p>
                      <p className="text-sm text-text">
                        {credentialError.reason === "unknown-account"
                          ? strings.unknownAccountBody
                          : fillTemplate(strings.wrongPasswordBody, { identifier: credentialError.identifier })}
                      </p>
                      {credentialError.reason === "unknown-account" ? (
                        <Link href={routes.signUp()} className="inline-flex min-h-11 items-center gap-1 self-start text-sm font-semibold text-primary-dark hover:underline">
                          {strings.createAccount}
                          <Icon name="chevron-right" size={16} aria-hidden="true" />
                        </Link>
                      ) : (
                        <button type="button" onClick={openReset} className="inline-flex min-h-11 items-center gap-1 self-start text-sm font-semibold text-primary-dark hover:underline">
                          {strings.forgotPassword}
                          <Icon name="chevron-right" size={16} aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <form onSubmit={submit} noValidate aria-busy={busy === "password" || undefined} className="flex flex-col gap-5">
                  <Input
                    id={IDS.identifier}
                    label={strings.identifierLabel}
                    placeholder={strings.identifierPlaceholder}
                    leftIcon="profile"
                    type="text"
                    inputMode="email"
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    value={identifier}
                    readOnly={locked}
                    aria-required="true"
                    error={errors.identifier}
                    onChange={(event) => {
                      setIdentifier(event.target.value);
                      if (errors.identifier) setErrors({ ...errors, identifier: undefined });
                      if (credentialError?.reason === "unknown-account") setCredentialError(null);
                    }}
                  />
                  <div className="flex flex-col gap-1">
                    <Input
                      id={IDS.password}
                      label={strings.passwordLabel}
                      leftIcon="lock"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      readOnly={locked}
                      aria-required="true"
                      error={errors.password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        if (errors.password) setErrors({ ...errors, password: undefined });
                        if (credentialError?.reason === "wrong-password") setCredentialError(null);
                      }}
                      trailing={
                        <IconButton
                          icon={showPassword ? "eye-off" : "eye"}
                          label={showPassword ? strings.hidePassword : strings.showPassword}
                          aria-pressed={showPassword}
                          aria-controls={IDS.password}
                          className="text-text-muted hover:text-text"
                          onClick={() => setShowPassword(!showPassword)}
                        />
                      }
                    />
                    <button
                      type="button"
                      onClick={openReset}
                      disabled={locked}
                      className="inline-flex min-h-11 items-center self-end rounded-sm text-sm font-semibold text-primary-dark hover:underline disabled:text-text-muted disabled:no-underline"
                    >
                      {strings.forgotPassword}
                    </button>
                  </div>
                  <Button type="submit" size="lg" fullWidth loading={busy === "password"} disabled={locked && busy !== "password"}>
                    {busy === "password" ? strings.submitting : strings.submit}
                  </Button>
                </form>

                <Divider label={strings.or} />

                <Button variant="outline" size="lg" fullWidth loading={busy === "google"} disabled={locked && busy !== "google"} onClick={continueWithGoogle}>
                  <span className="inline-flex items-center gap-2.5">
                    {busy !== "google" && <GoogleMark />}
                    {busy === "google" ? strings.googleConnecting : strings.google}
                  </span>
                </Button>

                <p className="flex flex-wrap items-center justify-center gap-x-1.5 text-sm text-text-muted">
                  {strings.noAccount}
                  <Link href={routes.signUp()} className="inline-flex min-h-11 items-center font-semibold text-primary-dark hover:underline">
                    {strings.createAccount}
                  </Link>
                </p>
              </>
            )}

            {view === "reset" && (
              <>
                <ViewHeading title={strings.reset.title} body={strings.reset.body} focusOnMount={moved} />
                <form onSubmit={requestReset} noValidate className="flex flex-col gap-5">
                  <Input
                    id={IDS.resetIdentifier}
                    label={strings.identifierLabel}
                    placeholder={strings.identifierPlaceholder}
                    leftIcon="profile"
                    inputMode="email"
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    value={identifier}
                    readOnly={locked}
                    aria-required="true"
                    error={errors.reset}
                    onChange={(event) => {
                      setIdentifier(event.target.value);
                      if (errors.reset) setErrors({ ...errors, reset: undefined });
                    }}
                  />
                  <Button type="submit" size="lg" fullWidth loading={busy === "reset"}>
                    {busy === "reset" ? strings.reset.submitting : strings.reset.submit}
                  </Button>
                </form>
                <Button variant="ghost" leftIcon="chevron-left" className="self-center" disabled={locked} onClick={backToSignIn}>
                  {strings.reset.back}
                </Button>
              </>
            )}

            {view === "reset-sent" && resetTo && (
              <>
                <StatusIcon icon={resetTo.kind === "email" ? "mail" : "message"} tone="primary" />
                <ViewHeading
                  title={fillTemplate(strings.reset.sentTitle, { channel: strings.reset.channels[resetTo.kind] })}
                  body={fillTemplate(strings.reset.sentBody, { identifier: maskIdentifier(resetTo) })}
                  focusOnMount={moved}
                />
                <div className="flex flex-col gap-3">
                  <Button size="lg" fullWidth leftIcon="chevron-left" onClick={backToSignIn}>
                    {strings.reset.back}
                  </Button>
                  <Button variant="outline" size="lg" fullWidth loading={busy === "resend"} onClick={resend}>
                    {strings.reset.resend}
                  </Button>
                  <p role="status" className={resent ? "flex items-center justify-center gap-1.5 text-sm font-semibold text-success-text" : "sr-only"}>
                    {resent && <Icon name="check" size={16} aria-hidden="true" />}
                    {resent ? strings.reset.resent : ""}
                  </p>
                </div>
              </>
            )}

            {view === "success" && (
              <div role="status" className="flex flex-col items-start gap-5">
                <StatusIcon icon="check" tone="success" />
                <ViewHeading
                  title={strings.successTitle}
                  body={fillTemplate(strings.successBody, { name: state.profile.name.split(" ")[0] ?? state.profile.name })}
                  focusOnMount={moved}
                />
                <Spinner size={20} className="text-primary-dark" />
              </div>
            )}

            {view !== "success" && (
              <p className="flex items-start gap-2 border-t border-border pt-5 text-xs text-text-muted">
                <Icon name="lock" size={14} aria-hidden="true" className="mt-0.5 shrink-0" />
                {strings.privacy}
              </p>
            )}
          </Card>

          {view === "sign-in" && (
            <PrototypeControls title={strings.prototypeTitle} description={fillTemplate(strings.prototypeBody, { password: demoData.demoPassword })}>
              <Button
                size="sm"
                variant="outline"
                leftIcon="profile"
                disabled={locked}
                onClick={() => {
                  setIdentifier(state.profile.email);
                  setPassword(demoData.demoPassword);
                  setErrors({});
                  setCredentialError(null);
                }}
              >
                {strings.fillDemo}
              </Button>
            </PrototypeControls>
          )}
        </div>
      </div>
    </div>
  );
}
