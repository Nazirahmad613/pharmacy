import { useEffect, useState } from "react";
import "./MainLayoutjur.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const backgrounds = [
  "/backgrounds/bg1.jpg",
  "/backgrounds/bg2.jpg",
  "/backgrounds/bg3.jpg",
];

export default function MainLayoutjur({ children, title }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((p) => (p + 1) % backgrounds.length);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        rtl={true}
        theme="colored"
        limit={5}
        style={{ 
          zIndex: 9999999,
          position: 'fixed',
          top: '20px',
          right: '20px'
        }}
      />

      <div
        className="main-layout"
        style={{ 
          backgroundImage: `url(${backgrounds[index]})`,
          minHeight: "100vh",
          overflowY: "auto"   // ✅ مهم (فعال کردن اسکرول)
        }}
      >
        <div 
          className="background-overlay"
          style={{
            minHeight: "100vh",
            overflowY: "auto"   // ✅ مهم
          }}
        >
          {title && <h1 className="layout-title">{title}</h1>}

          <div 
            className="layout-content"
            style={{
              paddingBottom: "50px"  // ✅ جلوگیری از چسبیدن آخر صفحه
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </>
  );
}