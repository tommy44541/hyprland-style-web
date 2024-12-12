import Particle from '@/components/particle'
import React from 'react'

const logos = [
  { label: "skull", src: "/cyber/skull.jpg", name: "skull" },
  { label: "kazimierz", src: "/Arknights/logo_kazimierz.png" , name: "kazimierz"},
  { label: "victoria", src: "/Arknights/logo_victoria.png" , name: "victoria"},
  { label: "yan", src: "/Arknights/logo_yan.png" , name: "yan"},
  { label: "Abydos", src: "/blue_archieve/Abydos.webp" , name: "abydos"},
  { label: "Arius", src: "/blue_archieve/Arius.webp" , name: "arius"},
  { label: "BaiGuiYaShin", src: "/blue_archieve/BaiGuiYaShin.webp" , name: "BaiGuiYaShin"},
  { label: "Gehenna", src: "/blue_archieve/Gehenna.webp" , name: "gehenna"},
  { label: "Millennium", src: "/blue_archieve/Millennium.webp" , name: "millennium"},
  { label: "SanHiJin", src: "/blue_archieve/SanHiJin.webp" , name: "sanhijin"},
  { label: "SRT", src: "/blue_archieve/SRT.webp" , name: "srt"},
  { label: "Trinity", src: "/blue_archieve/Trinity.webp" , name: "trinity"},
  { label: "Valkyrie", src: "/blue_archieve/Valkyrie.webp" , name: "valkyrie"},
  { label: "Redwinter", src: "/blue_archieve/Red_winter.webp" , name: "redwinter"},
];

const ServicePage = () => {
  return (
    <div className='relative h-screen'>
      <Particle logos={logos}/>
    </div>
  )
}

export default ServicePage