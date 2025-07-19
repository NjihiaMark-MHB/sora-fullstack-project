"use client";

import * as AvatarPrimitive from "@radix-ui/react-avatar";
import * as React from "react";

import { cn } from "@/lib/utils";

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  );
}

interface AvatarImageProps
  extends React.ComponentProps<typeof AvatarPrimitive.Image> {
  src?: string;
  alt?: string;
  className?: string;
}

function AvatarImage({
  className,
  src,
  alt = "Avatar",
  ...props
}: AvatarImageProps) {
  if (!src) {
    return null;
  }

  return (
    <AvatarPrimitive.Image
      src={src}
      alt={alt}
      className={cn("aspect-square object-cover", className)}
      {...props}
    />
  );
}
//ss
function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarFallback, AvatarImage };
