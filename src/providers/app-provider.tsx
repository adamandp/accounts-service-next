"use client";
import {QueryClient,QueryClientProvider} from "@tanstack/react-query";
import {ThemeProvider} from "next-themes";
import {useState} from "react";
import {AuthProvider} from "@/providers/auth-provider";
import {Toaster} from "@/components/ui/sonner";
export function AppProvider({children}:{children:React.ReactNode}){
 const [client]=useState(()=>new QueryClient({defaultOptions:{queries:{retry:false,staleTime:30_000,refetchOnWindowFocus:true},mutations:{retry:false}}}));
 return <ThemeProvider attribute="class" defaultTheme="system" enableSystem><QueryClientProvider client={client}><AuthProvider>{children}</AuthProvider><Toaster richColors/></QueryClientProvider></ThemeProvider>;
}

