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
  Avatar,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { FaKey, FaUserCircle } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../../contexts/AuthContext"; // اضافه شده

export default function UsersPage() {
  // استفاده از AuthContext به جای currentUser موقت
  const { user: currentUser, updateUser } = useAuth(); // اصلاح شده

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user",
    password: "",
    avatar: null,
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const isAdminOrSuper = currentUser && ["admin", "super_admin"].includes(currentUser.role?.toLowerCase() || "");

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

  if (currentUser?.role === "hospital_head") {
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
        password: "",
        avatar: null,
      });
      setAvatarPreview(user.avatar_url || null);
    } else {
      setEditingUser(null);
      setFormData({ name: "", email: "", role: "user", password: "", avatar: null });
      setAvatarPreview(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setAvatarPreview(null);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, avatar: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
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

    setUploading(true);

    if (editingUser) {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('role', formData.role);
      
      if (formData.password && formData.password.trim() !== "") {
        formDataToSend.append('password', formData.password);
      }
      
      if (formData.avatar instanceof File) {
        formDataToSend.append('avatar', formData.avatar);
      }
      
      formDataToSend.append('_method', 'PUT');

      try {
        const res = await api.post(`/users/${editingUser.id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        const updatedUser = res.data;
        setUsers(users.map(u => (u.id === editingUser.id ? updatedUser : u)));
        
        // ✅ به‌روزرسانی کاربر فعلی اگر خودش باشد
        if (currentUser && currentUser.id === editingUser.id) {
          updateUser(updatedUser);
          toast.success("✅ اطلاعات شما با موفقیت به‌روزرسانی شد");
        } else {
          toast.success("✅ کاربر با موفقیت ویرایش شد");
        }
        
        handleCloseDialog();
      } catch (err) {
        console.error(err);
        toast.error("❌ خطا در ویرایش کاربر");
      } finally {
        setUploading(false);
      }
    } else {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('role', formData.role);
      
      if (formData.avatar instanceof File) {
        formDataToSend.append('avatar', formData.avatar);
      }

      try {
        const res = await api.post("/users", formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setUsers([...users, res.data]);
        toast.success("✅ کاربر با موفقیت اضافه شد");
        handleCloseDialog();
      } catch (err) {
        console.error(err);
        toast.error("❌ خطا در افزودن کاربر");
      } finally {
        setUploading(false);
      }
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
            <th>عکس</th>
            <th>نام</th>
            <th>ایمیل</th>
            <th>نقش</th>
            <th>عملیات</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td style={{ textAlign: "center" }}>
                <Avatar 
                  src={u.avatar_url} 
                  alt={u.name}
                  sx={{ width: 40, height: 40 }}
                >
                  {!u.avatar_url && <FaUserCircle />}
                </Avatar>
              </td>
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
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <Box sx={{ position: "relative", display: "inline-block" }}>
              <Avatar
                src={avatarPreview || (editingUser?.avatar_url)}
                alt={formData.name || "Avatar"}
                sx={{ width: 100, height: 100, cursor: "pointer" }}
                onClick={() => document.getElementById('avatar-input').click()}
              >
                {!avatarPreview && !editingUser?.avatar_url && <FaUserCircle style={{ fontSize: 80 }} />}
              </Avatar>
              <input
                id="avatar-input"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleAvatarChange}
              />
              <Button
                size="small"
                variant="outlined"
                onClick={() => document.getElementById('avatar-input').click()}
                sx={{ mt: 1, display: "block", mx: "auto" }}
              >
                انتخاب عکس
              </Button>
            </Box>
          </Box>
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
          <Button variant="contained" color="primary" onClick={handleSave} disabled={uploading}>
            {uploading ? <CircularProgress size={24} /> : (editingUser ? "ذخیره تغییرات" : "افزودن")}
          </Button>
        </DialogActions>
      </Dialog>
    </ReportLayout>
  );
}