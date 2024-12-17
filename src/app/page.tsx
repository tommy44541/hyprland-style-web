"use client"
import { useEffect, useState } from 'react';
import { ChevronsDownIcon, ChevronsUpIcon } from 'lucide-react';

import HomePage from '@/features/static-page/home';
import { sectionNameArr, useNavigateSection } from '@/hooks/use-navigate-section';
import { cn } from '@/lib/utils';
import ServicePage from '@/features/static-page/service';

export const sections = [
  <HomePage />,
  //<ServicePage />,
  <div className='h-screen pt-24 pl-4 whitespace-nowrap'>to be continue</div>,
  <div className='h-screen pt-24 pl-4 whitespace-nowrap'>to be continue</div>,
  <div className='h-screen pt-24 pl-4 whitespace-nowrap'>to be continue</div>,
  <div className='h-screen pt-24 pl-4 whitespace-nowrap'>to be continue</div>,
  <div className='h-screen pt-24 pl-4 z-10 bg-slate-400 whitespace-nowrap'>
    full screen showcase, to be continue
  </div>,
]

export default function Page() {
    const { currentSection, setSection, prevIndex, setPrevIndex } = useNavigateSection()

    const currentIndex = sectionNameArr.findIndex(c => c === currentSection)

    const [isScrolling, setIsScrolling] = useState(false)

    const [showFooter, setShowFooter] = useState(false)

    const handleScroll = (event: WheelEvent) => {
      event.preventDefault()
      if (isScrolling) return; // 防止多次觸發

      const { deltaY } = event

      if (deltaY > 0) {
        // Scroll Down
        if(currentIndex < sections.length - 1 && !showFooter){
          setPrevIndex(currentIndex)
          setSection(currentIndex + 1)
        } else {
          setShowFooter(true)
        }
      }
      else if (deltaY < 0) {
        // Scroll Up
        if(currentIndex > 0 && !showFooter){
          setPrevIndex(currentIndex)
          setSection(currentIndex - 1)
        } else {
          setShowFooter(false)
        }        
      }

      setIsScrolling(true)
    };
  
    useEffect(() => {
      const handleWheel = (event: WheelEvent) => handleScroll(event);
  
      window.addEventListener('wheel', handleWheel, { passive: false });

      return () => {
        window.removeEventListener('wheel', handleWheel);
      };
    }, [currentIndex, isScrolling, showFooter]);

    useEffect(() => {
      // 防抖，解鎖滾動
      const timeout = setTimeout(() => setIsScrolling(false), 1000);
      return () => clearTimeout(timeout);
    }, [isScrolling]);

    return (
      <div className={cn('relative w-full h-screen transition-transform duration-500 ease-in-out z-main',
        showFooter ? '-translate-y-32' : 'translate-y-0'
      )}>
        <div className="relative h-screen w-full">
         {/* 上方裝飾線 */}
          <div className={cn("w-full border-b-[1px] absolute border-nierDark/30 transition-all duration-1000 ease-in-out z-20",
            [1, 2].includes(currentIndex) ? "top-20" : "top-0"
          )}/>
          {/* 下方裝飾線 */}
          <div className={cn("w-full border-t-[1px] absolute border-nierDark/30 transition-all duration-1000 ease-in-out z-20",
            [0, 2, 3, 4, 5].includes(currentIndex) ? "bottom-24" : "bottom-0"
          )}/>
          {/* 右方裝飾線-僅透過z-index控制顯示 */}
          <div className="h-screen border-l-[1px] absolute right-32 border-nierDark/30 z-0"/>
          {/* 右方動態頁碼 */}
          <div className={cn("absolute right-0 top-1/3 w-32 h-full z-20 transition-all duration-200 ease-linear bg-transparent",
            currentIndex === 0 && "bg-sky-500/30",
          )}>
            <div className="flex flex-col justify-center">
              <div className='relative overflow-y-hidden h-8'>
                <p className={cn("absolute w-full top-0 left-4 text-4xl font-extrabold text-sky-500 transition-all duration-500 ease-in-out fill-mode-forwards",
                  /* 下一頁->向上淡入 上一頁->向下淡入*/
                  isScrolling ? 
                  currentIndex > prevIndex ? "animate-page-transition-leave" : "animate-page-transition-leave-reverse" :
                  currentIndex > prevIndex ? "animate-page-transition-enter" : "animate-page-transition-enter-reverse",
                )}>
                  0{isScrolling && !showFooter ? prevIndex : currentIndex}
                </p>
                <div className='absolute bottom-1 left-14'>
                  <div
                    //font-strech屬性tailwind尚未支援
                    style={{ fontStretch: 'expanded' }}
                    className={cn("relative font-sans text-xs text-white before:absolute before:bottom-[2.5px] before:left-0 before:content-['divide-zero'] before:text-[7px] before:font-mono before:h-1 before:w-full",
                      isScrolling ? 
                      currentIndex > prevIndex ? "animate-page-transition-leave delay-200" : "animate-page-transition-leave-reverse delay-200" :
                      currentIndex > prevIndex ? "animate-page-transition-enter" : "animate-page-transition-enter-reverse"
                  )}>
                    //0{isScrolling && !showFooter ? prevIndex : currentIndex}//05
                  </div>
                </div>
              </div>
              <div
                className={cn("text-white font-bold text-sm uppercase self-end pr-[18px]",
                  isScrolling ? 
                  currentIndex > prevIndex ? "animate-page-transition-leave delay-500" : "animate-page-transition-leave-reverse delay-500" :
                  currentIndex > prevIndex ? "animate-page-transition-enter" : "animate-page-transition-enter-reverse"
              )}>
                {sectionNameArr[isScrolling && !showFooter ? prevIndex : currentIndex]}
              </div>
            </div>
          </div>
          {sections.map((section, index) => (
            <div key={index} className={cn(`absolute h-full top-0 right-0 overflow-hidden transition-all duration-1000 ease-in-out`,
              //控制左右翻頁邏輯
              currentIndex === index ? `w-full ${prevIndex > index ? "left-0" : "left-auto"}` : `w-0 ${currentIndex > index ? "left-0" : "left-auto"}`,
              //控制footer相關行為
              showFooter && "pointer-events-none",
            )}>
              {section}
            </div>
          ))}
        </div>
        {showFooter ? 
          <ChevronsUpIcon className='animate-bounce absolute bottom-6 left-1/2 text-nierDark'/>
        : <ChevronsDownIcon className='animate-bounce absolute bottom-6 left-1/2 text-nierDark'/>}
        <div className="bg-gray-300 text-gray-700 flex items-center justify-center text-xl h-32">
            {/* generate a footer section */}
            footer content
        </div>
      </div>
  );
}