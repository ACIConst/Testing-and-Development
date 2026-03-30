import { useEffect } from "react";
import { C, F } from "../styles/tokens";

export function useGlobalStyles() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=JetBrains+Mono:wght@400;600&display=swap";
    document.head.appendChild(link);
    const s = document.createElement("style");
    s.textContent = `
      *{box-sizing:border-box;}
      body{margin:0;background:${C.bg};-webkit-tap-highlight-color:transparent;}
      @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
      @keyframes fadeIn{from{opacity:0}to{opacity:1}}
      @keyframes scaleIn{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}
      @keyframes shake{0%,100%{transform:translateX(0)}15%{transform:translateX(-10px)}30%{transform:translateX(10px)}45%{transform:translateX(-10px)}60%{transform:translateX(10px)}75%{transform:translateX(-5px)}90%{transform:translateX(5px)}}
      @keyframes successPop{0%{transform:scale(0);opacity:0}60%{transform:scale(1.2)}100%{transform:scale(1);opacity:1}}
      @keyframes spin{to{transform:rotate(360deg)}}
      @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
      @keyframes idlePulse{0%,100%{transform:scale(1);opacity:.8}50%{transform:scale(1.03);opacity:1}}
      input,textarea,select{outline:none;font-family:${F.body};}
      input::placeholder,textarea::placeholder{color:${C.muted};}
      button:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible{outline:2px solid ${C.focus};outline-offset:2px;}
      input:focus,select:focus,textarea:focus{border-color:${C.focus}!important;}
      ::-webkit-scrollbar{width:5px;height:5px;}
      ::-webkit-scrollbar-track{background:${C.bg};}
      ::-webkit-scrollbar-thumb{background:${C.borderMid};border-radius:3px;}
      .row-hover:hover{background:rgba(255,255,255,.03)!important;}
      .nav-btn:hover{background:${C.sidebarActive}!important;color:${C.cream}!important;}
      .touch-active:active{opacity:.75;transform:scale(.97);}
      .numpad-btn:active{background:#2a1a0a!important;}
      .kiosk-root{user-select:none;-webkit-user-select:none;}
    `;
    document.head.appendChild(s);
  }, []);
}
