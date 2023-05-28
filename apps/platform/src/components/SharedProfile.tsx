import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { useContractRead } from "wagmi";
import {
  Profile_ABI,
  PROFILE_CONTRACT_ADDRESS,
} from "@/utils/abi/profile-contract";
import { isNotEmpty, matches, useForm } from "@mantine/form";
import { Toast, ToasterToast, useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";
import { SettingsFormValues } from "@/types/forms";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { Terminal } from "lucide-react";
import { getInitials } from "@/utils/shorten-name";
import Image from "next/image";

type Props = {
  title: string;
  type: "user" | "governance";
  address: `0x${string}` | undefined;
  onSubmit: (
    values: SettingsFormValues,
    toast: ({ ...props }: Toast) => {
      id: string;
      dismiss: () => void;
      update: (props: ToasterToast) => void;
    }
  ) => void;
  isTransactionInProgress: boolean;
  isTransactionSuccessful: boolean;
};

export default function SharedProfile({
  title,
  type,
  address,
  isTransactionSuccessful,
  isTransactionInProgress,
  onSubmit,
}: Props) {
  const { toast } = useToast();

  const form = useForm<SettingsFormValues>({
    validateInputOnBlur: true,
    initialValues: {
      name: "",
      bio: "",
      avatar: "",
      location: "",
      website: "",
      extra: "",
    },
    validate: {
      name: isNotEmpty("Name is required"),
      website: matches(
        // https://stackoverflow.com/a/3809435/1143729
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        "Please enter a valid URL"
      ),
    },
  });

  const contractRead = useContractRead({
    address: PROFILE_CONTRACT_ADDRESS,
    abi: Profile_ABI,
    functionName: "profiles",
    args: [address],
  });

  useEffect(() => {
    const userProfileData: string[] = contractRead?.data as string[];
    console.log("userProfileData", userProfileData);
    if (userProfileData) {
      form.setValues({
        name: userProfileData[0],
        bio: userProfileData[1],
        avatar: userProfileData[2],
        location: userProfileData[3],
        website: userProfileData[4],
        extra: userProfileData[5],
      });
      form.resetDirty();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractRead?.data]);

  // Refetching the data after the transaction is successful
  useEffect(() => {
    if (isTransactionSuccessful) {
      toast({
        description: "Your profile has been successfully updated.",
      });
      contractRead.refetch().then((r) => console.log("refetch", r));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTransactionSuccessful]);

  const handleErrors = (errors: typeof form.errors) => {
    for (const key in errors) {
      if (errors[key]) {
        toast({
          title: "Validation error",
          description: errors[key],
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div>
      <div className="border-b flex items-stretch justify-start">
        <div className="flex items-center my-8">
          <h1 className="md:text-4xl text-3xl font-medium tracking-tight">
            {title || "Profile"}
          </h1>
        </div>
      </div>
      <form
        className="max-w-5xl shadow-lg border mx-auto flex w-full rounded-md my-8"
        onSubmit={form.onSubmit(
          (values) => onSubmit(values, toast),
          handleErrors
        )}
      >
        <div className="flex items-stretch gap-6 justify-start w-full flex-col p-6">
          {type === "governance" && (
            <div className="w-full">
              <Alert variant="warning">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Updating governance profile</AlertTitle>
                <AlertDescription>
                  In order to update your governance profile, you will create a
                  proposal with your new profile. This proposal will be voted on
                  by the community.
                </AlertDescription>
              </Alert>
            </div>
          )}
          <div className="w-full">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Your name</CardTitle>
                <CardDescription>
                  Your name is how people will know you on the platform.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="name" className="sr-only">
                    Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Your name"
                    {...form.getInputProps("name")}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-destructive">Name is required.</p>
              </CardFooter>
            </Card>
          </div>
          <div className="w-full">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Your Bio</CardTitle>
                <CardDescription>
                  Help people discover your profile by sharing a short bio.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="bio" className="sr-only">
                    Name
                  </Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    placeholder="I'm a software engineer from San Francisco."
                    {...form.getInputProps("bio")}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">
                  Think of this as your elevator pitch.
                </p>
              </CardFooter>
            </Card>
          </div>
          <div className="w-full">
            <Card>
              <CardHeader className="flex-row justify-between">
                <div>
                  <CardTitle className="text-lg md:text-xl">
                    Your Avatar
                  </CardTitle>
                  <CardDescription>This is your avatar.</CardDescription>
                </div>
                <div>
                  <Avatar className="md:h-20 md:w-20 border">
                    <AvatarImage
                      className="object-top"
                      decoding="async"
                      loading="lazy"
                      title={`Avatar for ${form.values.name}`}
                      src={form.values.avatar || ""}
                    />
                    <AvatarFallback delayMs={300}>
                      <Image
                        src={`https://avatar.vercel.sh/${
                          form.values.name || "no-name"
                        }.svg?text=${encodeURIComponent(
                          getInitials(form.values.name)
                        )}`}
                        alt={`Avatar for ${form.values.name}`}
                        fill
                        sizes="80px"
                        className="select-none pointer-events-none"
                      />
                    </AvatarFallback>
                  </Avatar>
                </div>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="avatar" className="sr-only">
                    Avatar
                  </Label>
                  <Input
                    id="avatar"
                    name="avatar"
                    type="text"
                    autoComplete="url"
                    placeholder="https://..."
                    {...form.getInputProps("avatar")}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">
                  For optimal results, we recommend using a square image that is
                  at least 400px wide.
                </p>
              </CardFooter>
            </Card>
          </div>
          <div className="w-full">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Location</CardTitle>
                <CardDescription>Where in the world are you?</CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="location" className="sr-only">
                    Location
                  </Label>
                  <Input
                    id="location"
                    name="location"
                    type="text"
                    autoComplete="country"
                    placeholder="San Francisco, CA"
                    {...form.getInputProps("location")}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">
                  Let people know where you are from.
                </p>
              </CardFooter>
            </Card>
          </div>
          <div className="w-full">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Website</CardTitle>
                <CardDescription>Your Website URL</CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="website" className="sr-only">
                    Website
                  </Label>
                  <Input
                    id="website"
                    name="website"
                    type="text"
                    autoComplete="url"
                    placeholder="https://mywebsite.com"
                    {...form.getInputProps("website")}
                  />
                  {form.errors.website && (
                    <p className="text-sm mt-1 text-destructive">
                      {form.errors.website}
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">
                  Make sure to include the https://
                </p>
              </CardFooter>
            </Card>
          </div>
          <div className="flex items-center justify-end">
            <Button loading={isTransactionInProgress} type="submit">
              Save
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
