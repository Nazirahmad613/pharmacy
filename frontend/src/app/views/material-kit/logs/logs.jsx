import { useEffect, useState } from "react";
import MainLayoutjur from "../../../../components/MainLayoutjur";
import { useAuth } from "app/contexts/AuthContext";

export default function LogsPage() {
  const { api } = useAuth();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [filters, setFilters] = useState({
    action: "",
    user_id: "",
  });

  // نگاشت user_id => name
  const [usersMap, setUsersMap] = useState({});

  // دریافت لیست کاربران برای نمایش نام
  const fetchUsers = async () => {
    try {
      // فرض بر این است که endpoint /users لیست کاربران را برمی‌گرداند
      const res = await api.get("/users");
      // ساختار پاسخ ممکن است در پروژه شما متفاوت باشد
      const usersArray = res.data.data || res.data;
      const map = {};
      usersArray.forEach((user) => {
        map[user.id] = user.name;
      });
      setUsersMap(map);
    } catch (error) {
      console.error("خطا در دریافت کاربران", error);
    }
  };

  // دریافت لاگ‌ها
  const fetchLogs = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", pageNumber);

      if (filters.action) params.append("action", filters.action);
      if (filters.user_id) params.append("user_id", filters.user_id);

      const res = await api.get(`/logs?${params.toString()}`);

      setLogs(res.data.data);
      setPage(res.data.current_page);
      setLastPage(res.data.last_page);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
    fetchUsers(); // دریافت یکباره کاربران
  }, []);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const applyFilters = () => {
    fetchLogs(1);
  };

  return (
    <MainLayoutjur>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">📜 لاگ‌ها</h2>

        {/* فیلترها */}
        <div className="flex gap-4 mb-4">
          <select
            name="action"
            value={filters.action}
            onChange={handleFilterChange}
            className="border p-2 rounded"
          >
            <option value="">همه عملیات</option>
            <option value="create">ایجاد</option>
            <option value="update">ویرایش</option>
            <option value="delete">حذف</option>
          </select>

          <input
            type="text"
            name="user_id"
            placeholder="شناسه کاربر"
            value={filters.user_id}
            onChange={handleFilterChange}
            className="border p-2 rounded"
          />

          <button
            onClick={applyFilters}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            فیلتر
          </button>
        </div>

        {/* جدول */}
        <div className="overflow-x-auto bg-white shadow rounded">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 border">شناسه</th>
                <th className="p-3 border">کاربر</th>
                <th className="p-3 border">عملیات</th>
                <th className="p-3 border">مدل</th>
                <th className="p-3 border">توضیحات</th>
                <th className="p-3 border">آی پی</th>
                <th className="p-3 border">تاریخ</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center p-4">
                    در حال بارگذاری...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center p-4">
                    لاگی یافت نشد
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="text-center border-t">
                    <td className="p-2 border">{log.id}</td>
                    <td className="p-2 border">
                      {/* نمایش نام کاربر به جای شناسه */}
                      {usersMap[log.user_id] || log.user_id}
                    </td>
                    <td className="p-2 border">{log.action}</td>
                    <td className="p-2 border">{log.model}</td>
                    <td className="p-2 border">{log.description}</td>
                    <td className="p-2 border">{log.ip}</td>
                    <td className="p-2 border">
                      {new Date(log.created_at).toLocaleString("fa-IR")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* صفحه‌بندی */}
        <div className="flex justify-center mt-4 gap-2">
          <button
            disabled={page === 1}
            onClick={() => fetchLogs(page - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            قبلی
          </button>

          <span className="px-3 py-1">
            صفحه {page} از {lastPage}
          </span>

          <button
            disabled={page === lastPage}
            onClick={() => fetchLogs(page + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            بعدی
          </button>
        </div>
      </div>
    </MainLayoutjur>
  );
}