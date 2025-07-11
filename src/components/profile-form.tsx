"use client";

import type { inferredCreateUserSchema } from "@/app-zod-schemas/auth";
import { createUserSchema } from "@/app-zod-schemas/auth";
import type { Session } from "@/auth";
import { AvatarUpload } from "@/components/avatar-upload";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { useTRPC } from "@/utils/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type ProfileFormProps = {
  user: Session["user"];
  avatar?: string;
};

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const propFirstName = user.name?.split(" ")[0];
  const propLastName = user.name?.split(" ")[1];
  const propEmail = user.email;
  const propAvatar = user.avatar || "";
  const trpc = useTRPC();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<inferredCreateUserSchema>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      firstName: propFirstName!,
      lastName: propLastName!,
      email: propEmail!,
    },
  });

  const handleAvatarChange = (avatarUrl: string) => {
    console.info(avatarUrl);
  };

  const { mutate, isPending } = useMutation(
    trpc.user.updateUser.mutationOptions({
      onSuccess: () => {
        toast.success("Profile updated", {
          description: "Your profile has been updated successfully.",
        });
      },
      onError: (error: unknown) => {
        toast.error("Error", {
          description: "Failed to update profile. Please try again.",
        });
        console.error(error);
      },
    })
  );

  const { mutate: deleteUser, isPending: deleteUserPending } = useMutation(
    trpc.user.deleteUser.mutationOptions({
      onSuccess: async () => {
        toast.success("Account deleted", {
          description: "Your account has been deleted successfully.",
        });
        await signOut();
        router.push("/login");
        router.refresh();
      },
      onError: (error: unknown) => {
        toast.error("Error", {
          description: "Failed to delete account. Please try again.",
        });
        console.error(error);
      },
    })
  );

  const onSubmit = (data: inferredCreateUserSchema) => {
    mutate({
      id: user.id,
      data: {
        name: `${data.firstName} ${data.lastName}`.trim(),
        email: data.email,
      },
    });
  };

  const handleDeleteAccount = async () => {
    deleteUser({
      id: user.id,
    });
  };

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
            currentAvatar={propAvatar}
            onAvatarChange={handleAvatarChange}
            userName={`${propFirstName || ""} ${propLastName || ""}`.trim()}
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  {...register("firstName")}
                  aria-invalid={errors.firstName ? "true" : "false"}
                  placeholder="Enter your first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  {...register("lastName")}
                  aria-invalid={errors.lastName ? "true" : "false"}
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                aria-invalid={errors.email ? "true" : "false"}
                placeholder="Enter your email address"
              />
            </div>

            <Separator />

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  reset({
                    firstName: propFirstName!,
                    lastName: propLastName!,
                    email: propEmail!,
                  });
                }}
              >
                Reset
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save Changes"}
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
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full md:w-auto">
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription className="space-y-2">
                  This action cannot be undone. This will permanently delete
                  your account and remove all your data from our servers
                  <br />
                  <span className="font-medium">
                    All your files, folders, and personal information will be
                    permanently lost.
                  </span>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                  onClick={handleDeleteAccount}
                  disabled={deleteUserPending}
                >
                  {deleteUserPending ? "Deleting..." : "Yes, delete my account"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
