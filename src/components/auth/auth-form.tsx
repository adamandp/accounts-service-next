"use client";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {useState} from "react";
import {ShieldCheck} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card,CardContent,CardDescription,CardHeader,CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {useAuth} from "@/providers/auth-provider";
import {API_URL,request} from "@/services/api";
import {errorMessage,validPassword} from "@/utils/format";
import {toast} from "sonner";
export function AuthForm({register=false}:{register?:boolean}){
 const router=useRouter(),auth=useAuth();const [busy,setBusy]=useState(false),[error,setError]=useState("");
 async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();const f=new FormData(e.currentTarget);const username=String(f.get("username")),password=String(f.get("password")),confirmPassword=String(f.get("confirmPassword")??"");
 if(!validPassword(password)){setError("Password must be 8–72 UTF-8 bytes.");return;}if(register&&password!==confirmPassword){setError("Passwords do not match.");return;}
 setBusy(true);setError("");try{if(register){await request("/auth/register","POST",{username,password,confirmPassword});toast.success("Account created. Sign in to continue.");router.replace("/login");}else{const user=await auth.login(username,password);router.replace(user.mustChangePassword?"/change-password":"/overview");}}catch(e){setError(errorMessage(e));}finally{setBusy(false);}}
 return <main className="flex min-h-svh items-center justify-center bg-muted/40 p-6"><div className="w-full max-w-sm space-y-6"><div className="flex items-center justify-center gap-2 font-semibold"><ShieldCheck className="size-6"/> Accounts Service</div><Card><CardHeader><CardTitle>{register?"Create an account":"Sign in"}</CardTitle><CardDescription>{register?"Enter your details to get started.":"Enter your credentials to access your account."}</CardDescription></CardHeader><CardContent><form className="grid gap-4" onSubmit={submit}><div className="grid gap-2"><Label htmlFor="username">Username</Label><Input id="username" name="username" required minLength={3} maxLength={50} pattern="[A-Za-z0-9_.-]+" autoComplete="username"/></div><div className="grid gap-2"><Label htmlFor="password">Password</Label><Input id="password" name="password" type="password" required autoComplete={register?"new-password":"current-password"}/></div>{register&&<div className="grid gap-2"><Label htmlFor="confirmPassword">Confirm password</Label><Input id="confirmPassword" name="confirmPassword" type="password" required autoComplete="new-password"/></div>}{error&&<p role="alert" className="text-sm text-destructive">{error}</p>}<Button disabled={busy} type="submit">{busy?"Please wait…":register?"Create account":"Sign in"}</Button><div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border"/>Or continue with<span className="h-px flex-1 bg-border"/></div>{["google","github"].map(p=><Button key={p} type="button" variant="outline" onClick={()=>window.location.assign(API_URL+"/auth/oauth/"+p+"/start")} disabled={busy}>{p==="google"?"Google":"GitHub"}</Button>)}<p className="text-center text-sm text-muted-foreground">{register?"Already have an account? ":"Don't have an account? "}<Link className="text-foreground underline underline-offset-4" href={register?"/login":"/register"}>{register?"Sign in":"Sign up"}</Link></p></form></CardContent></Card></div></main>;
}

