"use client";

import { motion } from "framer-motion";
import { TRUST_METRICS } from "@/lib/chatgpt-data";
import { fadeIn, staggerFast } from "@/lib/motion-config";

const METRIC_COLORS = ["#4f8ef7", "#4f8ef7", "#10a37f", "#10a37f", "#10a37f"];

export function TrustBar() {
  return (
    <section
      id="trust"
      className="border-y px-4 py-10 md:py-12"
      style={{
        borderColor: "rgba(255,255,255,0.08)",
        background: "rgba(10,15,28,0.8)",
        backdropFilter: "blur(12px)",
      }}
    >
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        variants={fadeIn}
        className="mx-auto max-w-6xl"
      >
        <motion.ul
          variants={staggerFast}
          className="grid grid-cols-2 gap-8 md:flex md:items-center md:justify-around"
        >
          {TRUST_METRICS.map((metric, index) => (
            <motion.li
              key={metric.label}
              variants={fadeIn}
              className="flex flex-col items-center gap-1 text-center"
            >
              <span
                className="font-heading text-3xl font-bold md:text-4xl"
                style={{ color: METRIC_COLORS[index] ?? "#4f8ef7" }}
              >
                {metric.value}
              </span>
              <span className="text-sm text-slate-400">{metric.label}</span>
            </motion.li>
          ))}
        </motion.ul>
      </motion.div>
    </section>
  );
}


