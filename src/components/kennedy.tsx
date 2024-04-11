"use client"
import { kutterVelocity, roundTo } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react'
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Label } from './ui/label';
import { Input } from './ui/input';

const formSchema = z.object({
    discharge: z.string().refine((value) => !isNaN(parseFloat(value)), { message: "Enter a valid number" }).refine(value => (+value) > 0, { message: "Enter a positive number", }),
    criticalVelocityRatio: z.string().refine((value) => !isNaN(parseFloat(value)), { message: "Enter a valid number" }).refine(value => (+value) > 0, { message: "Enter a positive number", }),
    Slope: z.string().refine((value) => !isNaN(parseFloat(value)), { message: "Enter a valid number" }).refine(value => (+value) > 0, { message: "Enter a positive number", }),
    roughness: z.string().refine((value) => !isNaN(parseFloat(value)), { message: "Enter a valid number" }).refine(value => (+value) > 0, { message: "Enter a positive number", }),
})


export default function Kennedy() {

    const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            discharge: "51",
            criticalVelocityRatio: "1.1",
            Slope: "4000",
            roughness: "0.023",
        }
    })

    const [trialY, setTrialY] = React.useState<number[]>([]);

    const calculate = ({ m = 1, y, Q, S, n }: { m: number, y: number, Q: number, S: number, n: number }) => {
        const m1 = 1;
        const V0 = roundTo(0.546 * m * (y ** 0.64), 3);
        const A = roundTo(Q / V0);
        const B = roundTo(A / y - m1 * y);
        const P = roundTo(B + 2 * y * Math.sqrt(1 + m1 ** 2));
        const R = roundTo(A / P);
        const V = roundTo(kutterVelocity({ n, S, R }), 3);
        const m_r = roundTo(V / V0, 1);

        // console.table({ m, y, Q, S, n, m_r, V0, A, B, P, R, V })

        const diff = +Math.abs(V - V0).toFixed(3);
        if (diff <= 0.018) {
            console.table({ Q, S: '1 in '+1/S, m, n, y: roundTo(y), V0, A, B, P, R, V })
        }
        // if (m_r === m) {
        //     console.log({ V, V0, y })
        // }
        else {
            const d = 0.01
            let n_y = y - d;
            if (V > V0) {
                n_y = y + d;
            }
            trialY.push(n_y);
            setTrialY(trialY);
            calculate({ m, y: n_y, Q, S, n })
        }
    }

    const onSubmit = (data: z.infer<typeof formSchema>) => {
        const { discharge, criticalVelocityRatio, Slope, roughness } = data;
        const Q = +discharge;
        const S = 1 / (+Slope);
        const n = +roughness;
        const m = +criticalVelocityRatio;

        calculate({ m, y: 2, Q, S, n })

    }


    return (
        <div className="container max-w-lg p-5">
            <form action="" className="space-y-3" onSubmit={handleSubmit(onSubmit)}>

                <div className="grid w-full max-w-sm items-center gap-2">
                    <Label htmlFor="discharge">Discharge: Q (cumec)</Label>
                    <Input type="text" id="discharge" {...register("discharge")} />
                </div>

                <div className="grid w-full max-w-sm items-center gap-2">
                    <Label htmlFor="bedSlope">Slope: S</Label>
                    <Input type="text" id="bedSlope" {...register("Slope")} />
                </div>

                <div className="grid w-full max-w-sm items-center gap-2">
                    <Label htmlFor="cvr">CVR: m</Label>
                    <Input type="text" id="cvr" {...register("criticalVelocityRatio")} />
                </div>

                <div className="grid w-full max-w-sm items-center gap-2">
                    <Label htmlFor="roughness">Roughness: n</Label>
                    <Input type="text" id="roughness" {...register("roughness")} />
                </div>


                <button className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-cyan-500 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200 dark:focus:ring-cyan-800">
                    <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                        Calculate
                    </span>
                </button>
            </form>
        </div>
    )
}
