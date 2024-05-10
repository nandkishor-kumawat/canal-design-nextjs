"use client"
import { getTrialDepth, kutterVelocity, roundTo } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react'
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Label } from './ui/label';
import { NumberInput } from './ui/input';
import { AnimatePresence, motion } from 'framer-motion';

const formSchema = z.object({
    discharge: z.number({ invalid_type_error: "Enter discharge" }).positive(),
    criticalVelocityRatio: z.number({ invalid_type_error: "Enter critical velocity ratio" }).positive().max(1.5),
    Slope: z.number({ invalid_type_error: "Enter slope" }).positive().min(2000).max(5000),
    rugosity: z.number({ invalid_type_error: "Enter rugosity" }).positive(),
    bedSlopeH: z.number({ invalid_type_error: "Enter bed slope H" }).positive().max(2.5),
    bedSlopeV: z.number({ invalid_type_error: "Enter bed slope V" }).positive().max(2.5),
})

export const ErrorP = ({ children }: { children: React.ReactNode }) => {
    return <p className="text-yellow-400 text-sm">{children}</p>
}

export default function Kennedy() {

    const { register, handleSubmit, formState: { errors }, getValues } = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            discharge: 51,
            criticalVelocityRatio: 1.1,
            Slope: 4000,
            rugosity: 0.023,
            bedSlopeH: 1,
            bedSlopeV: 1,
        }
    })

    const [trialY, setTrialY] = React.useState<number[]>([]);
    const [isCalculated, setIsCalculated] = React.useState(false);
    const [designValues, setDesignValues] = React.useState({
        Q: 0,
        S: '',
        m: 0,
        n: 0,
        y: 0,
        V0: 0,
        A: 0,
        B: 0,
        P: 0,
        R: 0,
        V: 0,
    })

    const calculate = ({ m = 1, y, Q, S, n }: { m: number, y: number, Q: number, S: number, n: number }): typeof designValues => {
        const m1 = getValues('bedSlopeH') / getValues('bedSlopeV');
        const V0 = roundTo(0.55 * m * (y ** 0.64), 3);
        const A = roundTo(Q / V0);
        const B = roundTo(A / y - m1 * y);
        const P = roundTo(B + 2 * y * Math.sqrt(1 + m1 ** 2));
        const R = roundTo(A / P);
        const V = roundTo(kutterVelocity({ n, S, R }), 3);
        const m_r = roundTo(V / V0, 2);

        const diff = +Math.abs(V - V0).toFixed(3);
        const result = { Q, S: '1 in ' + 1 / S, m, n, y: roundTo(y), V0, A, B, P, R, V };
        console.table(result)
        // if (m_r === 1) return result;
        if (diff <= 0.018) return result;
        else {
            const d = 0.01
            let n_y = y - d;
            if (n_y < 0) return result;
            if (V > V0) {
                n_y = y + d;
            }
            trialY.push(n_y);
            setTrialY(trialY);
            return calculate({ m, y: n_y, Q, S, n })
        }
    }

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        const { discharge, criticalVelocityRatio, Slope, rugosity } = data;
        const Q = +discharge;
        const S = 1 / (+Slope);
        const n = +rugosity;
        const m = +criticalVelocityRatio;

        setIsCalculated(false);
        await new Promise(resolve => setTimeout(resolve, 0));
        let y = getTrialDepth(Q);
        const result = calculate({ m, y, Q, S, n })
        console.table(result)
        setDesignValues(result);
        setIsCalculated(true);
    }


    return (
        <div className="w-full max-w-md" id="kennedy">
            <h1 className='text-2xl mb-3 text-green-500'>Kennedy&apos;s Theory</h1>
            <form action="" className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
                <div className="flex gap-2 justify-between items-center">
                    <Label className='' htmlFor="discharge">Discharge: Q (cumec)</Label>
                    <NumberInput id="discharge" {...register("discharge", { valueAsNumber: true })} maxLength={5} />
                </div>
                {errors.discharge && <ErrorP>{errors.discharge.message}</ErrorP>}
                <div className="flex gap-2 justify-between items-center">
                    <Label className='' htmlFor="bedSlope">Slope: S (1 in )</Label>
                    <NumberInput id="bedSlope" {...register("Slope", { valueAsNumber: true })} maxLength={4} />
                </div>
                {errors.Slope && <ErrorP>{errors.Slope.message}</ErrorP>}
                <div className="flex gap-2 justify-between items-center">
                    <Label className='' htmlFor="cvr">CVR: m</Label>
                    <NumberInput id="cvr" {...register("criticalVelocityRatio", { valueAsNumber: true })} maxLength={3} />
                </div>
                {errors.criticalVelocityRatio && <ErrorP>{errors.criticalVelocityRatio.message}</ErrorP>}
                <div className="flex gap-2 justify-between items-center">
                    <Label className='' htmlFor="rugosity">Rugosity: n</Label>
                    <NumberInput id="rugosity" {...register("rugosity", { valueAsNumber: true })} maxLength={6} />
                </div>
                {errors.rugosity && <ErrorP>{errors.rugosity.message}</ErrorP>}

                <div className="flex gap-2 justify-between items-center">
                    <Label htmlFor="bedSlope">Side Slope: m (H:V)</Label>
                    <div className="flex items-center relative z-10 bg-slate-800 after:border-b-2 border-b-[rgb(122 136 164)] after:w-full after:bottom-0 after:z-[-1] after:absolute">
                        <NumberInput id="bedSlopeH" {...register("bedSlopeH", { valueAsNumber: true })} placeholder="H" className="w-10" maxLength={3} />:
                        <NumberInput id="bedSlopeV" {...register("bedSlopeV", { valueAsNumber: true })} placeholder="V" className="w-10" maxLength={3} />
                    </div>
                </div>
                {errors.bedSlopeH && <ErrorP>{errors.bedSlopeH.message}</ErrorP>}
                {errors.bedSlopeV && <ErrorP>{errors.bedSlopeV.message}</ErrorP>}

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
                    <div key={'kennedy'} className="flex gap-2 justify-center flex-col my-3 lacy-result">

                        <motion.h2
                            initial={{ scale: 0, x: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className='text-2xl text-green-500 w-fit'>Result:</motion.h2>

                        <motion.p
                            initial={{ x: -1000 }}
                            animate={{ x: 0 }}
                            transition={{ delay: 0 }}
                            exit={{ x: 1000 }}
                        >
                            Depth: y = {designValues.y}m
                        </motion.p>
                        <motion.p
                            initial={{ x: 1000 }}
                            animate={{ x: 0 }}
                            transition={{ delay: 0 }}
                            exit={{ x: -1000 }}
                        >
                            Critical Velocity: V<sub>0</sub> = {designValues.V0}m/s
                        </motion.p>
                        <motion.p
                            initial={{ x: -1000 }}
                            animate={{ x: 0 }}
                            transition={{ delay: 0.05 }}
                            exit={{ x: 1000 }}
                        >
                            Area: A = {designValues.A}m<sup>2</sup>
                        </motion.p>
                        <motion.p
                            initial={{ x: 1000 }}
                            animate={{ x: 0 }}
                            transition={{ delay: 0.05 }}
                            exit={{ x: -1000 }}
                        >
                            Width: B = {designValues.B}m
                        </motion.p>
                        <motion.p
                            initial={{ x: -1000 }}
                            animate={{ x: 0 }}
                            transition={{ delay: 0.1 }}
                            exit={{ x: 1000 }}
                        >
                            Wetted Perimeter: P = {designValues.P}m
                        </motion.p>

                        <motion.p
                            initial={{ x: 1000 }}
                            animate={{ x: 0 }}
                            transition={{ delay: 0.1 }}
                            exit={{ x: -1000 }}
                        >
                            Hydraulic Mean Radius: R = {designValues.R}m
                        </motion.p>

                        <motion.p
                            initial={{ x: -1000 }}
                            animate={{ x: 0 }}
                            transition={{ delay: 0.15 }}
                            exit={{ x: 1000 }}
                        >
                            Velocity: V = {designValues.V}m/s
                        </motion.p>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
