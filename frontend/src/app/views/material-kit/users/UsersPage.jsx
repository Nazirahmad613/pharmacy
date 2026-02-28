import { useEffect, useState } from "react";
import api from "../../../../api";
import MainLayoutjur from "../../../../components/Mainlayoutjur";
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
// import { useAuth } from "app/contexts/AuthContext"; // غیرفعال کردیم برای تست
import { NavLink } from "react-router-dom";

export default function UsersPage() {
  // 🔹 برای تست، یک currentUser موقت تعریف می‌کنیم
  const currentUser = { id: 1, name: "Test User", role: "admin" };

  const [users, setUsers] = useState([]);
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

  // 🔹 فقط وقتی currentUser آماده است
  useEffect(() => {
    // شبیه‌سازی درخواست API
    api
      .get("/users")
      .then((res) => {
        setUsers(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <MainLayoutjur>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
          <CircularProgress />
        </Box>
      </MainLayoutjur>
    );
  }

  if (currentUser.role === "hospital_head") {
    return (
      <MainLayoutjur>
        <Box sx={{ textAlign: "center", mt: 5 }}>
          <h2>شما فقط اجازه مشاهده گزارش‌ها را دارید</h2>
          <NavLink to="/reports" style={{ textDecoration: "none" }}>
            <Button variant="contained" color="primary" sx={{ mt: 2 }}>
              مشاهده گزارش‌ها
            </Button>
          </NavLink>
        </Box>
      </MainLayoutjur>
    );
  }

  // ===== بقیه کد بدون تغییر =====
  const handleOpenDialog = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({ name: user.name, email: user.email, role: user.role, password: "" });
    } else {
      setEditingUser(null);
      setFormData({ name: "", email: "", role: "user", password: "" });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => setOpenDialog(false);

  const handleSave = () => {
    if (editingUser) {
      api.put(`/users/${editingUser.id}`, formData)
        .then(() => {
          setUsers(users.map(u => (u.id === editingUser.id ? { ...u, ...formData } : u)));
          handleCloseDialog();
        })
        .catch(console.error);
    } else {
      api.post("/users", formData)
        .then(res => {
          setUsers([...users, res.data]);
          handleCloseDialog();
        })
        .catch(console.error);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("آیا مطمئن هستید می‌خواهید این کاربر را حذف کنید؟")) {
      api.delete(`/users/${id}`)
        .then(() => setUsers(users.filter(u => u.id !== id)))
        .catch(console.error);
    }
  };

  return (
    <MainLayoutjur>
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
              <td>{u.role}</td>
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
              <MenuItem value="admin">Admin</MenuItem>
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
    </MainLayoutjur>
  );
}