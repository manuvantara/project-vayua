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
import {
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { Profile_ABI } from "@/utils/abi/Profile_ABI";
import { isNotEmpty, useForm } from "@mantine/form";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";
import { getShortName } from "@/utils/shorten-name";

// -------------
// For the future
// -------------
/*type Props = {
  type: "user" | "governance";
};

type SharedFormValues = {
  name: string;
  bio: string;
  avatar: string;
  location: string;
  website: string;
  extra: string;
};*/

// -------------

// For demo profile use that address: 0xf17A8d2D5186EFc07165B67F77A8a519a21cdE69

// -------------

type UserSettingsFormValues = {
  name: string;
  bio: string;
  avatar: string;
  location: string;
  website: string;
  extra: string;
};

export default function UserSettings() {
  const { toast } = useToast();
  const { address } = useAccount();

  const form = useForm<UserSettingsFormValues>({
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
    },
  });

  const contractRead = useContractRead({
    address: Profile_ABI.address,
    abi: Profile_ABI.abi,
    functionName: "profiles",
    args: [address],
  });

  useEffect(() => {
    const userProfileData: string[] = contractRead?.data as string[];
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

  const { config } = usePrepareContractWrite({
    address: Profile_ABI.address,
    abi: Profile_ABI.abi,
    functionName: "setProfile",
    args: [form.values],
  });

  const { data, write, isLoading: isWriteLoading } = useContractWrite(config);

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  useEffect(() => {
    if (isSuccess) {
      toast({
        description: "Your profile has been successfully updated.",
      });
      contractRead.refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);

  const handleSubmit = async (values: typeof form.values) => {
    if (!write) {
      toast({
        title: "We couldn't save your profile.",
        description: "Please try again.",
        variant: "destructive",
      });
      return;
    }

    write();
  };

  const handleErrors = (errors: typeof form.errors) => {
    if (errors.name) {
      toast({
        title: "There was an error validating your form.",
        description: "Name is required.",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <div className="border-b flex items-stretch justify-start">
        <div className="flex items-center my-8">
          <h1 className="md:text-4xl text-3xl font-medium tracking-tight">
            Profile Settings
          </h1>
        </div>
      </div>
      <form
        className="max-w-5xl shadow-lg border mx-auto flex w-full rounded-md my-8"
        onSubmit={form.onSubmit((values) => handleSubmit(values), handleErrors)}
      >
        <div className="flex items-stretch gap-6 justify-start w-full flex-col p-6">
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
                      {getShortName(form.values.name)}
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
            <Button loading={isLoading || isWriteLoading} type="submit">
              Save
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
