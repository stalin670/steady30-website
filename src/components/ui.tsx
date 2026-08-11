import type { ReactNode } from 'react';

/**
 * Web equivalents of ../Steady30/src/components/*. Same tokens, same radii, same
 * variant names, so a screen ported from the app reads the same in both trees.
 */

export const Card = ({
  children,
  tone = 'card',
  className = ''
}: {
  children: ReactNode;
  tone?: 'card' | 'tint' | 'accent' | 'outline' | 'danger';
  className?: string;
}) => {
  const tones = {
    card: 'border border-line bg-card',
    tint: 'bg-primary-muted',
    accent: 'bg-accent-muted',
    outline: 'border border-ink bg-transparent',
    danger: 'border border-danger bg-card'
  };
  return (
    <section className={`flex flex-col gap-4 rounded-2xl p-6 ${tones[tone]} ${className}`}>
      {children}
    </section>
  );
};

export const CardTitle = ({ children }: { children: ReactNode }) => (
  <h2 className="text-[17px] font-bold">{children}</h2>
);

export const Helper = ({ children }: { children: ReactNode }) => (
  <p className="text-[14px] text-muted">{children}</p>
);

export const Eyebrow = ({ children }: { children: ReactNode }) => (
  <p className="font-mono text-[11px] font-bold tracking-[0.1em] text-muted uppercase">
    {children}
  </p>
);

const bannerTones = {
  danger: 'border-danger bg-danger-muted',
  success: 'border-accent bg-accent-muted',
  info: 'border-line-strong bg-card',
  warning: 'border-warning bg-warning-muted'
};

export const Banner = ({
  variant,
  children
}: {
  variant: keyof typeof bannerTones;
  children: ReactNode;
}) => (
  <p
    role={variant === 'danger' ? 'alert' : 'status'}
    className={`rounded-xl border px-4 py-3 text-[14px] ${bannerTones[variant]}`}
  >
    {children}
  </p>
);

const buttonBase =
  'inline-flex min-h-12 items-center justify-center rounded-full px-6 text-center font-bold disabled:cursor-not-allowed disabled:opacity-55';

const buttonVariants = {
  primary: 'bg-primary text-on-primary hover:bg-primary-hover',
  outline: 'border border-line-strong hover:bg-card-hover',
  danger: 'border border-danger text-danger hover:bg-danger-muted'
};

export const Button = ({
  children,
  variant = 'primary',
  loading = false,
  full = false,
  ...props
}: {
  children: ReactNode;
  variant?: keyof typeof buttonVariants;
  loading?: boolean;
  full?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...props}
    disabled={props.disabled || loading}
    aria-busy={loading || undefined}
    className={`${buttonBase} ${buttonVariants[variant]} ${full ? 'w-full' : ''}`}
  >
    {loading ? 'Working…' : children}
  </button>
);

const fieldShell =
  'w-full rounded-[10px] border border-line bg-input px-4 py-3 text-[16px] text-ink placeholder:text-subtle';

export const Field = ({
  label,
  hint,
  error,
  children,
  id
}: {
  label: string;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
  id: string;
}) => (
  <div className="flex flex-col gap-2">
    <label htmlFor={id} className="text-[14px] font-semibold">
      {label}
    </label>
    {children}
    {error ? (
      <p id={`${id}-error`} className="text-[13px] text-danger">
        {error}
      </p>
    ) : hint ? (
      <p id={`${id}-hint`} className="text-[13px] text-subtle">
        {hint}
      </p>
    ) : null}
  </div>
);

export const Input = ({
  label,
  hint,
  error,
  id,
  ...props
}: {
  label: string;
  hint?: ReactNode;
  error?: string;
  id: string;
} & React.InputHTMLAttributes<HTMLInputElement>) => (
  <Field label={label} hint={hint} error={error} id={id}>
    <input
      {...props}
      id={id}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
      className={`${fieldShell} ${error ? 'border-danger' : ''}`}
    />
  </Field>
);

export const TextArea = ({
  label,
  hint,
  error,
  id,
  ...props
}: {
  label: string;
  hint?: ReactNode;
  error?: string;
  id: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <Field label={label} hint={hint} error={error} id={id}>
    <textarea
      {...props}
      id={id}
      rows={props.rows ?? 5}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
      className={`${fieldShell} resize-y leading-[1.55] ${error ? 'border-danger' : ''}`}
    />
  </Field>
);

export const Checkbox = ({
  checked,
  onToggle,
  label,
  sublabel,
  id
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
  sublabel?: ReactNode;
  id: string;
}) => (
  <div className="flex gap-3 border-t border-line py-4 first:border-t-0 first:pt-0">
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={onToggle}
      className="mt-1 size-[18px] shrink-0 accent-[var(--primary)]"
    />
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-[15px] font-semibold">
        {label}
      </label>
      {sublabel ? <p className="text-[13px] text-muted">{sublabel}</p> : null}
    </div>
  </div>
);

export const RadioGroup = <T extends string>({
  name,
  value,
  onSelect,
  options
}: {
  name: string;
  value: T;
  onSelect: (next: T) => void;
  options: { value: T; label: string; sublabel?: string }[];
}) => (
  <div role="radiogroup" aria-label={name} className="flex flex-col gap-2">
    {options.map((option) => {
      const selected = value === option.value;
      return (
        <label
          key={option.value}
          className={`flex cursor-pointer gap-3 rounded-[10px] border p-4 ${
            selected ? 'border-ink bg-primary-muted' : 'border-line hover:bg-card-hover'
          }`}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={selected}
            onChange={() => onSelect(option.value)}
            className="mt-1 size-[18px] shrink-0 accent-[var(--primary)]"
          />
          <span className="flex flex-col gap-0.5">
            <span className="text-[15px] font-semibold">{option.label}</span>
            {option.sublabel ? (
              <span className="text-[13px] text-muted">{option.sublabel}</span>
            ) : null}
          </span>
        </label>
      );
    })}
  </div>
);

/** Multi-select chips — the app's selected/unselected chip treatment. */
export const ChipGroup = ({
  legend,
  options,
  selected,
  onToggle,
  tone = 'primary'
}: {
  legend: string;
  options: readonly string[] | readonly { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
  tone?: 'primary' | 'accent';
}) => {
  const items = options.map((option) =>
    typeof option === 'string' ? { value: option, label: option } : option
  );
  const on =
    tone === 'accent'
      ? 'border-accent bg-accent text-on-accent'
      : 'border-primary bg-primary text-on-primary';

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-2 text-[14px] font-semibold">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
          const isSelected = selected.includes(item.value);
          return (
            <button
              key={item.value}
              type="button"
              role="checkbox"
              aria-checked={isSelected}
              onClick={() => onToggle(item.value)}
              className={`rounded-full border px-4 py-2 text-[14px] ${
                isSelected ? on : 'border-line bg-card hover:border-line-strong'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
};

/** Page header matching ../Steady30/src/components/header.tsx. */
export const ScreenHeader = ({
  title,
  subtitle,
  step
}: {
  title: string;
  subtitle?: string;
  step?: string;
}) => (
  <header className="flex flex-col gap-2">
    {step ? <Eyebrow>{step}</Eyebrow> : null}
    <h1 className="text-[clamp(30px,5vw,40px)] font-extrabold">{title}</h1>
    {subtitle ? <p className="text-[18px] text-muted">{subtitle}</p> : null}
  </header>
);

/** Narrow single-column shell used by every authenticated form screen. */
export const FormScreen = ({ children }: { children: ReactNode }) => (
  <div className="mx-auto flex w-full max-w-[680px] flex-col gap-6 px-5 py-16">{children}</div>
);
