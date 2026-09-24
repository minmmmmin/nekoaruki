import { ReactNode } from "react";

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <div className="w-full h-screen bg-gray-100 flex items-center justify-center">
      {children}
    </div>
  );
}
