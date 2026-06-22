// frontend/src/pages/admin/UsersAdminPage.jsx
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchUsers, updateUserRole, deleteUser } from "../../features/admin/adminSlice";
import { addToast } from "../../features/ui/uiSlice";
import styles from "./AdminTable.module.css";

export default function UsersAdminPage() {
  const dispatch = useDispatch();
  const { items } = useSelector((s) => s.admin.users);
  const me = useSelector((s) => s.auth.user);

  useEffect(() => { dispatch(fetchUsers()); }, [dispatch]);

  const changeRole = async (id, role) => {
    const res = await dispatch(updateUserRole({ id, role }));
    if (updateUserRole.fulfilled.match(res)) dispatch(addToast({ type: "success", message: "Role updated" }));
    else dispatch(addToast({ type: "error", message: res.payload || "Update failed" }));
  };

  const remove = async (u) => {
    if (!window.confirm(`Delete ${u.name}?`)) return;
    const res = await dispatch(deleteUser(u.id));
    if (deleteUser.fulfilled.match(res)) dispatch(addToast({ type: "success", message: "User deleted" }));
    else dispatch(addToast({ type: "error", message: res.payload || "Delete failed" }));
  };

  return (
    <div>
      <div className={styles.head}><h1 className={styles.h1}>Users</h1></div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Orders</th><th>Role</th><th></th></tr>
          </thead>
          <tbody>
            {items.map((u) => {
              const isSelf = u.id === me?.id;
              return (
                <tr key={u.id}>
                  <td><strong>{u.name}</strong>{isSelf && <span style={{ color: "var(--color-primary)", fontSize: "12px" }}> (you)</span>}</td>
                  <td>{u.email}</td>
                  <td>{u.orderCount}</td>
                  <td>
                    {isSelf ? (
                      <span className={`${styles.badge} ${styles.roleAdmin}`}>{u.role}</span>
                    ) : (
                      <select className={styles.cellSelect} value={u.role} onChange={(e) => changeRole(u.id, e.target.value)}>
                        <option value="customer">customer</option>
                        <option value="admin">admin</option>
                      </select>
                    )}
                  </td>
                  <td>
                    {!isSelf && <button className={`${styles.iconBtn} ${styles.danger}`} onClick={() => remove(u)}>Delete</button>}
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && <tr><td colSpan="5" className={styles.muted}>No users.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
