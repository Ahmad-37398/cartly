// frontend/src/pages/RegisterPage.jsx
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { register, clearAuthError } from "../features/auth/authSlice";
import { fetchCart } from "../features/cart/cartSlice";
import { addToast } from "../features/ui/uiSlice";
import Button from "../components/ui/Button";
import styles from "./Auth.module.css";

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error, isAuthenticated } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { dispatch(clearAuthError()); }, [dispatch]);
  useEffect(() => { if (isAuthenticated) navigate("/"); }, [isAuthenticated, navigate]);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault(); // stops browser default form submission
    setSubmitting(true);
    const res = await dispatch(register(form));
    setSubmitting(false);
    if (register.fulfilled.match(res)) {
      dispatch(fetchCart());
      dispatch(addToast({ type: "success", message: "Account created!" }));
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <h1 className={styles.title}>Create account</h1>
        <p className={styles.sub}>Start shopping in seconds</p>

        {/* form tag fixes the Chrome "[DOM] Password field not in form" warning */}
        <form onSubmit={onSubmit} noValidate>
          <div className={styles.field}>
            <label htmlFor="name">Name</label>
            <input
              id="name" name="name"
              value={form.name} onChange={onChange}
              autoComplete="name"
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input
              id="email" name="email" type="email"
              value={form.email} onChange={onChange}
              autoComplete="email"
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="password">Password</label>
            <input
              id="password" name="password" type="password"
              value={form.password} onChange={onChange}
              autoComplete="new-password"
            />
            <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-subtle)", letterSpacing: "var(--tracking-wide)" }}>
              At least 8 characters
            </span>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <Button fullWidth size="lg" loading={submitting}>Create account</Button>
        </form>

        <p className={styles.foot}>Already have an account? <Link to="/login">Log in</Link></p>
      </div>
    </div>
  );
}
