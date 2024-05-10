"use client"
import Lacy from "@/components/Lacy";
import Kennedy from "@/components/kennedy";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";


export default function Home() {
  // const searchParams = useSearchParams();
  const [method, setMethod] = useState("lacy");

  // useEffect(() => {
  //   setMethod(searchParams?.get("method") || "lacy");
  // }, [searchParams])

  const CButton = ({ children, method: m }: { children: React.ReactNode, method: string }) => {
    return (
      <Button
        variant={method === m ? "outline" : "ghost"}
        className={`transition-none border-0 h-8 hover:bg-${method === m ? "background" : "transparent"} hover:text-${method === m ? "foreground" : "primary"} text-${method === m ? "primary" : "foreground"}`}
        onClick={() => setMethod(m)}
      >{children}</Button>
    )
  }



  return (
    <main className="flex flex-col items-center justify-between" id="main">
      <div className="h-10 inline-flex items-center justify-center rounded-md bg-muted p-1 text-muted-foreground my-3">
        <CButton method="lacy">Lacey&apos;s Theory</CButton>
        <CButton method="kennedy">Kennedy&apos;s Theory</CButton>
      </div>
      <AnimatePresence>
        <div className="container max-w-md p-5">
          {method === "lacy" && <motion.div
            className="flex-1"
            key="lacyt"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <Lacy key="lacyt" />
          </motion.div>}

          {method === "kennedy" && <motion.div
            className="flex-1"
            key="kennedyt"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <Kennedy key="kennedyt" />
          </motion.div>}
        </div>
      </AnimatePresence>
      {/* <Lacy/> */}
      {/* <Kennedy /> */}

    </main>
  );
}
