 import { useState, useEffect } from "react";

const images = [
  "/backgrounds/bg1.jpg",
  "/backgrounds/bg2.jpg",
  "/backgrounds/bg3.jpg",
];

export default function AnimatedBackground({ children }) {
  const [current, setCurrent] = useState(0); // تصویر فعلی
  const [next, setNext] = useState(1);       // تصویر بعدی
  const [fade, setFade] = useState(true);    // کنترل fade

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false); // fade out current

      setTimeout(() => {
        setCurrent(next);
        setNext((next + 1) % images.length);
        setFade(true); // fade in next
      }, 2000); // مدت fade 2 ثانیه
    }, 7000); // فاصله بین تغییر تصاویر

    return () => clearInterval(interval);
  }, [next]);

  return (
    <div style={{ position: "relative", width: "100%", minHeight: "100vh", overflow: "hidden" }}>
      {/* تصویر فعلی */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: `url(${images[current]})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          transition: "opacity 2s ease-in-out",
          opacity: fade ? 1 : 0,
          zIndex: 0,
        }}
      />

      {/* تصویر بعدی */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: `url(${images[next]})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          transition: "opacity 2s ease-in-out",
          opacity: fade ? 0 : 1,
          zIndex: 0,
        }}
      />

      {/* محتوای اصلی */}
      <div style={{ position: "relative", zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}
