"use client"

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useRef } from "react";
import { Label } from "./ui/label";
import { NumberInput } from "./ui/input";
import { AnimatePresence, delay, motion } from "framer-motion";
import { roundTo, solveEquations } from "@/lib/utils";

const formSchema = z.object({
  discharge: z.string()
    .refine((value) => !isNaN(parseFloat(value)), { message: "Enter a valid number" })
    .refine(value => (+value) > 0, { message: "Enter a positive number", }),
  diameter: z.string().refine(value => (+value) > 0 && (+value) < 2.5, { message: "Enter a positive number", }),
  siltFactor: z.string().optional(),
  bedSlopeH: z.string().refine(value => (+value) > 0, { message: "Enter a positive number", }).refine(value => (+value) <= 2.5, { message: "Enter a number less than 2.5", }),
  bedSlopeV: z.string().refine(value => (+value) > 0, { message: "Enter a positive number", }).refine(value => (+value) <= 2.5, { message: "Enter a number less than 2.5", }),

}).refine(data => data.diameter || data.siltFactor,
  {
    message: "Enter either diameter or silt factor",
    path: ["diameterError",]
  }
)

export default function Lacy() {
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      discharge: "2.18",
      diameter: "0.73",
      bedSlopeH: "1",
      bedSlopeV: "1",
    }
  })

  const [isCalculated, setIsCalculated] = React.useState(false);
  const [designValues, setValues] = React.useState({
    siltFactor: 0,
    velocity: 0,
    hydraulicMeanRadius: 0,
    area: 0,
    wettedPerimeter: 0,
    bedSlope: 0,
    scourDepth: 0,
    depth: 0,
    width: 0,
  })

  const setValue = (name: string, value: number) => {
    setValues(prev => ({ ...prev, [name]: value }))
  }

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsCalculated(false);
    await new Promise(resolve => setTimeout(resolve, 0));

    const { discharge, diameter: d } = data;
    const Q = +discharge;
    const f = roundTo(1.76 * Math.sqrt(+d), 1)
    const V = roundTo((Q * (f ** 2) / 140) ** (1 / 6))
    const R = roundTo(2.5 * (V ** 2) / f)
    const A = roundTo(Q / V)
    const P = roundTo(4.75 * Math.sqrt(Q))
    const S = (f ** (5 / 3)) / (3340 * (Q ** (1 / 6)))
    const scourDepth = roundTo(0.473 * Math.pow(Q / f, 1 / 3))

    const sol = solveEquations(P, A, 1 / 2);
    console.log(sol)

    setValues(prev => ({
      ...prev,
      siltFactor: f,
      velocity: V,
      hydraulicMeanRadius: R,
      area: A,
      wettedPerimeter: P,
      bedSlope: S,
      scourDepth: scourDepth,
      depth: sol.y,
      width: sol.B
    }))

    setIsCalculated(true)
  }

  const container = useRef<HTMLDivElement>(null);
  const goodRef = useRef<HTMLButtonElement>(null);

  // useGSAP((context, contextSafe) => {

  //   // gsap.to(container.current, { x: -1000 });

  //   const onClickGood = contextSafe!(() => {
  //     gsap.from('.lacy-result > p', {
  //       x: -1000,
  //       // duration: 0.2,
  //       stagger: 0.05,
  //       ease: "power3.out",
  //     });
  //   });

  //   goodRef.current!.addEventListener("click", onClickGood);

  //   return () => {
  //     goodRef.current!.removeEventListener("click", onClickGood);
  //   };

  // });

  return (
    <div className="w-full max-w-md" id="lacy">
      <h1 className="text-2xl mb-3 text-indigo-900">Lacy&apos;s Theory</h1>
      <form action="" className="space-y-3" onSubmit={handleSubmit(onSubmit)}>

        <div className="flex gap-2 justify-between items-center">
          <Label htmlFor="discharge">Discharge: Q (cumec)</Label>
          <NumberInput id="discharge" {...register("discharge")} />
        </div>

        {errors.discharge && <p className="text-red-500">{errors.discharge.message}</p>}

        <div className="flex gap-2 justify-between items-center">
          <Label htmlFor="diameter">Diameter: d (mm)</Label>
          <NumberInput id="diameter" {...register("diameter")} />
        </div>
        {errors.diameter && <p className="text-red-500">{errors.diameter.message}</p>}

        <div className="flex gap-2 justify-between items-center">
          <Label htmlFor="bedSlope">Bed Slope: m (H:V)</Label>
          <div className="flex gap-2 items-center">
            <NumberInput id="bedSlopeH" {...register("bedSlopeH")} placeholder="H" className="w-10" />:
            <NumberInput id="bedSlopeV" {...register("bedSlopeV")} placeholder="V" className="w-10" />
          </div>
        </div>
        {errors.bedSlopeH && <p className="text-red-500">{errors.bedSlopeH.message}</p>}
        {errors.bedSlopeV && <p className="text-red-500">{errors.bedSlopeV.message}</p>}


        <motion.button
          whileTap={{ scale: 0.9 }}
          className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-cyan-500 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200 dark:focus:ring-cyan-800">
          <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
            Calculate
          </span>
        </motion.button>
      </form>


      <AnimatePresence>
        {isCalculated && (
          <div key={'lacy'} className="flex gap-2 justify-center flex-col my-3 lacy-result">

            <motion.h2
              initial={{ scale: 0, x: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className='text-2xl text-indigo-800 w-fit'>Result:</motion.h2>
            <motion.p
              initial={{ x: -1000 }}
              animate={{ x: 0 }}
              transition={{ delay: 0 }}
              exit={{ x: 1000 }}
            >
              Silt Factor: f = {designValues.siltFactor}
            </motion.p>
            <motion.p
              initial={{ x: -1000 }}
              animate={{ x: 0 }}
              transition={{ delay: 0.05 }}
              exit={{ x: 1000 }}
            >
              Velocity: V = {designValues.velocity}m/s
            </motion.p>
            <motion.p
              initial={{ x: -1000 }}
              animate={{ x: 0 }}
              transition={{ delay: 0.15 }}
              exit={{ x: 1000 }}
            >
              Area: A = {designValues.area}m<sup>2</sup>
            </motion.p>
            <motion.p
              initial={{ x: -1000 }}
              animate={{ x: 0 }}
              transition={{ delay: 0.2 }}
              exit={{ x: 1000 }}
            >
              Wetted Perimeter: P = {designValues.wettedPerimeter}m
            </motion.p>
            <motion.p
              initial={{ x: -1000 }}
              animate={{ x: 0 }}
              transition={{ delay: 0.1 }}
              exit={{ x: 1000 }}
            >
              Hydraulic Mean Radius: R = {designValues.hydraulicMeanRadius}m
            </motion.p>
            <motion.p
              initial={{ x: -1000 }}
              animate={{ x: 0 }}
              transition={{ delay: 0.25 }}
              exit={{ x: 1000 }}
            >
              Bed Slope: S = {designValues.bedSlope.toFixed(5)} (1 in {Math.floor(1 / designValues.bedSlope)})
            </motion.p>
            <motion.p
              initial={{ x: -1000 }}
              animate={{ x: 0 }}
              transition={{ delay: 0.3 }}
              exit={{ x: 1000 }}
            >
              Scour depth: R<sub>r</sub> = {designValues.scourDepth}m
            </motion.p>
            <motion.p
              initial={{ x: -1000 }}
              animate={{ x: 0 }}
              transition={{ delay: 0.3 }}
              exit={{ x: 1000 }}
            >
              Depth: D = {designValues.depth}m
            </motion.p>
            <motion.p
              initial={{ x: -1000 }}
              animate={{ x: 0 }}
              transition={{ delay: 0.3 }}
              exit={{ x: 1000 }}
            >
              Width: B = {designValues.width}m
            </motion.p>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
