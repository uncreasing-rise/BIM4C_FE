"use client";

import React from "react";
import { useMagnetic } from "./hooks/use-gsap";
import { cn } from "@/lib/utils";

interface MagneticButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}

export function MagneticButton({
  children,
  strength = 0.25,
  className,
  ...props
}: MagneticButtonProps) {
  const ref = useMagnetic<HTMLDivElement>(strength);

  return (
    <div
      ref={ref}
      className={cn("inline-block will-change-transform", className)}
      {...props}
    >
      {children}
    </div>
  );
}
