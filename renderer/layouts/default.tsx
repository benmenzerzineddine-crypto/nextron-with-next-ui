import { useState } from "react";
import { Sidebar } from "@/components/navbar";
import clsx from "clsx";

export default function DefaultLayout({ children }: { children: React.ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="relative flex h-screen" style={{userSelect:"none"}}>
      <Sidebar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
      <main
        className={clsx("flex-grow p-6 transition-all duration-300")}
      >
        {children}
      </main>
    </div>
  );
}
