import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
  const isRTL = document.dir === "rtl";

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((p) => (p + 1) % backgrounds.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* ✅ کل ساختار صفحه (بدون تغییر) */}
      <div
        className="main-layout"
        style={{
          backgroundImage: `url(${backgrounds[index]})`,
          minHeight: "100vh",
          overflowY: "auto",
        }}
      >
        <div
          className="background-overlay"
          style={{
            minHeight: "100vh",
            overflowY: "auto",
          }}
        >
          {title && <h1 className="layout-title">{title}</h1>}
          <div
            className="layout-content"
            style={{ paddingBottom: "50px" }}
          >
            {children}
          </div>
        </div>
      </div>

      {/* ✅ ToastContainer با Portal به انتهای body می‌رود */}
      {typeof document !== "undefined" &&
        createPortal(
          <ToastContainer
            position={isRTL ? "top-left" : "top-right"}
            autoClose={3000}
            rtl={true}
            theme="colored"
            limit={5}
            style={{
              zIndex: 9999999999,
              position: "fixed",
              top: "20px",
              right: isRTL ? "auto" : "20px",
              left: isRTL ? "20px" : "auto",
            }}
          />,
          document.body
        )}
    </>
  );
}