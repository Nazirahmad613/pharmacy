import { useEffect, useState } from "react";
import axios from "axios";

export default function SalesTable() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8000/api/sales")
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2>Sales Report</h2>

      <table border="1" width="100%">
        <thead>
          <tr>
            <th>Date</th>
            <th>Customer</th>
            <th>Doctor</th>
            <th>Medicine</th>
            <th>Amount</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              <td>{item.journal_date}</td>
              <td>{item.customer_name}</td>
              <td>{item.doctor_name}</td>
              <td>{item.med_name}</td>
              <td>{item.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}