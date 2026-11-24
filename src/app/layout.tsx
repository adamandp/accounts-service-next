import type {Metadata} from "next";
import "./globals.css";
import {AppProvider} from "@/providers/app-provider";
export const metadata:Metadata={title:{default:"Accounts Service",template:"%s | Accounts Service"},description:"Identity and access management",referrer:"no-referrer"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" suppressHydrationWarning><body className="antialiased"><AppProvider>{children}</AppProvider></body></html>;}

