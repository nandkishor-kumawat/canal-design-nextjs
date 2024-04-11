"use client"

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

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
    siltFactor:0,
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

    let f = 1.76 * Math.sqrt(+d)
    setValue("siltFactor", f);

    const V = (Q * (f ** 2) / 140) ** (1 / 6);
    setValue("velocity", V);

    const R = 2.5 * (V ** 2) / f;
    setValue("hydraulicMeanRadius", R);

    const A = Q / V;
    setValue("area", A);

    const P = 4.75 * Math.sqrt(Q);
    setValue("wettedPerimeter", P);

    const S = (f ** (5 / 3)) / (3340 * (Q ** (1 / 6)));
    setValue("bedSlope", S);

    setIsCalculated(true)
  }


  return (
    <div className="container max-w-lg p-5">
      <form action="" className="space-y-3" onSubmit={handleSubmit(onSubmit)}>

        <div className="grid w-full max-w-sm items-center gap-2">
          <Label htmlFor="discharge">Discharge: Q (cumec)</Label>
          <Input type="text" id="discharge" {...register("discharge")} />
        </div>

        {errors.discharge && <p className="text-red-500">{errors.discharge.message}</p>}

        <div className="flex gap-2">
          <div className="grid w-full max-w-sm items-center gap-2">
            <Label htmlFor="diameter">Diameter: d (mm)</Label>
            <Input type="text" id="diameter" {...register("diameter")} />
          </div>

          {/* <div className="flex items-center mx-3 border-r border-r-gray-300 relative">
            <p className="bg-white text-gray-400 absolute -left-3">OR</p>
          </div>
          <div className="flex gap-2 justify-center flex-col flex-1">
            <Label htmlFor="siltFactor">Silt Factor: f</Label>
            <Input type="text" id="siltFactor" {...register("siltFactor")} />
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
          <p>Silt Factor: f = {designValues.siltFactor.toFixed(2)}</p>
          <p>Velocity: V = {designValues.velocity.toFixed(2)}m/s</p>
          <p>Hydraulic Mean Radius: R = {designValues.hydraulicMeanRadius.toFixed(2)}m</p>
          <p>Area: A = {designValues.area.toFixed(2)}m<sup>2</sup></p>
          <p>Wetted Perimeter: P = {designValues.wettedPerimeter.toFixed(2)}m</p>
          <p>Bed Slope: S = {designValues.bedSlope.toFixed(5)} (1 in {Math.floor(1 / designValues.bedSlope / 100) * 100})</p>
        </div>
      )}
    </div>
  )
}
