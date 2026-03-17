import { useState, useEffect, useCallback } from "react";
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
  
  // Loading states
  const [loading, setLoading] = useState({
    roles: false,
    permissions: false,
    addRole: false,
    addPermission: false,
    deleteRole: null,
    deletePermission: null,
    assignPermissions: null,
    removePermission: null
  });

  const fetchRoles = useCallback(async () => {
    setLoading(prev => ({ ...prev, roles: true }));
    try {
      const res = await api.get("/roles");
      setRoles(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching roles:", err);
      toast.error("خطا در بارگذاری رول‌ها");
    } finally {
      setLoading(prev => ({ ...prev, roles: false }));
    }
  }, [api]);

  const fetchPermissions = useCallback(async () => {
    setLoading(prev => ({ ...prev, permissions: true }));
    try {
      const res = await api.get("/permissions");
      setPermissions(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching permissions:", err);
      toast.error("خطا در بارگذاری پرمیشن‌ها");
    } finally {
      setLoading(prev => ({ ...prev, permissions: false }));
    }
  }, [api]);

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, [fetchRoles, fetchPermissions]);

  const handleAddRole = async () => {
    if (!newRole.trim()) {
      toast.warning("نام رول را وارد کنید");
      return;
    }
    
    setLoading(prev => ({ ...prev, addRole: true }));
    try {
      const response = await api.post("/roles", { name: newRole.trim() });
      toast.success(response.data.message || "رول با موفقیت اضافه شد");
      setNewRole("");
      await fetchRoles();
    } catch (err) {
      console.error("Error adding role:", err);
      const errorMessage = err.response?.data?.error || "خطا در ایجاد رول جدید";
      toast.error(errorMessage);
    } finally {
      setLoading(prev => ({ ...prev, addRole: false }));
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (!window.confirm("آیا از حذف این رول اطمینان دارید؟")) {
      return;
    }
    
    setLoading(prev => ({ ...prev, deleteRole: roleId }));
    try {
      const response = await api.delete(`/roles/${roleId}`);
      toast.success(response.data.message || "رول با موفقیت حذف شد");
      await fetchRoles();
    } catch (err) {
      console.error("Error deleting role:", err);
      const errorMessage = err.response?.data?.error || "خطا در حذف رول";
      toast.error(errorMessage);
    } finally {
      setLoading(prev => ({ ...prev, deleteRole: null }));
    }
  };

  const handleAddPermission = async () => {
    if (!newPermission.trim()) {
      toast.warning("نام پرمیشن را وارد کنید");
      return;
    }
    
    setLoading(prev => ({ ...prev, addPermission: true }));
    try {
      const response = await api.post("/permissions", { name: newPermission.trim() });
      toast.success(response.data.message || "پرمیشن با موفقیت اضافه شد");
      setNewPermission("");
      await fetchPermissions();
    } catch (err) {
      console.error("Error adding permission:", err);
      const errorMessage = err.response?.data?.error || "خطا در ایجاد پرمیشن جدید";
      toast.error(errorMessage);
    } finally {
      setLoading(prev => ({ ...prev, addPermission: false }));
    }
  };

  const handleDeletePermission = async (permId) => {
    if (!window.confirm("آیا از حذف این پرمیشن اطمینان دارید؟")) {
      return;
    }
    
    setLoading(prev => ({ ...prev, deletePermission: permId }));
    try {
      const response = await api.delete(`/permissions/${permId}`);
      toast.success(response.data.message || "پرمیشن با موفقیت حذف شد");
      
      // Update selectedPermissions state
      setSelectedPermissions((prev) => {
        const newState = { ...prev };
        Object.keys(newState).forEach(roleId => {
          newState[roleId] = newState[roleId].filter(id => id !== permId);
        });
        return newState;
      });
      
      await fetchPermissions();
      await fetchRoles(); // Refresh roles to update permission lists
    } catch (err) {
      console.error("Error deleting permission:", err);
      const errorMessage = err.response?.data?.error || "خطا در حذف پرمیشن";
      toast.error(errorMessage);
    } finally {
      setLoading(prev => ({ ...prev, deletePermission: null }));
    }
  };

  const handleAssignPermissions = async (roleId) => {
    const selectedPerms = selectedPermissions[roleId] || [];
    if (selectedPerms.length === 0) {
      toast.warning("حداقل یک پرمیشن انتخاب کنید");
      return;
    }
    
    setLoading(prev => ({ ...prev, assignPermissions: roleId }));
    try {
      const response = await api.post(`/roles/${roleId}/permissions`, { 
        permissions: selectedPerms
      });
      
      toast.success(response.data.message || "پرمیشن‌ها با موفقیت اختصاص داده شدند");
      
      // Clear selected permissions for this role after successful assignment
      setSelectedPermissions((prev) => ({
        ...prev,
        [roleId]: []
      }));
      
      await fetchRoles(); // Refresh roles to show updated permissions
    } catch (err) {
      console.error("Error assigning permissions:", err);
      const errorMessage = err.response?.data?.error || "خطا در اختصاص پرمیشن‌ها";
      toast.error(errorMessage);
    } finally {
      setLoading(prev => ({ ...prev, assignPermissions: null }));
    }
  };

  const handleRemovePermissionFromRole = async (roleId, permissionId, permissionName) => {
    if (!window.confirm(`آیا از حذف پرمیشن "${permissionName}" از این رول اطمینان دارید؟`)) {
      return;
    }
    
    setLoading(prev => ({ ...prev, removePermission: `${roleId}-${permissionId}` }));
    try {
      const response = await api.delete(`/roles/${roleId}/permissions/${permissionId}`);
      toast.success(response.data.message || "پرمیشن با موفقیت از رول حذف شد");
      await fetchRoles();
    } catch (err) {
      console.error("Error removing permission from role:", err);
      const errorMessage = err.response?.data?.error || "خطا در حذف پرمیشن از رول";
      toast.error(errorMessage);
    } finally {
      setLoading(prev => ({ ...prev, removePermission: null }));
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

          {/* Loading Overlay */}
          {(loading.roles || loading.permissions) && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <p className="text-lg">در حال بارگذاری...</p>
              </div>
            </div>
          )}

          <div className="mb-6 flex gap-4 flex-wrap">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="نام رول جدید"
                className="border p-2 rounded"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                disabled={loading.addRole}
              />
              <button 
                className={`bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors ${loading.addRole ? 'opacity-50 cursor-not-allowed' : ''}`} 
                onClick={handleAddRole}
                disabled={loading.addRole}
              >
                {loading.addRole ? 'در حال اضافه کردن...' : 'اضافه کردن رول'}
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="نام پرمیشن جدید"
                className="border p-2 rounded"
                value={newPermission}
                onChange={(e) => setNewPermission(e.target.value)}
                disabled={loading.addPermission}
              />
              <button 
                className={`bg-purple-600 text-white p-2 rounded hover:bg-purple-700 transition-colors ${loading.addPermission ? 'opacity-50 cursor-not-allowed' : ''}`} 
                onClick={handleAddPermission}
                disabled={loading.addPermission}
              >
                {loading.addPermission ? 'در حال اضافه کردن...' : 'اضافه کردن پرمیشن'}
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
            {loading.roles ? (
              <div className="text-center py-8">در حال بارگذاری رول‌ها...</div>
            ) : (
              <>
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
                    {currentRoles.length > 0 ? (
                      currentRoles.map((role) => (
                        <tr key={role.id} className="hover:bg-gray-50">
                          <td className="border border-gray-300 p-3 font-medium">{role.name}</td>
                          <td className="border border-gray-300 p-3">
                            <div className="flex flex-wrap gap-1">
                              {role.permissions && role.permissions.length > 0 ? (
                                role.permissions.map((perm) => (
                                  <span key={perm.id} className="inline-flex items-center bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded ml-1 mb-1">
                                    {perm.name}
                                    <button
                                      onClick={() => handleRemovePermissionFromRole(role.id, perm.id, perm.name)}
                                      className="mr-1 text-red-600 hover:text-red-800 font-bold text-lg"
                                      title="حذف پرمیشن"
                                      disabled={loading.removePermission === `${role.id}-${perm.id}`}
                                    >
                                      {loading.removePermission === `${role.id}-${perm.id}` ? '...' : '×'}
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
                                  const isAlreadyAssigned = role.permissions?.some(p => p.id === perm.id);
                                  
                                  return (
                                    <button
                                      key={perm.id}
                                      onClick={() => handleSelectPermission(role.id, perm.id)}
                                      className={`px-2 py-1 text-sm rounded transition-colors ${
                                        isSelected 
                                          ? 'bg-green-600 text-white' 
                                          : isAlreadyAssigned
                                            ? 'bg-gray-400 text-white cursor-not-allowed'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                      }`}
                                      disabled={isAlreadyAssigned || loading.assignPermissions === role.id}
                                      title={isAlreadyAssigned ? 'این پرمیشن قبلاً به این رول اختصاص داده شده است' : ''}
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
                                className={`bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors ${
                                  loading.assignPermissions === role.id ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                onClick={() => handleAssignPermissions(role.id)}
                                disabled={loading.assignPermissions === role.id || !selectedPermissions[role.id]?.length}
                              >
                                {loading.assignPermissions === role.id ? 'در حال اختصاص...' : 'اختصاص'}
                              </button>
                              <button
                                className={`bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors ${
                                  loading.deleteRole === role.id ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                onClick={() => handleDeleteRole(role.id)}
                                disabled={loading.deleteRole === role.id}
                              >
                                {loading.deleteRole === role.id ? 'در حال حذف...' : 'حذف رول'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center py-4 text-gray-500">
                          هیچ رولی یافت نشد
                        </td>
                      </tr>
                    )}
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
              </>
            )}
          </div>

          {/* Permissions Table */}
          <div>
            <h2 className="font-semibold mb-4 text-lg">لیست پرمیشن‌ها</h2>
            {loading.permissions ? (
              <div className="text-center py-8">در حال بارگذاری پرمیشن‌ها...</div>
            ) : (
              <>
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-3 text-right">نام پرمیشن</th>
                      <th className="border border-gray-300 p-3 text-center">عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPermissions.length > 0 ? (
                      currentPermissions.map((perm) => (
                        <tr key={perm.id} className="hover:bg-gray-50">
                          <td className="border border-gray-300 p-3">{perm.name}</td>
                          <td className="border border-gray-300 p-3 text-center">
                            <button
                              className={`bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors ${
                                loading.deletePermission === perm.id ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                              onClick={() => handleDeletePermission(perm.id)}
                              disabled={loading.deletePermission === perm.id}
                            >
                              {loading.deletePermission === perm.id ? 'در حال حذف...' : 'حذف'}
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="2" className="text-center py-4 text-gray-500">
                          هیچ پرمیشنی یافت نشد
                        </td>
                      </tr>
                    )}
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
              </>
            )}
          </div>

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
            limit={3}
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