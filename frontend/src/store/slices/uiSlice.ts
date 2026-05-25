import { createSlice, PayloadAction } from '@reduxjs/toolkit';
interface Toast { id:string; title?:string; description?:string; variant?:string; }
interface UIState { sidebarCollapsed:boolean; toasts:Toast[]; activeVisitors:number; }
const uiSlice = createSlice({ name:'ui', initialState:{sidebarCollapsed:false,toasts:[],activeVisitors:0} as UIState, reducers:{
  toggleSidebar(state){state.sidebarCollapsed=!state.sidebarCollapsed;},
  addToast(state,a:PayloadAction<Toast>){state.toasts.push(a.payload);if(state.toasts.length>5)state.toasts.shift();},
  removeToast(state,a:PayloadAction<string>){state.toasts=state.toasts.filter(t=>t.id!==a.payload);},
  setActiveVisitors(state,a:PayloadAction<number>){state.activeVisitors=a.payload;},
}});
export const {toggleSidebar,addToast,removeToast,setActiveVisitors}=uiSlice.actions;
export const selectSidebarCollapsed=(s:any)=>s.ui.sidebarCollapsed;
export const selectToasts=(s:any)=>s.ui.toasts;
export const selectActiveVisitors=(s:any)=>s.ui.activeVisitors;
export default uiSlice.reducer;
