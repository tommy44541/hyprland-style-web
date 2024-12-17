import { useState } from "react";

import { useClickOverlap } from "@/hooks/use-click-overlap";

import { LogOut } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";

const UserButton = () => {
  const { triggerAnimation } = useClickOverlap();

  const [userDropdownShow, setUserDropdownShow] = useState(false)

  const handleClick = (event: React.MouseEvent) => {
    if(userDropdownShow){
      const x = event.clientX;
      const y = event.clientY;
      triggerAnimation(x, y);
    }
    setUserDropdownShow(prev => !prev)
  }
  
  return(
    <DropdownMenu modal={false} open={userDropdownShow}>
      <DropdownMenuTrigger className="outline-none relative z-navbar" onClick={handleClick}>
        <Avatar className="size-8 hover:opacity-75 transition border border-neutral-300">
          <AvatarImage src="/cyber/skull_black.avif"/>
          <AvatarFallback>T</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side="bottom"
        className="w-60 bg-nierLight border-nierDark"
        sideOffset={10}
      >
        <div className="flex flex-col items-center justify-center gap-2 px-2.5 py-4">
        <Avatar className="cursor-pointer">
          <AvatarImage src="/cyber/skull_black.avif"/>
          <AvatarFallback>T</AvatarFallback>
        </Avatar>
          <div className="flex flex-col items-center justify-center">
            <p className="text-sm font-medium text-neutral-900">
              User
            </p>
            <p className="text-xs text-neutral-500">email</p>
          </div>
        </div>
        <DropdownMenuItem
          onClick={() => {}}
          className="h-10 flex items-center justify-center text-amber-700 font-medium cursor-pointer"
        >
          <LogOut className="size-4 mr-2" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default UserButton