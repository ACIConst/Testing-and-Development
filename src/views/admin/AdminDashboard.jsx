import { useState } from "react";
import { useAdminTheme } from "../../context/AdminThemeContext";
import { normalizeStatus } from "../../styles/tokens";
import { Btn } from "../../components/ui";
import { Img } from "../../components/Img";
import { ReceiptModal } from "./ReceiptModal";

export function AdminDashboard({ menu, users, orders, dbOps, isMobile, isTablet }) {const{T:C,TF:F}=useAdminTheme();
  const validOrders=orders.filter(o=>normalizeStatus(o.status)!=="cancelled");
  const totalRev=validOrders.reduce((s,o)=>s+(o.total||0),0);
  const onMenu=menu.filter(i=>i.showOnKiosk!==false).length;
  const itemCounts={};validOrders.forEach(o=>o.items?.forEach(i=>{itemCounts[i.name]=(itemCounts[i.name]||0)+(i.quantity||0);}));
  const topItems=Object.entries(itemCounts).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const todayStr=new Date().toDateString();
  const todayOrders=validOrders.filter(o=>o.ts&&new Date(o.ts).toDateString()===todayStr);
  const todayRev=todayOrders.reduce((s,o)=>s+(o.total||0),0);
  const [hoveredStat,setHoveredStat]=useState(null);const [deletingId,setDeletingId]=useState(null);const [receiptOrder,setReceiptOrder]=useState(null);const [orderTimeFilter,setOrderTimeFilter]=useState("all");const [orderPage,setOrderPage]=useState(0);
  const [ordersOpen,setOrdersOpen]=useState(!isMobile);const [topItemsOpen,setTopItemsOpen]=useState(!isMobile);
  const ORDER_PAGE_SIZE=10;
  async function deleteOrder(id){setDeletingId(id);try{await dbOps.deleteOrder(id);}catch(e){console.error(e);}finally{setDeletingId(null);}}

  const stats=[
    {label:"Total Orders",  value:validOrders.length,        accent:C.red},
    {label:"Revenue",       value:"$"+totalRev.toFixed(2),  accent:"#b45309"},
    {label:"Menu Items",    value:menu.length,              accent:"#1d4ed8"},
    {label:"On Kiosk",      value:onMenu,                   accent:"#16a34a"},
  ];
  return (
    <div style={{animation:"fadeUp .3s ease"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:isMobile?10:14,marginBottom:22}}>
        {stats.map(s=>(
          <div key={s.label} onMouseEnter={()=>setHoveredStat(s.label)} onMouseLeave={()=>setHoveredStat(null)} style={{background:C.card,border:"1px solid "+(hoveredStat===s.label?s.accent:C.border),borderRadius:14,padding:isMobile?"12px 14px":"16px 18px",position:"relative",cursor:"default",transition:"border .2s"}}>
            <div style={{fontSize:isMobile?10:11,letterSpacing:2,textTransform:"uppercase",color:C.muted,marginBottom:isMobile?6:10}}>{s.label}</div>
            <div style={{fontFamily:F.display,fontSize:isMobile?22:28,fontWeight:900,color:s.accent}}>{s.value}</div>
            {!isMobile&&hoveredStat==="Revenue"&&s.label==="Revenue"&&(
              <div style={{position:"absolute",top:"100%",left:0,zIndex:100,marginTop:6,background:C.surface,border:"1px solid "+C.borderMid,borderRadius:12,padding:"14px 16px",minWidth:320,boxShadow:"0 12px 40px rgba(0,0,0,.7)",animation:"fadeUp .15s ease"}}>
                <div style={{fontSize:11,letterSpacing:2,textTransform:"uppercase",color:C.muted,marginBottom:10}}>Today's Revenue {"\u2014"} {todayOrders.length} order{todayOrders.length!==1?"s":""}</div>
                <div style={{fontFamily:F.display,fontSize:22,fontWeight:900,color:"#b45309",marginBottom:12}}>${todayRev.toFixed(2)}</div>
                {todayOrders.length===0?<div style={{fontSize:13,color:C.muted}}>No orders today yet</div>:(
                  <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:240,overflowY:"auto"}}>
                    {todayOrders.map(o=><div key={o.id} style={{display:"flex",alignItems:"flex-start",gap:8,padding:"8px 10px",background:C.card,borderRadius:8,border:"1px solid "+C.border}}><div style={{flex:1,minWidth:0}}><div style={{fontSize:13,color:C.cream,fontWeight:600}}>#{o.orderNumber||"\u2014"} {"\u2014"} {o.user}</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>{o.items?.map(i=>i.name+" \u00D7"+i.quantity).join(", ")}</div></div><div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}><div style={{fontFamily:F.display,fontSize:14,color:"#b45309",fontWeight:700}}>${(o.total||0).toFixed(2)}</div><button onClick={e=>{e.stopPropagation();deleteOrder(o.id);}} disabled={deletingId===o.id} style={{background:C.errorBg,border:"none",color:C.errorText,borderRadius:6,width:24,height:24,cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",opacity:deletingId===o.id?.5:1}}>{"\u2715"}</button></div></div>)}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:isMobile?12:18,marginBottom:18}}>
        <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:14,padding:isMobile?"14px 16px":"18px 20px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:ordersOpen?14:0,cursor:isMobile?"pointer":"default"}} onClick={()=>isMobile&&setOrdersOpen(p=>!p)}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              {isMobile&&<span style={{color:C.muted,fontSize:14,display:"inline-block",transform:ordersOpen?"rotate(90deg)":"none",transition:"transform .2s"}}>{"\u203A"}</span>}
              <div style={{fontFamily:F.display,fontSize:isMobile?15:17,fontWeight:700,letterSpacing:1}}>Orders</div>
            </div>
            {ordersOpen&&<select value={orderTimeFilter} onClick={e=>e.stopPropagation()} onChange={e=>{setOrderTimeFilter(e.target.value);setOrderPage(0);}} style={{background:C.surface,border:"1px solid "+C.borderMid,borderRadius:8,padding:"5px 10px",color:C.cream,fontFamily:F.body,fontSize:12,cursor:"pointer"}}><option value="all">All Time</option><option value="today">Today</option><option value="week">This Week</option><option value="month">This Month</option></select>}
          </div>
          {ordersOpen&&(()=>{const now=new Date();const filtered=validOrders.filter(o=>{if(orderTimeFilter==="all")return true;if(!o.ts)return false;const d=new Date(o.ts);if(orderTimeFilter==="today")return d.toDateString()===now.toDateString();if(orderTimeFilter==="week"){const wa=new Date(now);wa.setDate(wa.getDate()-7);return d>=wa;}if(orderTimeFilter==="month")return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear();return true;});const filteredRev=filtered.reduce((s,o)=>s+(o.total||0),0);
            return <><div style={{fontSize:12,color:C.muted,marginBottom:10}}>{filtered.length} order{filtered.length!==1?"s":""} — <span style={{color:C.red,fontFamily:F.display,fontWeight:700}}>${filteredRev.toFixed(2)}</span></div>
              {filtered.length===0?<div style={{color:C.muted,fontSize:14,textAlign:"center",padding:"20px 0"}}>No orders for this period</div>:(
                <div style={{display:"flex",flexDirection:"column",gap:6}}>{filtered.slice(orderPage*ORDER_PAGE_SIZE,(orderPage+1)*ORDER_PAGE_SIZE).map(o=><div key={o.id} className="row-hover" onClick={()=>setReceiptOrder(o)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 9px",borderRadius:8,transition:"background .15s",cursor:"pointer"}}><div><div style={{fontSize:14,color:C.cream,fontWeight:600}}>#{o.orderNumber||"\u2014"} — {o.user}</div><div style={{fontSize:12,color:C.muted}}>{o.ts?new Date(o.ts).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"numeric",minute:"2-digit"}):""}</div></div><div style={{fontFamily:F.display,fontSize:15,color:C.red,fontWeight:700}}>${(o.total||0).toFixed(2)}</div></div>)}</div>
              )}</>;
          })()}
        </div>
        {receiptOrder&&<ReceiptModal order={receiptOrder} onClose={()=>setReceiptOrder(null)}/>}
        <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:14,padding:isMobile?"14px 16px":"18px 20px"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:topItemsOpen?14:0,cursor:isMobile?"pointer":"default"}} onClick={()=>isMobile&&setTopItemsOpen(p=>!p)}>
            {isMobile&&<span style={{color:C.muted,fontSize:14,display:"inline-block",transform:topItemsOpen?"rotate(90deg)":"none",transition:"transform .2s"}}>{"\u203A"}</span>}
            <div style={{fontFamily:F.display,fontSize:isMobile?15:17,fontWeight:700,letterSpacing:1}}>Top Ordered Items</div>
          </div>
          {topItemsOpen&&(topItems.length===0?<div style={{color:C.muted,fontSize:14,textAlign:"center",padding:"20px 0"}}>No data yet</div>:(
            <div style={{display:"flex",flexDirection:"column",gap:10}}>{topItems.map(([name,qty],i)=><div key={name} style={{display:"flex",alignItems:"center",gap:10}}><div style={{fontFamily:F.display,fontSize:16,color:C.borderMid,fontWeight:900,minWidth:22}}>{i+1}</div><div style={{flex:1}}><div style={{fontSize:14,color:C.cream,marginBottom:3}}>{name}</div><div style={{height:4,background:C.border,borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",background:C.red,width:Math.min(100,(qty/topItems[0][1])*100)+"%",borderRadius:2}}/></div></div><div style={{fontSize:12,color:C.muted,minWidth:38,textAlign:"right"}}>{qty} sold</div></div>)}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
