// frontend/src/pages/LoginPage.jsx
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { login, clearAuthError } from "../features/auth/authSlice";
import { fetchCart } from "../features/cart/cartSlice";
import { addToast } from "../features/ui/uiSlice";
import Button from "../components/ui/Button";
import styles from "./Auth.module.css";

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error, isAuthenticated, role } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { dispatch(clearAuthError()); }, [dispatch]);
  useEffect(() => {
    if (isAuthenticated) navigate(role === "admin" ? "/admin" : "/");
  }, [isAuthenticated, role, navigate]);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault(); // stops browser default form submission
    setSubmitting(true);
    const res = await dispatch(login(form));
    setSubmitting(false);
    if (login.fulfilled.match(res)) {
      if (res.payload.role === "customer") dispatch(fetchCart());
      dispatch(addToast({ type: "success", message: "Welcome back!" }));
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.sub}>Log in to your account</p>

        {/* form tag fixes the Chrome "[DOM] Password field not in form" warning */}
        <form onSubmit={onSubmit} noValidate>
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
              autoComplete="current-password"
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <Button fullWidth size="lg" loading={submitting}>Log in</Button>
        </form>

        <p className={styles.foot}>No account? <Link to="/register">Create one</Link></p>
      </div>
    </div>
  );
}
