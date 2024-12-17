"use client"
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { sectionNameArr, useNavigateSection } from "@/hooks/use-navigate-section";

import { cn } from "@/lib/utils";
import { sections } from "@/app/page";
import { AudioLinesIcon, LinkIcon, UserIcon, XIcon } from "lucide-react";
import { useClickOverlap } from "@/hooks/use-click-overlap";

const Navbar = () => {
  const { currentSection, setSection, setPrevIndex } = useNavigateSection()

  const { triggerAnimation, setAnimationRunning } = useClickOverlap();

  const currentIndex = sectionNameArr.findIndex(c => c === currentSection)

  const [showRightArea, setShowRightArea] = useState(false)

  const [showToolbox, setShowToolbox] = useState(false)

  useEffect(() => {
    //if(!showRightArea) return
    const handleClickOutside = (event: MouseEvent) => {
      const rightArea = document.querySelector('.right-area'); // 假設你給 rightArea 加了一個 class 名稱
      if (rightArea && !rightArea.contains(event.target as Node)) {
        const { clientX: x, clientY: y } = event
        setAnimationRunning(true)
        triggerAnimation(x, y)
        setShowRightArea(false)
      }
    };

    if (showRightArea) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showRightArea]);
  return (
    <>
      <nav className="fixed flex items-center justify-end top-0 w-full h-20 text-white z-navbar">
        <div
          className="flex flex-col items-center justify-center gap-1 mr-auto px-2 cursor-pointer"
          onClick={() => setSection(0)}
        >
          <div className="h-10 w-10 flex items-center justify-center bg-gradient-to-b from-nierDark from-[50%] to-nierLight to-[50%] text-white rounded-full">
            <p className="font-bold">D.0</p>
          </div>
          <span className="whitespace-nowrap text-[8px] font-semibold underline uppercase">Divide Zero Tech</span>
        </div>
        <div className="flex gap-2 justify-evenly pr-[136px]">
        {sections.map((_, index) => (
          <div
            key={index} 
            onClick={() => {
              setPrevIndex(currentIndex)
              setSection(index)
            }} 
            className="relative group min-w-32 cursor-pointer overflow-hidden"
          >
            <div className="h-10 flex items-center">
              <div className={
                cn(
                  "relative flex items-center p-2 h-8 w-full transition-all duration-300 before:transition-all before:duration-300 before:absolute before:w-full before:opacity-0 before:h-[2px] before:top-0 before:left-0 before:bg-nierDark before:group-hover:top-[-4px] before:group-hover:opacity-100 after:transition-all after:duration-300 after:absolute after:w-full after:opacity-0 after:h-[2px] after:left-0 after:bottom-0 after:bg-nierDark after:group-hover:bottom-[-4px] after:group-hover:opacity-100",
                  currentIndex === index ? "bg-nierDark text-nierLight" : "bg-nierLight text-nierDark group-hover:text-nierLight"
                )}
              >
                <div className="relative flex items-center gap-2 overflow-hidden z-[2]">
                  <div aria-hidden="true" className={cn("absolute w-3 h-3 -translate-x-full group-hover:translate-x-0 transition-transform duration-100 z-[1]", currentIndex !== index && "bg-nierLight")} />
                  <span className={cn("h-3 w-3 bg-nierDark", currentIndex === index  ? "bg-nierLight" : "bg-nierDark")}/>
                  <p className="text-left text-sm uppercase">{sectionNameArr[index]}</p>
                </div>
              </div>
            </div>
            <div
              aria-hidden="true"
              className={cn(
                "absolute h-8 inset-0 top-1 bg-nierDark -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-in-out",
                //解決路由切換時的閃爍行為
                currentIndex !== index  ? ' z-[1]' : "z-0"
              )}
            />
          </div>
        ))}
        </div>
      {/* 鋸齒狀邊緣 */}  
      {/* <div className="absolute w-full h-20 bg-gradient-to-r from-[#57544a] from-[14%] to-transparent to-0% bg-[length:50px_4px] bg-repeat-x"/> */}
      </nav>
      <div className='absolute right-0 top-0 h-20 flex items-center justify-evenly gap-2 w-32 z-sidebar'>
        <LinkIcon
          className='cursor-pointer size-6' 
          onClick={() => setShowToolbox(prev => !prev)}
        />
        <AudioLinesIcon
           className='cursor-pointer size-6' 
        />
        <UserIcon
          className='cursor-pointer size-6' 
          onClick={(e) => {
            setShowRightArea(prev => !prev)
            const { clientX: x, clientY: y } = e
            setAnimationRunning(true)
            triggerAnimation(x, y);
          }}
        />
      </div>
      <div className={cn("right-area h-screen w-32 absolute top-0 bg-sky-400 transition-all duration-500 ease-in-out z-sidebar",
        showRightArea ? "right-0" : "-right-32"
      )}>
        <div className="flex flex-col h-full w-full items-center">
          <div className="flex-1 h-full w-full py-12 pl-4 pr-2 justify-center">
            <div className="flex w-full items-center gap-2">
              <p className="text-[8px] font-semibold text-white uppercase">welcome</p>
              <div className="h-[1px] w-full bg-white "></div>
            </div>
            <div className="flex items-center justify-center m-4">
              <Avatar className="size-20 hover:opacity-75 transition border border-neutral-300">
                <AvatarImage src="/cyber/skull_black.avif"/>
                <AvatarFallback>T</AvatarFallback>
              </Avatar>
            </div>
            <div className="mb-12">
              <p className="text-xs text-white">Devide Zero Tech</p>
            </div>
            <div className="flex w-full items-center gap-2">
              <p className="text-[8px] font-semibold text-white uppercase">tooltip</p>
              <div className="h-[1px] w-full bg-white"></div>
            </div>
            <div className="flex items-center justify-start flex-wrap gap-1 mt-4">
              {Array.from({ length: 5 }, (_, index) => (
                <div
                  key={index}
                  className="w-8 h-8 bg-rose-100 flex items-center justify-center cursor-pointer"
                >
                  src
                </div>
              ))}
            </div>
          </div>
          <div 
            className="h-24 w-full hover:bg-white hover:text-black flex items-center justify-center text-4xl cursor-pointer transition-colors duration-500 ease-in-out"
            onClick={(e) => {
              setShowRightArea(false)
              const { clientX: x, clientY: y } = e
              setAnimationRunning(true)
              triggerAnimation(x, y);
            }}
          >
            <XIcon className="size-24"/>
          </div>
        </div>
      </div>
      <div className={cn("h-60 w-32 right-0 absolute bg-sky-400 transition-all duration-500 ease-in-out before:border-[1rem] before:border-transparent before:border-b-sky-400 before:absolute before:-top-8 before:left-2 z-sidebar",
        showToolbox ? "top-20 opacity-100" : "top-10 opacity-0 pointer-events-none"
      )}>
        test
      </div>
    </>
  )
}

export default Navbar