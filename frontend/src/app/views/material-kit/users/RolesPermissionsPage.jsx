import { useState, useEffect } from "react";
import MainLayoutjur from "../../../../components/Mainlayoutjur";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "app/contexts/AuthContext";
import AdminRoute from "../AdminRoute";

export default function RolesPermissionsPage() {
  const { api } = useAuth();
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [newRole, setNewRole] = useState("");
  const [newPermission, setNewPermission] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Pagination states for roles
  const [rolesCurrentPage, setRolesCurrentPage] = useState(1);
  const [rolesPerPage] = useState(5);

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await api.get("/roles");
      setRoles(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log(err);
      toast.error("خطا در بارگذاری رول‌ها");
    }
  };

  const fetchPermissions = async () => {
    try {
      const res = await api.get("/permissions");
      setPermissions(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log(err);
      toast.error("خطا در بارگذاری پرمیشن‌ها");
    }
  };

  const handleAddRole = async () => {
    if (!newRole) return toast.warning("نام رول را وارد کنید");
    try {
      await api.post("/roles", { name: newRole });
      toast.success("رول با موفقیت اضافه شد");
      setNewRole("");
      fetchRoles();
    } catch (err) {
      console.log(err);
      toast.error("خطا در ایجاد رول جدید");
    }
  };

  const handleDeleteRole = async (roleId) => {
    try {
      await api.delete(`/roles/${roleId}`);
      toast.success("رول با موفقیت حذف شد");
      fetchRoles();
    } catch (err) {
      console.log(err);
      toast.error("خطا در حذف رول");
    }
  };

  const handleAddPermission = async () => {
    if (!newPermission) return toast.warning("نام پرمیشن را وارد کنید");
    try {
      await api.post("/permissions", { name: newPermission });
      toast.success("پرمیشن با موفقیت اضافه شد");
      setNewPermission("");
      fetchPermissions();
    } catch (err) {
      console.log(err);
      toast.error("خطا در ایجاد پرمیشن جدید");
    }
  };

  const handleDeletePermission = async (permId) => {
    try {
      await api.delete(`/permissions/${permId}`);
      toast.success("پرمیشن با موفقیت حذف شد");
      fetchPermissions();
      // Clean up selectedPermissions
      setSelectedPermissions((prev) => {
        const newState = { ...prev };
        Object.keys(newState).forEach(roleId => {
          newState[roleId] = newState[roleId].filter(id => id !== permId);
        });
        return newState;
      });
    } catch (err) {
      console.log(err);
      toast.error("خطا در حذف پرمیشن");
    }
  };

  const handleAssignPermissions = async (roleId) => {
    if (!selectedPermissions[roleId] || selectedPermissions[roleId].length === 0) {
      return toast.warning("حداقل یک پرمیشن انتخاب کنید");
    }
    
    try {
      await api.post(`/roles/${roleId}/permissions`, { 
        permissions: selectedPermissions[roleId]
      });
      toast.success("پرمیشن‌ها با موفقیت اختصاص داده شدند");
      
      // Clear selected permissions for this role after successful assignment
      setSelectedPermissions((prev) => ({
        ...prev,
        [roleId]: []
      }));
      
      fetchRoles();
    } catch (err) {
      console.log(err);
      toast.error("خطا در اختصاص پرمیشن‌ها");
    }
  };

  const handleRemovePermissionFromRole = async (roleId, permissionId) => {
    try {
      await api.delete(`/roles/${roleId}/permissions/${permissionId}`);
      toast.success("پرمیشن با موفقیت از رول حذف شد");
      fetchRoles();
    } catch (err) {
      console.log(err);
      toast.error("خطا در حذف پرمیشن از رول");
    }
  };

  const handleSelectPermission = (roleId, permissionId) => {
    setSelectedPermissions((prev) => {
      const currentSelected = prev[roleId] || [];
      const newSelected = currentSelected.includes(permissionId)
        ? currentSelected.filter(id => id !== permissionId)
        : [...currentSelected, permissionId];
      
      return {
        ...prev,
        [roleId]: newSelected
      };
    });
  };

  const filteredPermissions = permissions.filter((perm) =>
    perm.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination for permissions
  const permIndexOfLast = currentPage * perPage;
  const permIndexOfFirst = permIndexOfLast - perPage;
  const currentPermissions = filteredPermissions.slice(permIndexOfFirst, permIndexOfLast);
  const permTotalPages = Math.ceil(filteredPermissions.length / perPage);

  // Pagination for roles
  const rolesIndexOfLast = rolesCurrentPage * rolesPerPage;
  const rolesIndexOfFirst = rolesIndexOfLast - rolesPerPage;
  const currentRoles = roles.slice(rolesIndexOfFirst, rolesIndexOfLast);
  const rolesTotalPages = Math.ceil(roles.length / rolesPerPage);

  return (
    <AdminRoute>
      <MainLayoutjur>
        <div className="p-6" dir="rtl">
          <h1 className="text-2xl font-bold mb-4">مدیریت رول‌ها و پرمیشن‌ها</h1>

          <div className="mb-6 flex gap-4 flex-wrap">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="نام رول جدید"
                className="border p-2 rounded"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
              />
              <button className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors" onClick={handleAddRole}>
                اضافه کردن رول
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="نام پرمیشن جدید"
                className="border p-2 rounded"
                value={newPermission}
                onChange={(e) => setNewPermission(e.target.value)}
              />
              <button className="bg-purple-600 text-white p-2 rounded hover:bg-purple-700 transition-colors" onClick={handleAddPermission}>
                اضافه کردن پرمیشن
              </button>
            </div>

            <div className="mr-auto">
              <input
                type="text"
                placeholder="جستجوی پرمیشن‌ها"
                className="border p-2 rounded"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Roles Table */}
          <div className="mb-8">
            <h2 className="font-semibold mb-4 text-lg">لیست رول‌ها</h2>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-3 text-right">نام رول</th>
                  <th className="border border-gray-300 p-3 text-right">پرمیشن‌های فعلی</th>
                  <th className="border border-gray-300 p-3 text-right">انتخاب پرمیشن جدید</th>
                  <th className="border border-gray-300 p-3 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {currentRoles.map((role) => (
                  <tr key={role.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-3 font-medium">{role.name}</td>
                    <td className="border border-gray-300 p-3">
                      <div className="flex flex-wrap gap-1">
                        {role.permissions && role.permissions.length > 0 ? (
                          role.permissions.map((perm) => (
                            <span key={perm.id} className="inline-flex items-center bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded ml-1 mb-1">
                              {perm.name}
                              <button
                                onClick={() => handleRemovePermissionFromRole(role.id, perm.id)}
                                className="mr-1 text-red-600 hover:text-red-800 font-bold text-lg"
                                title="حذف پرمیشن"
                              >
                                ×
                              </button>
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500 text-sm">بدون پرمیشن</span>
                        )}
                      </div>
                    </td>
                    <td className="border border-gray-300 p-3">
                      <div className="flex flex-col">
                        <div className="flex flex-wrap gap-2 mb-2 max-h-40 overflow-y-auto p-1">
                          {permissions.map((perm) => {
                            const isSelected = selectedPermissions[role.id]?.includes(perm.id);
                            return (
                              <button
                                key={perm.id}
                                onClick={() => handleSelectPermission(role.id, perm.id)}
                                className={`px-2 py-1 text-sm rounded transition-colors ${
                                  isSelected 
                                    ? 'bg-green-600 text-white' 
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                              >
                                {perm.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </td>
                    <td className="border border-gray-300 p-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
                          onClick={() => handleAssignPermissions(role.id)}
                        >
                          اختصاص
                        </button>
                        <button
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
                          onClick={() => handleDeleteRole(role.id)}
                        >
                          حذف رول
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Roles Pagination */}
            {rolesTotalPages > 1 && (
              <div className="mt-4 flex justify-center gap-2">
                <button
                  onClick={() => setRolesCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={rolesCurrentPage === 1}
                  className={`px-3 py-1 rounded ${
                    rolesCurrentPage === 1 
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  قبلی
                </button>
                {Array.from({ length: rolesTotalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    className={`px-3 py-1 rounded ${
                      rolesCurrentPage === i + 1 
                        ? "bg-blue-600 text-white" 
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                    onClick={() => setRolesCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setRolesCurrentPage(prev => Math.min(prev + 1, rolesTotalPages))}
                  disabled={rolesCurrentPage === rolesTotalPages}
                  className={`px-3 py-1 rounded ${
                    rolesCurrentPage === rolesTotalPages 
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  بعدی
                </button>
              </div>
            )}
          </div>

          {/* Permissions Table */}
          <div>
            <h2 className="font-semibold mb-4 text-lg">لیست پرمیشن‌ها</h2>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-3 text-right">نام پرمیشن</th>
                  <th className="border border-gray-300 p-3 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {currentPermissions.map((perm) => (
                  <tr key={perm.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-3">{perm.name}</td>
                    <td className="border border-gray-300 p-3 text-center">
                      <button
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
                        onClick={() => handleDeletePermission(perm.id)}
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Permissions Pagination */}
            {permTotalPages > 1 && (
              <div className="mt-4 flex justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded ${
                    currentPage === 1 
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  قبلی
                </button>
                {Array.from({ length: permTotalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    className={`px-3 py-1 rounded ${
                      currentPage === i + 1 
                        ? "bg-blue-600 text-white" 
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, permTotalPages))}
                  disabled={currentPage === permTotalPages}
                  className={`px-3 py-1 rounded ${
                    currentPage === permTotalPages 
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  بعدی
                </button>
              </div>
            )}
          </div>

          {/* فقط یک ToastContainer در کل برنامه */}
          <ToastContainer 
            position="top-center"
            rtl={true}
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={true}
            closeOnClick
            pauseOnHover
            draggable
            pauseOnFocusLoss
            limit={3} // محدود کردن تعداد Toast همزمان
            style={{ 
              zIndex: 9999,
              marginTop: '60px'
            }}
            toastStyle={{
              backgroundColor: '#fff',
              color: '#333',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              fontFamily: 'inherit'
            }}
          />
        </div>
      </MainLayoutjur>
    </AdminRoute>
  );
}