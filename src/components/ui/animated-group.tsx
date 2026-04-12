'use client'

import { motion, Variants, HTMLMotionProps } from 'framer-motion'
import React from 'react'

interface AnimatedGroupProps extends Omit<HTMLMotionProps<'div'>, 'variants'> {
  children: React.ReactNode
  className?: string
  variants?: {
    container?: Variants
    item?: Variants
  }
  as?: keyof React.JSX.IntrinsicElements
}

const defaultContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const defaultItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
}

export function AnimatedGroup({
  children,
  className,
  variants,
  ...props
}: AnimatedGroupProps) {
  const containerVariants = variants?.container ?? defaultContainerVariants
  const itemVariants = variants?.item ?? defaultItemVariants

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={className}
      {...props}
    >
      {React.Children.map(children, (child) =>
        child ? (
          <motion.div variants={itemVariants}>{child}</motion.div>
        ) : null
      )}
    </motion.div>
  )
}
