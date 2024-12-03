import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useClickCanvas } from "@/hooks/useClickCanvas";

type YorhaNavLinkProps = {
  text: string | any;
  to: string;
  className?: string;
  disabled?: boolean;
};

export const YorhaNavLink = ({
  className,
  text,
  to,
  disabled = false,
}: YorhaNavLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === to;
  const { triggerAnimation, autoRefire, setAutoRefire, status } = useClickCanvas();
  const handleClick = (event: React.MouseEvent) => {
    /* const x = event.clientX;
    const y = event.clientY;
    setAutoRefire({ auto: true, refireDelay: 1 });
    triggerAnimation(x, y); */
  }

  return (
    <Link href={to} prefetch={true} className="relative group min-w-32 cursor-pointer">
      {!isActive && <span className="absolute w-full opacity-0 h-[2px] translate-y-[2px] bg-[#57544a] group-hover:opacity-100 group-hover:translate-y-[0px] transition-all duration-300"/>}
       
      <div
        className={
          cn(
            "relative px-2 py-1 my-1 decoration-none flex flex-col transition-colors duration-300 overflow-hidden",
            isActive ? "bg-[#57544a] text-[#b4af9a]" : "bg-[#b4af9a] text-[#57544a] group-hover:text-[#b4af9a]"
          )
        }
      >
        <div
          aria-hidden="true"
          className={cn(
            "absolute inset-0 -translate-x-full group-hover:translate-x-0 transition-transform duration-300 z-[1]", !isActive && "bg-[#57544a]")}
        />
        <div className="relative flex flex-row items-center gap-2 overflow-hidden">
          <div aria-hidden="true" className={cn("absolute w-3 h-3 -translate-x-full group-hover:translate-x-0 transition-transform duration-300 z-[1]", !isActive && "bg-[#b4af9a]")} />
          <span className={cn("h-3 w-3 bg-[#57544a]", isActive ? "bg-[#b4af9a]" : "bg-[#57544a]")}/>
          <p className="z-[2] text-left">{text}</p>
        </div>
      </div>

      {!isActive && <span className="absolute w-full opacity-0 h-[2px] -translate-y-[4px] bg-[#57544a] group-hover:opacity-100 group-hover:-translate-y-[2px] transition-all duration-300"/>}
    </Link>
  );
};