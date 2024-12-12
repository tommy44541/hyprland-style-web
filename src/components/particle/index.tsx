"use client";
import { useEffect, useRef, useState } from 'react';

type logosType = {
  label: string, src: string, name: string
}[]

interface IParticle {
  logos: logosType
}

// 常數
const width = 400;
const height = 400;
const animateTime = 30;
const opacityStep = 1 / animateTime;
const radius = 40;
const intensity = 0.95;
const r = 1.2;
const step = 5;

const Particle = ({
  logos
}: IParticle) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  let context = useRef<CanvasRenderingContext2D | null>(null);

  let particleCanvas = useRef<ReturnType<typeof createParticleCanvas> | null>(null);

  const [logoImgs, setLogoImgs] = useState<ReturnType<typeof createLogoImg>[]>([]);

  // 粒子工廠
  const createParticle = (totalX: number, totalY: number, time: number, color: number[]) => {
    const particle = {
      x: (Math.random() * width) >> 0,
      y: (Math.random() * height) >> 0,
      totalX,
      totalY,
      time,
      r,
      color: [...color],
      opacity: 0,
      
      draw(context: CanvasRenderingContext2D) {
        context.fillStyle = `rgba(${this.color.toString()})`;
        context.fillRect(this.x, this.y, this.r * 2, this.r * 2);
        context.fill();
      },

      update(mouseX?: number, mouseY?: number) {
        const mx = this.totalX - this.x;
        const my = this.totalY - this.y;
        let vx = mx / this.time;
        let vy = my / this.time;

        if (mouseX && mouseY) {
          const dx = mouseX - this.x;
          const dy = mouseY - this.y;
          const distance = Math.sqrt(dx ** 2 + dy ** 2);
          let disPercent = radius / distance;
          disPercent = disPercent > 7 ? 7 : disPercent;
          
          const angle = Math.atan2(dy, dx);
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);
          
          const repX = cos * disPercent * -intensity;
          const repY = sin * disPercent * -intensity;
          vx += repX;
          vy += repY;
        }

        this.x += vx;
        this.y += vy;
        if (this.opacity < 1) this.opacity += opacityStep;
      },

      change(x: number, y: number, color: number[]) {
        this.totalX = x;
        this.totalY = y;
        this.color = [...color];
      }
    };
    
    return particle;
  };

  // Logo 圖片處理
  const createLogoImg = (src: string, name: string) => {
    const logoImg = {
      src,
      name,
      particleData: [] as ReturnType<typeof createParticle>[],
    };

    const img = new Image();
    img.crossOrigin = "";
    img.src = src;

    img.onload = () => {
      const tmp_canvas = document.createElement("canvas");
      const tmp_ctx = tmp_canvas.getContext("2d");
      const imgW = width;
      const imgH = ~~(width * (img.height / img.width));
      tmp_canvas.width = imgW;
      tmp_canvas.height = imgH;
      
      if (!tmp_ctx) return;
      
      tmp_ctx.drawImage(img, 0, 0, imgW, imgH);
      const imgData = tmp_ctx.getImageData(0, 0, imgW, imgH).data;
      tmp_ctx.clearRect(0, 0, width, height);

      //修改步進值控制粒子密度, 步進值越小, 粒子密度越高
      for (let y = 0; y < imgH; y += step) {
        for (let x = 0; x < imgW; x += step) {
          const index = (x + y * imgW) * 4;
          const r = imgData[index];
          const g = imgData[index + 1];
          const b = imgData[index + 2];
          const a = imgData[index + 3];
          const sum = r + g + b + a;
          
          if (sum >= 100) {
            const particle = createParticle(x, y, animateTime, [r, g, b, a]);
            logoImg.particleData.push(particle);
          }
        }
      }
    };

    return logoImg;
  };

  // 畫布控制
  const createParticleCanvas = (target: HTMLCanvasElement) => {
    const ctx = target.getContext("2d") as CanvasRenderingContext2D;
    let particleArr: ReturnType<typeof createParticle>[] = [];
    let mouseX: number | undefined;
    let mouseY: number | undefined;

    target.addEventListener("mousemove", (e) => {
      const { left, top } = target.getBoundingClientRect();
      const { clientX, clientY } = e;
      mouseX = clientX - left;
      mouseY = clientY - top;
    });

    target.onmouseleave = () => {
      mouseX = 0;
      mouseY = 0;
    };

    return {
      changeImg(img: ReturnType<typeof createLogoImg>) {
        if (particleArr.length) {
          const newPrtArr = img.particleData;
          const newLen = newPrtArr.length;
          const oldLen = particleArr.length;

          for (let idx = 0; idx < newLen; idx++) {
            const { totalX, totalY, color } = newPrtArr[idx];
            if (particleArr[idx]) {
              particleArr[idx].change(totalX, totalY, color);
            } else {
              particleArr[idx] = createParticle(totalX, totalY, animateTime, color);
            }
          }

          if (newLen < oldLen) particleArr = particleArr.splice(0, newLen);

          let tmp_len = particleArr.length;
          while (tmp_len) {
            const randomIdx = ~~(Math.random() * tmp_len--);
            const randomPrt = particleArr[randomIdx];
            const { totalX: tx, totalY: ty, color } = randomPrt;

            randomPrt.totalX = particleArr[tmp_len].totalX;
            randomPrt.totalY = particleArr[tmp_len].totalY;
            randomPrt.color = particleArr[tmp_len].color;
            particleArr[tmp_len].totalX = tx;
            particleArr[tmp_len].totalY = ty;
            particleArr[tmp_len].color = color;
          }
        } else {
          particleArr = img.particleData.map(item =>
            createParticle(item.totalX, item.totalY, animateTime, item.color)
          );
        }
      },

      drawCanvas() {
        ctx.clearRect(0, 0, width, height);
        particleArr.forEach(particle => {
          particle.update(mouseX, mouseY);
          particle.draw(ctx);
        });
        window.requestAnimationFrame(() => this.drawCanvas());
      }
    };
  };
  
  useEffect(() => {
    const newLogoImgs = logos.map(logo => createLogoImg(logo.src, logo.name));
    setLogoImgs(newLogoImgs);
    
    if (canvasRef.current) {
      context.current = canvasRef.current.getContext("2d");
      particleCanvas.current = createParticleCanvas(canvasRef.current);
      particleCanvas.current.drawCanvas();

      const firstLogo = newLogoImgs[0];
      setTimeout(() => {
        if (particleCanvas.current && firstLogo.particleData.length > 0) {
          particleCanvas.current.changeImg(firstLogo);
        }
      }, 100);
    }
    
  }, []);

  const clickLogo = (prt_canvas: ReturnType<typeof createParticleCanvas> | null, logoItem: Omit<ReturnType<typeof createLogoImg>, 'particleData'>) => {
    const logoImg = logoImgs.find(img => img.name === logoItem.name);
    if (logoImg && prt_canvas) {
      prt_canvas.changeImg(logoImg);
    }
  }

  return (
    <div className='w-full h-full flex items-center justify-center gap-4'>
      <div className='flex flex-row w-1/3 gap-4 flex-wrap items-center justify-center'>
        {logos.map((logo) => (
          <img
            className='w-20 h-20 cursor-pointer'
            src={logo.src}
            alt={logo.label}
            key={logo.label}
            onClick={() => clickLogo(particleCanvas.current, logo)}
          />
        ))}
      </div>
      <canvas width={width} height={height} ref={canvasRef}></canvas>
    </div>
  )
}

export default Particle