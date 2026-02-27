import { useState, useEffect } from "react";
import DoughnutChart from "./shared/Doughnut";
import { useAuth } from "app/contexts/AuthContext";

export default function MyDoughnutChart() {
  const { api } = useAuth();
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/account-summary");
        // ساخت داده برای DoughnutChart
        const chartData = [
          { name: "داکتر", value: res.data.filter(x => x.account_type === "doctor").length },
          { name: "مریض", value: res.data.filter(x => x.account_type === "patient").length },
          { name: "مشتری", value: res.data.filter(x => x.account_type === "customer").length },
          { name: "حمایت‌کننده", value: res.data.filter(x => x.account_type === "supplier").length },
        ];
        setData(chartData);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [api]);

  return (
    <DoughnutChart
      height="300px"
      data={data}   // ✅ داده واقعی
      color={["#3f51b5", "#2196f3", "#00bcd4", "#009688"]}
    />
  );
}