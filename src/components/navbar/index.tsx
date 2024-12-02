"use client"
import { useClickCanvas } from "../../hooks/useClickCanvas";
const Navbar = () => {
  const { triggerAnimation, setAutoRefire, status } = useClickCanvas();
  const handleClick = (event: React.MouseEvent) => {
    // 获取点击位置相对于视口的坐标
    const x = event.clientX;
    const y = event.clientY;
    //setAutoRefire({ auto: true, refireDelay: 2 });
    // 触发动画
    triggerAnimation(x, y);
  };
  return (
    <nav>
      <div className="z-navbar flex justify-between gap-4 items-center w-full border-b border-gray-200 py-2">
        <div className="cursor-pointer" onClick={handleClick}>route1 </div>
        <div className="cursor-pointer" onClick={handleClick}>route2</div>
        <div className="cursor-pointer" onClick={handleClick}>route3</div>
      </div>
      <div className="absolute left-4 w-full h-2 bg-gradient-to-r from-black/70 from-[14%] to-transparent to-0% bg-[length:50px_4px] bg-repeat-x"/>
    </nav>
  )
}

export default Navbar