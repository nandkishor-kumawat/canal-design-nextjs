"use client"

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";

const formSchema = z.object({
  discharge: z.string()
    .refine((value) => !isNaN(parseFloat(value)), { message: "Enter a valid number" })
    .refine(value => (+value) > 0, { message: "Enter a positive number", }),
  diameter: z.string().refine(value => (+value) > 0, { message: "Enter a positive number", }),
  siltFactor: z.string().optional(),

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
    }
  })

  const [isCalculated, setIsCalculated] = React.useState(false);
  const [designValues, setValues] = React.useState({
    velocity: 0,
    hydraulicMeanRadius: 0,
    area: 0,
    wettedPerimeter: 0,
    bedSlope: 0
  })

  const setValue = (name: string, value: number) => {
    setValues(prev => ({ ...prev, [name]: value }))
  }

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    const { discharge, diameter: d } = data;
    const Q = +discharge;
    // let f = (+d ? +(1.76 * Math.sqrt(+d)).toFixed(2) : siltFactor) as number;
    let f = +(1.76 * Math.sqrt(+d)).toFixed(2)
    const V = +((Q * f ** 2 / 140) ** (1 / 6)).toFixed(2);
    setValue("velocity", V);

    const R = +(2.5 * V ** 2 / f).toFixed(2);
    setValue("hydraulicMeanRadius", R);

    const A = +(Q / V).toFixed(2);
    setValue("area", A);

    const P = +(4.75 * Q ** 0.5).toFixed(2);
    setValue("wettedPerimeter", P);

    const S = +(f ** (5 / 3) / (3340 * Q ** (1 / 6))).toFixed(5);
    setValue("bedSlope", S);

    console.log(Math.round(1 / S / 100) * 100);
    setIsCalculated(true)
  }

  console.log(errors)

  return (
    <div className="container max-w-lg">
      <form action="" className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex gap-2 justify-center flex-col">
          <label htmlFor="discharge">Discharge: Q (cumec)</label>
          <input type="text" id="discharge" {...register("discharge")} />
        </div>
        {errors.discharge && <p className="text-red-500">{errors.discharge.message}</p>}
        <div className="flex gap-2">
          <div className="flex gap-2 justify-center flex-col flex-1">
            <label htmlFor="diameter">Diameter: d (mm)</label>
            <input type="text" id="diameter" {...register("diameter")} />
          </div>
          {/* <div className="flex items-center mx-3 border-r border-r-gray-300 relative">
            <p className="bg-white text-gray-400 absolute -left-3">OR</p>
          </div>
          <div className="flex gap-2 justify-center flex-col flex-1">
            <label htmlFor="siltFactor">Silt Factor: f</label>
            <input type="text" id="siltFactor" {...register("siltFactor")} />
          </div> */}
        </div>
        {errors.diameter && <p className="text-red-500">{errors.diameter.message}</p>}
        <button className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-cyan-500 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200 dark:focus:ring-cyan-800">
          <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
            Calculate
          </span>
        </button>
      </form>

      {isCalculated && (
        <div className="flex gap-2 justify-center flex-col my-3">
          <p>Velocity: V = {designValues.velocity}m/s</p>
          <p>Hydraulic Mean Radius: R = {designValues.hydraulicMeanRadius}m</p>
          <p>Area: A = {designValues.area}m<sup>2</sup></p>
          <p>Wetted Perimeter: P = {designValues.wettedPerimeter}m</p>
          <p>Bed Slope: S = {designValues.bedSlope} (1 in {Math.floor(1 / designValues.bedSlope / 100) * 100})</p>
        </div>
      )}
    </div>
  )
}
