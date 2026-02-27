import { useEffect, useState } from "react";
import api from "../../../../api"; // مسیر api خودت را تنظیم کن
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

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", role: "user" });

  const fetchUsers = () => {
    api
      .get("/users")
      .then((res) => setUsers(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // باز کردن دیالوگ افزودن یا ویرایش
  const handleOpenDialog = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({ name: user.name, email: user.email, role: user.role });
    } else {
      setEditingUser(null);
      setFormData({ name: "", email: "", role: "user" });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // ثبت یا ویرایش یوزر
  const handleSave = () => {
    if (editingUser) {
      // ویرایش
      api
        .put(`/users/${editingUser.id}`, formData)
        .then(() => {
          fetchUsers();
          handleCloseDialog();
        })
        .catch((err) => console.error(err));
    } else {
      // افزودن
      api
        .post("/users", formData)
        .then(() => {
          fetchUsers();
          handleCloseDialog();
        })
        .catch((err) => console.error(err));
    }
  };

  // حذف یوزر
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
      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between" }}>
        <h2>مدیریت کاربران</h2>
        <Button variant="contained" color="primary" onClick={() => handleOpenDialog()}>
          افزودن کاربر جدید
        </Button>
      </Box>

      <table>
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
              <td>{u.name}</td>
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

      {/* دیالوگ افزودن / ویرایش */}
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
          <FormControl>
            <InputLabel>نقش</InputLabel>
            <Select
              value={formData.role}
              label="نقش"
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
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