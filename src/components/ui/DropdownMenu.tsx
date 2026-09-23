import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
export interface DropdownMenuItem { id:string; label:string; icon?:React.ReactNode; onClick:()=>void; variant?:'default'|'danger'|'warning'; badge?:string; divider?:boolean; }
interface DropdownMenuProps { trigger:React.ReactNode; items:DropdownMenuItem[]; align?:'left'|'right'; className?:string; menuClassName?:string; }
export const DropdownMenu:React.FC<DropdownMenuProps>=({trigger,items,align='right',className='',menuClassName=''})=>{
 const [isOpen,setIsOpen]=useState(false); const containerRef=useRef<HTMLDivElement>(null);
 useEffect(()=>{const outside=(e:MouseEvent)=>{if(containerRef.current&&!containerRef.current.contains(e.target as Node))setIsOpen(false)};const key=(e:KeyboardEvent)=>{if(e.key==='Escape')setIsOpen(false)};
  if(isOpen){document.addEventListener('mousedown',outside);document.addEventListener('keydown',key)}return()=>{document.removeEventListener('mousedown',outside);document.removeEventListener('keydown',key)}},[isOpen]);
 return <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
  <button type="button" aria-expanded={isOpen} onClick={()=>setIsOpen(v=>!v)} className="appearance-none border-0 bg-transparent p-0">{trigger}</button>
  <AnimatePresence>{isOpen&&<motion.div initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} exit={{opacity:0,y:2}} transition={{duration:.12}}
   className={`ams-dropdown-surface absolute z-50 mt-1.5 min-w-[190px] rounded-[14px] border border-white/[.10] bg-[#1C1C1F]/95 p-1 shadow-[0_18px_50px_rgba(0,0,0,.34)] backdrop-blur-xl ${align==='right'?'right-0':'left-0'} ${menuClassName}`}>
   {items.map(item=><React.Fragment key={item.id}>{item.divider&&<div className="my-1 h-px bg-white/[.07]"/>}
    <button type="button" onClick={()=>{item.onClick();setIsOpen(false)}} className={`ams-dropdown-item flex min-h-9 w-full items-center justify-between gap-3 rounded-[10px] px-2.5 py-2 text-left text-xs transition-colors ${item.variant==='danger'?'text-red-400 hover:bg-red-500/10':item.variant==='warning'?'text-amber-400 hover:bg-amber-500/10':'text-[#A1A1AA] hover:bg-white/[.055] hover:text-white'}`}>
     <span className="flex min-w-0 items-center gap-2.5"><span className="shrink-0 [&>svg]:h-4 [&>svg]:w-4">{item.icon}</span><span className="truncate font-medium">{item.label}</span></span>
     {item.badge&&<span className="shrink-0 rounded-md bg-white/[.06] px-1.5 py-0.5 text-[9px] font-semibold text-[#A1A1AA]">{item.badge}</span>}
    </button>
   </React.Fragment>)}
  </motion.div>}</AnimatePresence>
 </div>
};
export default DropdownMenu;
