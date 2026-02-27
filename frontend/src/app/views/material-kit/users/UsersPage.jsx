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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { FaKey } from "react-icons/fa"; // آیکون کلید
import { useAuth } from "app/contexts/AuthContext"; // دسترسی به کاربر فعلی
import { NavLink } from "react-router-dom";

export default function UsersPage() {
  const { currentUser } = useAuth();

  // 🔹 بررسی نقش کاربر: اگر رئیس عمومی شفاخانه است، فقط گزارش‌ها را ببیند
  if (currentUser?.role === "hospital_head") {
    return (
      <MainLayoutjur>
        <h2 style={{ textAlign: "center", marginBottom: 20 }}>
          شما فقط اجازه مشاهده گزارش‌ها را دارید
        </h2>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <NavLink to="/reports" style={{ textDecoration: "none" }}>
            <Button variant="contained" color="primary">
              مشاهده گزارش‌ها
            </Button>
          </NavLink>
        </Box>
      </MainLayoutjur>
    );
  }

  // بقیه کاربران (admin یا user) اجازه مدیریت کاربران را دارند
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", role: "user", password: "" });

  const fetchUsers = () => {
    api
      .get("/users")
      .then((res) => setUsers(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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
      api
        .put(`/users/${editingUser.id}`, formData)
        .then(() => {
          fetchUsers();
          handleCloseDialog();
        })
        .catch((err) => console.error(err));
    } else {
      api
        .post("/users", formData)
        .then(() => {
          fetchUsers();
          handleCloseDialog();
        })
        .catch((err) => console.error(err));
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("آیا مطمئن هستید می‌خواهید این کاربر را حذف کنید؟")) {
      api
        .delete(`/users/${id}`)
        .then(() => fetchUsers())
        .catch((err) => console.error(err));
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
          {users.map((u) => (
            <tr key={u.id}>
              <td>
                {u.name} <FaKey style={{ marginLeft: 5, color: "#007bff" }} />
              </td>
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
        <Button
          variant="contained"
          color="primary"
          startIcon={<FaKey />}
          onClick={() => handleOpenDialog()}
        >
          افزودن کاربر جدید
        </Button>
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{editingUser ? "ویرایش کاربر" : "افزودن کاربر"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 300 }}>
          <TextField
            label="نام"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            label="ایمیل"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <TextField
            label={editingUser ? "تغییر پسورد (اختیاری)" : "پسورد"}
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <FormControl>
            <InputLabel>نقش</InputLabel>
            <Select
              value={formData.role}
              label="نقش"
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="hospital_head">رئیس عمومی شفاخانه</MenuItem>
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