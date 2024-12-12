"use client"
import TriangleBall from "@/components/geom/TriangleBall"
import { sectionNameArr, useNavigateSection } from "@/hooks/use-navigate-section"
import { cn } from "@/lib/utils"

const HomePage = () => {
  const { currentSection } = useNavigateSection()

  const currentIndex = sectionNameArr.findIndex(c => c === currentSection)
  return (
    <div className="relative h-screen pt-24 w-screen">
      {/* 左下角球體 */}
      <div className={cn("absolute -left-72 -bottom-52 transition-opacity duration-1000 ease-linear",
        currentIndex === 0 ? "opacity-100 delay-1000" : "opacity-0"
      )}>
        <TriangleBall className="opacity-70"/>
      </div>
      {/* 下方banner字樣 */}
      <div className={cn("absolute left-8 h-24 flex text-white transition-all duration-1000 ease-in-out",
        currentIndex === 0 ? "bottom-0" : "-bottom-24"
      )}>
        <p className="font-extrabold font-sans text-5xl uppercase">divide zero</p>
        <div className="flex flex-col ml-4 mt-2">
          <p className="text-[10px] font-semibold uppercase leading-[8px]">web design</p>
          <span className="text-[10px]">https://dividezero.com</span>
          <div className="w-14 border-b-[1px] border-white mt-2"/>
        </div>
      </div>
    </div>
  )
}

export default HomePage