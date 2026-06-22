// frontend/src/components/ui/Button.jsx
import styles from "./Button.module.css";

export default function Button({
  children,
  variant = "primary", // primary | secondary | ghost | danger
  size = "md",         // sm | md | lg
  fullWidth = false,
  loading = false,
  disabled = false,
  ...props
}) {
  const cls = [styles.btn, styles[variant], styles[size], fullWidth && styles.full]
    .filter(Boolean)
    .join(" ");
  return (
    <button className={cls} disabled={disabled || loading} {...props}>
      {loading ? <span className={styles.spinner} aria-hidden /> : children}
    </button>
  );
}
