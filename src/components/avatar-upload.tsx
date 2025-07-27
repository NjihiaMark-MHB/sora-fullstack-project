"use client";

import type React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/utils/trpc";
import { useMutation } from "@tanstack/react-query";
import { Camera, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface AvatarUploadProps {
  currentAvatar?: string;
  onAvatarChange: (avatarUrl: string) => void;
  userName: string;
  userId: string;
}

export function AvatarUpload({
  currentAvatar,
  onAvatarChange,
  userName,
  userId,
}: AvatarUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatar!);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const trpc = useTRPC();

  const { mutate, isPending } = useMutation(
    trpc.user.uploadAvatar.mutationOptions({
      onSuccess: () => {
        toast.success("Avatar updated", {
          description: "Your profile picture has been updated successfully.",
        });
        // Refresh the page to show updated avatar
        window.location.reload();
      },
      onError: (error: unknown) => {
        toast.error("Error", {
          description: "Failed to update profile picture. Please try again.",
        });
        console.error(error);
      },
    })
  );

  const { mutate: deleteMutate, isPending: isDeleting } = useMutation(
    trpc.user.deleteAvatar.mutationOptions({
      onSuccess: () => {
        toast.success("Avatar deleted", {
          description: "Your profile picture has been deleted successfully.",
        });
        // Refresh the page to show updated avatar
        window.location.reload();
      },
      onError: (error: unknown) => {
        toast.error("Error", {
          description: "Failed to delete profile picture. Please try again.",
        });
        console.error(error);
      },
    })
  );

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setPreviewUrl(base64);
        resolve(base64.split(",")[1]); // Remove data:image/jpeg;base64, prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Invalid file type", {
        description: "Please select an image file.",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large", {
        description: "Please select an image smaller than 5MB.",
      });
      return;
    }

    const fileData = await fileToBase64(file);

    mutate({
      userId: userId,
      fileName: file.name,
      fileData: fileData,
      contentType: file.type,
    });
  };

  const handleRemoveAvatar = () => {
    if (!currentAvatar) {
      // If no current avatar, just clear the preview
      setPreviewUrl(null);
      onAvatarChange("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      toast.success("Avatar removed", {
        description: "Your profile picture has been removed.",
      });
      return;
    }

    // If there's a current avatar, delete it from the server
    deleteMutate({
      userId: userId,
      avatarUrl: currentAvatar,
    });
  };

  return (
    <div className="flex items-center gap-6">
      <div className="relative">
        <Avatar className="h-24 w-24">
          <AvatarImage src={previewUrl || "/placeholder.svg"} alt={userName} />
          <AvatarFallback className="text-lg">
            {getInitials(userName)}
          </AvatarFallback>
        </Avatar>

        {previewUrl && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
            onClick={handleRemoveAvatar}
            disabled={isDeleting}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isPending}
            className="gap-2"
          >
            {isPending ? (
              <>
                <Upload className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Camera className="h-4 w-4" />
                {previewUrl ? "Change" : "Upload"}
              </>
            )}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          JPG, PNG or GIF. Max size 5MB.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
}
