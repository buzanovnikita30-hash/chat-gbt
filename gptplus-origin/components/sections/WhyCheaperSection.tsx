"use client";

import { motion } from "framer-motion";
import { WHY_CHEAPER_POINTS } from "@/lib/chatgpt-data";
import { fadeUp, staggerContainer } from "@/lib/motion-config";

export function WhyCheaperSection() {
  return (
    <section id="why-cheaper" className="px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          className="mb-14 flex flex-col items-center gap-3 text-center"
        >
          <span className="inline-flex items-center rounded-full border border-[#10a37f]/20 bg-[#10a37f]/8 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#10a37f]">
            Честно о цене
          </span>
          <h2 className="font-heading text-3xl font-bold text-gray-900 md:text-4xl">
            Почему цена ниже официальной?
          </h2>
          <p className="max-w-2xl text-lg text-gray-500">
            Честный ответ — без уловок и скрытых условий.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="space-y-4"
        >
          {WHY_CHEAPER_POINTS.map((point, index) => (
            <motion.div
              key={index}
              variants={fadeUp}
              className="flex gap-4 rounded-xl border border-black/[0.07] bg-gray-50 p-4 md:p-5"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#10a37f]/10 text-xs font-semibold text-[#10a37f]">
                {index + 1}
              </span>
              <p className="text-sm leading-relaxed text-gray-600 md:text-base">{point}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          className="mt-6 text-center text-sm text-gray-400"
        >
          Полноценная официальная подписка · Те же возможности · Оплата в рублях
        </motion.p>
      </div>
    </section>
  );
}


