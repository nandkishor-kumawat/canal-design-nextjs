"use client"
import React, { useRef } from 'react'
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Button } from './ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

gsap.registerPlugin(useGSAP);

export default function Baneer() {
    const title = useRef<HTMLHeadingElement>(null);

    useGSAP(() => {
        gsap.to('.title', {
            ease: "power3.out",
            duration: 0.25,
            scale: 1,
            delay: 0.5
        })
    })

    const router = useRouter();

    const setSearchParams = (method: string) => {
        router.replace(`/?method=${method}`);
        // document.getElementById('main')?.scrollIntoView({ behavior: 'smooth' });
        document.getElementById('main')?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="canalHead h-full w-full border-b border-b-[rgba(0,0,0,0.1)]">
            <div className="h-full backdrop-blur-md flex flex-col items-center">
                <div className="h-3/4 w-full flex items-end pb-16 justify-center ">
                    <h1 className="title font-bold w-3/4 text-white text-center select-none scale-0" ref={title}>Design of Irrigation Canal</h1>
                </div>
                <div className="flex gap-10 justify-end">
                    {/* <Button onClick={() => { setSearchParams('lacy') }}>Lacy&apos;s Theory</Button>
                    <Button onClick={() => { setSearchParams('kennedy') }}>Kennedy&apos;s Theory</Button> */}
                    <div className="scale-75 mt-10"><div className='icon-scroll'></div></div>
                </div>
            </div>
        </div>
    )
}
