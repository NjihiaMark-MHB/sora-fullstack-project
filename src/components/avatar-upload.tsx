"use client";

import type React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface AvatarUploadProps {
  currentAvatar?: string;
  onAvatarChange: (avatarUrl: string) => void;
  userName: string;
}

export function AvatarUpload({
  currentAvatar,
  onAvatarChange,
  userName,
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatar!);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
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

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewUrl(result);
    };
    reader.readAsDataURL(file);

    // Simulate upload
    setIsUploading(true);
    setTimeout(() => {
      const mockUrl = URL.createObjectURL(file);
      onAvatarChange(mockUrl);
      setIsUploading(false);
      toast.success("Avatar updated", {
        description: "Your profile picture has been updated successfully.",
      });
    }, 1500);
  };

  const handleRemoveAvatar = () => {
    setPreviewUrl(null);
    onAvatarChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.success("Avatar removed", {
      description: "Your profile picture has been removed.",
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
            disabled={isUploading}
            className="gap-2"
          >
            {isUploading ? (
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
