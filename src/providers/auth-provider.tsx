"use client";
import {createContext,useContext,useEffect,useState,useCallback,useRef} from "react";
import {useQueryClient} from "@tanstack/react-query";
import {api,request,refresh,setAccessToken,ApiError} from "@/services/api";
import type {User} from "@/types/accounts";
type Auth={user:User|null;loading:boolean;error:string|null;login:(username:string,password:string)=>Promise<User>;exchange:(code:string)=>Promise<User>;logout:(all?:boolean)=>Promise<void>;reload:()=>Promise<void>;clear:()=>void;has:(permission:string)=>boolean};
const Context=createContext<Auth|null>(null);
export function AuthProvider({children}:{children:React.ReactNode}){
 const [user,setUser]=useState<User|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState<string|null>(null);
 const query=useQueryClient();const initialized=useRef(false);
 const clear=useCallback(()=>{setAccessToken(null);setUser(null);setError(null);query.clear();},[query]);
 const reload=useCallback(async()=>{setUser(await api<User>("/users/me"));},[]);
 useEffect(()=>{if(initialized.current)return;initialized.current=true;
 // OAuth uses a one-time code; do not rotate an unrelated cookie on callback.
 if(window.location.pathname==="/auth/callback"){setLoading(false);return;}
 refresh().then(()=>api<User>("/users/me")).then(setUser).catch(e=>{if(e instanceof ApiError&&[401,403].includes(e.status))clear();else setError(e instanceof Error?e.message:"Connection unavailable");}).finally(()=>setLoading(false));
 },[clear]);
 async function authenticate(path:string,body:unknown){const data=await request<{accessToken:string}>(path,"POST",body);clear();setAccessToken(data.accessToken);const profile=await api<User>("/users/me");setUser(profile);return profile;}
 async function logout(all=false){await api(all?"/auth/logout-all":"/auth/logout","POST");clear();}
 return <Context.Provider value={{user,loading,error,login:(username,password)=>authenticate("/auth/login",{username,password}),exchange:code=>authenticate("/auth/exchange",{code}),logout,reload,clear,has:p=>!!user&&!user.mustChangePassword&&user.permissions.includes(p)}}>{children}</Context.Provider>;
}
export function useAuth(){const value=useContext(Context);if(!value)throw new Error("Missing AuthProvider");return value;}

