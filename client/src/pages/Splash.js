import React from "react";

const Splash = () => (
  <div style={{
    height:"100vh", display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", background:"#0a0a2a", color:"#00f7ff"
  }}>
    <div style={{
      width:50, height:50, border:"5px solid #00f7ff", borderTop:"5px solid transparent", borderRadius:"50%",
      animation:"spin 1s linear infinite"
    }}></div>
    <h2 style={{marginTop:20}}>Loading TapTap Chat...</h2>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

export default Splash;
