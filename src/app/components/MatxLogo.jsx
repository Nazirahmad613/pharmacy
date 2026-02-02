import useSettings from "app/hooks/useSettings";
export default function MatxLogo({ className }) {
  const { settings } = useSettings();

  return (
    <div className={className}>
    
      <h2 style={{ textAlign: "center", marginBottom: "10px" }}>   دواخانه الفلاح  </h2>
 
      <img 
  src="/images/Logo.png"  
  alt="New Logo"  
  width="60"  
  height="auto"
  style={{ display: "block", margin: "0 auto" }}  
/>

    </div>
  );
}
