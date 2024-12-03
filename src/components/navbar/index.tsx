"use client"
import { YorhaNavLink } from "./nav-link";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
const Navbar = () => {
  return (
    <nav className="overflow-auto border-b border-[#57544a]">
      <div className="z-navbar flex gap-4 items-center w-full py-1 px-4">
        <YorhaNavLink to="/" text="home" />
        <YorhaNavLink to="/particle" text="particle" />
        <YorhaNavLink to="/world" text="world" />
        <YorhaNavLink to="/gallery" text="gallery" />
        <Avatar className="ml-auto cursor-pointer">
          <AvatarImage src="/skull_1.jpg" className="mix-blend-lighten"/>
          <AvatarFallback>T</AvatarFallback>
        </Avatar>
      </div>
      <div className="absolute w-full h-2 bg-gradient-to-r from-[#57544a] from-[14%] to-transparent to-0% bg-[length:50px_4px] bg-repeat-x"/>
    </nav>
  )
}

export default Navbar