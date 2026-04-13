import { useEffect, useState } from "react";
import api from "../../../../api";
import ReportLayout from "../../../../components/ReportLayout";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { FaKey } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function UsersPage() {
  // موقت برای تست – در نهایی از AuthContext استفاده کنید
  const currentUser = { id: 1, name: "Test User", role: "admin" };

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user",
    password: "",
  });
  const [loading, setLoading] = useState(true);

  const isAdminOrSuper = ["admin", "super_admin"].includes(currentUser.role.toLowerCase());

  useEffect(() => {
    Promise.all([
      api.get("/users"),
      api.get("/roles")
    ])
      .then(([usersRes, rolesRes]) => {
        setUsers(usersRes.data);
        setRoles(rolesRes.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error("❌ خطا در دریافت اطلاعات");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <ReportLayout>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
          <CircularProgress />
        </Box>
      </ReportLayout>
    );
  }

  if (currentUser.role === "hospital_head") {
    return (
      <ReportLayout>
        <Box sx={{ textAlign: "center", mt: 5 }}>
          <h2>شما فقط اجازه مشاهده گزارش‌ها را دارید</h2>
          <NavLink to="/reports" style={{ textDecoration: "none" }}>
            <Button variant="contained" color="primary" sx={{ mt: 2 }}>
              مشاهده گزارش‌ها
            </Button>
          </NavLink>
        </Box>
      </ReportLayout>
    );
  }

  const handleOpenDialog = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.roles?.[0]?.name || "user",
        password: "", // همیشه خالی شروع می‌شود
      });
    } else {
      setEditingUser(null);
      setFormData({ name: "", email: "", role: "user", password: "" });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => setOpenDialog(false);

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error("❌ نام کاربر را وارد کنید");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("❌ ایمیل کاربر را وارد کنید");
      return;
    }
    if (!editingUser && !formData.password) {
      toast.error("❌ رمز عبور را وارد کنید");
      return;
    }

    if (editingUser) {
      // 🔹 فقط در صورتی که پسورد جدید وارد شده باشد آن را ارسال کن
      const payload = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      };
      if (formData.password && formData.password.trim() !== "") {
        payload.password = formData.password;
      }

      api.put(`/users/${editingUser.id}`, payload)
        .then((res) => {
          setUsers(users.map(u => (u.id === editingUser.id ? res.data : u)));
          toast.success("✅ کاربر با موفقیت ویرایش شد");
          handleCloseDialog();
        })
        .catch(err => {
          console.error(err);
          toast.error("❌ خطا در ویرایش کاربر");
        });
    } else {
      api.post("/users", formData)
        .then(res => {
          setUsers([...users, res.data]);
          toast.success("✅ کاربر با موفقیت اضافه شد");
          handleCloseDialog();
        })
        .catch(err => {
          console.error(err);
          toast.error("❌ خطا در افزودن کاربر");
        });
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("آیا مطمئن هستید می‌خواهید این کاربر را حذف کنید؟")) {
      api.delete(`/users/${id}`)
        .then(() => {
          setUsers(users.filter(u => u.id !== id));
          toast.success("✅ کاربر با موفقیت حذف شد");
        })
        .catch(err => {
          console.error(err);
          toast.error("❌ خطا در حذف کاربر");
        });
    }
  };

  return (
    <ReportLayout>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={true}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        limit={5}
        style={{
          zIndex: 9999999,
          position: 'fixed',
          top: '20px',
          right: '20px',
          left: 'auto',
          width: 'auto',
          maxWidth: '350px',
          transform: 'none'
        }}
      />

      <h2 style={{ textAlign: "center", marginBottom: 20 }}>مدیریت کاربران</h2>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>نام</th>
            <th>ایمیل</th>
            <th>نقش</th>
            <th>عملیات</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.name} <FaKey style={{ marginLeft: 5, color: "#007bff" }} /></td>
              <td>{u.email}</td>
              <td>
                {u.roles && u.roles.length > 0
                  ? u.roles.map(r => r.name).join(", ")
                  : "بدون رول"}
              </td>
              <td>
                <IconButton color="primary" onClick={() => handleOpenDialog(u)}>
                  <EditIcon />
                </IconButton>
                <IconButton color="error" onClick={() => handleDelete(u.id)}>
                  <DeleteIcon />
                </IconButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <Button variant="contained" color="primary" startIcon={<FaKey />} onClick={() => handleOpenDialog()}>
          افزودن کاربر جدید
        </Button>
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{editingUser ? "ویرایش کاربر" : "افزودن کاربر"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 300 }}>
          <TextField
            label="نام"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            label="ایمیل"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
          />
          <TextField
            label={editingUser ? "تغییر پسورد (اختیاری)" : "پسورد"}
            type="password"
            value={formData.password}
            onChange={e => setFormData({ ...formData, password: e.target.value })}
          />
          <FormControl fullWidth>
            <InputLabel>نقش</InputLabel>
            <Select
              value={formData.role}
              label="نقش"
              onChange={e => setFormData({ ...formData, role: e.target.value })}
            >
              <MenuItem value="user">User</MenuItem>
              {roles.map(role => (
                <MenuItem key={role.id} value={role.name}>
                  {role.name}
                </MenuItem>
              ))}
              <MenuItem value="hospital_head">رئیس عمومی شفاخانه</MenuItem>
              {isAdminOrSuper && <MenuItem value="super_admin">Super Admin</MenuItem>}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>لغو</Button>
          <Button variant="contained" color="primary" onClick={handleSave}>
            {editingUser ? "ذخیره تغییرات" : "افزودن"}
          </Button>
        </DialogActions>
      </Dialog>
    </ReportLayout>
  );
}