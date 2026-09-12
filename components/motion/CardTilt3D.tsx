"use client";

import React from "react";
import { use3DTilt } from "./hooks/use-gsap";
import { cn } from "@/lib/utils";

interface CardTilt3DProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  maxTilt?: number;
  perspective?: number;
  className?: string;
}

export function CardTilt3D({
  children,
  maxTilt = 10,
  perspective = 1000,
  className,
  ...props
}: CardTilt3DProps) {
  const ref = use3DTilt<HTMLDivElement>(maxTilt, perspective);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-shadow duration-300 will-change-transform",
        className,
      )}
      style={{ transformStyle: "preserve-3d" }}
      {...props}
    >
      {children}
    </div>
  );
}
