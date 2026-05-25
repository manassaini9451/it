import { createSlice, PayloadAction } from '@reduxjs/toolkit';
interface User { _id:string; firstName:string; lastName:string; email:string; avatar?:string; role:any; status:string; }
interface AuthState { user:User|null; accessToken:string|null; isAuthenticated:boolean; isLoading:boolean; }
const initialState: AuthState = { user:null, accessToken:typeof window!=='undefined'?localStorage.getItem('access_token'):null, isAuthenticated:false, isLoading:true };
const authSlice = createSlice({ name:'auth', initialState, reducers: {
  setCredentials(state, a: PayloadAction<{user:User;accessToken:string}>) { state.user=a.payload.user; state.accessToken=a.payload.accessToken; state.isAuthenticated=true; state.isLoading=false; if(typeof window!=='undefined') localStorage.setItem('access_token',a.payload.accessToken); },
  logout(state) { state.user=null; state.accessToken=null; state.isAuthenticated=false; state.isLoading=false; if(typeof window!=='undefined') localStorage.removeItem('access_token'); },
  setLoading(state, a: PayloadAction<boolean>) { state.isLoading=a.payload; },
  setAuthenticated(state, a: PayloadAction<boolean>) { state.isAuthenticated=a.payload; state.isLoading=false; },
}});
export const { setCredentials, logout, setLoading, setAuthenticated } = authSlice.actions;
export const selectUser = (s:any) => s.auth.user;
export const selectIsAuth = (s:any) => s.auth.isAuthenticated;
export const selectIsLoading = (s:any) => s.auth.isLoading;
export const selectRole = (s:any) => { const r=s.auth.user?.role; return typeof r==='string'?r:r?.name; };
export default authSlice.reducer;
