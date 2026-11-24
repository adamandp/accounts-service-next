export const date=(value:string)=>new Intl.DateTimeFormat("en",{dateStyle:"medium",timeStyle:"short"}).format(new Date(value));
export const errorMessage=(error:unknown)=>error instanceof Error?error.message:"Something went wrong.";
export const validPassword=(value:string)=>{const size=new TextEncoder().encode(value).length;return size>=8&&size<=72;};

