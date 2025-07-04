"use client";

import type React from "react";

import type { Session } from "@/auth";
import { AvatarUpload } from "@/components/avatar-upload";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type ProfileFormProps = {
  user: Session["user"];
  avatar?: string;
};

async function updateProfile({ user, avatar }: ProfileFormProps) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar,
  };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const propFirstName = user.name?.split(" ")[0];
  const propLastName = user.name?.split(" ")[1];

  const [formData, setFormData] = useState({
    firstName: propFirstName || "",
    lastName: propLastName || "",
    email: user.email || "",
    avatar: user?.avatar || "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAvatarChange = (avatarUrl: string) => {
    setFormData((prev) => ({
      ...prev,
      avatar: avatarUrl,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateProfile({
        user: {
          id: user.id,
          name: formData.firstName + formData.lastName,
          email: formData.email,
        },
        avatar: formData.avatar,
      });

      toast.success("Profile updated", {
        description: "Your profile has been updated successfully.",
      });

      router.refresh();
    } catch {
      toast.error("Error", {
        description: "Failed to update profile. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const hasChanges =
    formData.firstName !== (propFirstName || "") ||
    formData.lastName !== (propLastName || "") ||
    formData.email !== user.email ||
    formData.avatar !== (user.avatar || "");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>
            Upload a profile picture to personalize your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AvatarUpload
            currentAvatar={formData.avatar}
            onAvatarChange={handleAvatarChange}
            userName={
              `${formData.firstName || ""} ${formData.lastName || ""}`.trim() ||
              user?.email ||
              ""
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Update your personal details and contact information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                  placeholder="Enter your first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter your email address"
              />
            </div>

            <Separator />

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFormData({
                    firstName: propFirstName || "",
                    lastName: propLastName || "",
                    email: user.email || "",
                    avatar: user.avatar || "",
                  });
                }}
                disabled={!hasChanges}
              >
                Reset
              </Button>
              <Button type="submit" disabled={isLoading || !hasChanges}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible and destructive actions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" className="w-full md:w-auto">
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
