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
import Image from "next/image";
import { useContractWrite, usePrepareContractWrite } from "wagmi";
import { Profile_ABI } from "@/utils/abi/Profile_ABI";
import { isNotEmpty, useForm } from "@mantine/form";
import { useToast } from "@/components/ui/use-toast";

type UserSettingsForm = {
  name: string;
  bio: string;
  avatar: string;
  location: string;
  website: string;
  extra: string;
};

export default function UserSettings() {
  const { toast } = useToast();

  const form = useForm<UserSettingsForm>({
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

  const { config } = usePrepareContractWrite({
    address: Profile_ABI.address,
    abi: Profile_ABI.abi,
    functionName: "setProfile",
    args: [form.values],
  });

  const { isLoading, writeAsync } = useContractWrite(config);

  // const read = useContractRead({
  //   address: Profile_ABI.address,
  //   abi: Profile_ABI.abi,
  //   functionName: "profiles",
  //   args: ["0xf17A8d2D5186EFc07165B67F77A8a519a21cdE69"],
  // });

  // console.table({
  //   data,
  //   isLoading,
  //   isSuccess,
  // });

  const handleSubmit = async (values: typeof form.values) => {
    if (!writeAsync) return;

    const txRes = await writeAsync();
    toast({
      description: "Your profile has been updated.",
    });
    // await txRes.wait();
    // await read.refetch();
    // console.log(read.data);
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
          <h1 className="text-4xl font-medium tracking-tight">
            Profile Settings
          </h1>
        </div>
      </div>
      <form
        className="max-w-5xl shadow-lg border mx-auto flex w-full rounded-md my-8"
        onSubmit={form.onSubmit((values) => handleSubmit(values), handleErrors)}
      >
        <div className="flex items-stretch gap-6 justify-start w-full flex-col px-4 sm:px-6 lg:px-8 py-8">
          <div className="w-full">
            <Card>
              <CardHeader>
                <CardTitle>Your name</CardTitle>
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
                <p className="text-sm text-destructive">Name is required. </p>
              </CardFooter>
            </Card>
          </div>
          <div className="w-full">
            <Card>
              <CardHeader>
                <CardTitle>Your Bio</CardTitle>
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
                  <CardTitle>Your Avatar</CardTitle>
                  <CardDescription>This is your avatar.</CardDescription>
                </div>
                <div>
                  <Image
                    width={80}
                    height={80}
                    className="h-20 w-20 rounded-full object-cover border"
                    src="https://images.unsplash.com/photo-1682687982029-edb9aecf5f89?ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80"
                    alt="User name"
                  />
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
                  Uploading avatar will help people see... you.{" "}
                </p>
              </CardFooter>
            </Card>
          </div>
          <div className="w-full">
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
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
                <CardTitle>Website</CardTitle>
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
          <div className="w-full">
            <Card>
              <CardHeader>
                <CardTitle>Extra</CardTitle>
                <CardDescription>
                  Any Extra Information You Want To Share
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="extra" className="sr-only">
                    Avatar
                  </Label>
                  <Textarea
                    id="extra"
                    name="extra"
                    placeholder="Information goes here."
                    {...form.getInputProps("extra")}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">
                  This is a great place to share your interests, hobbies, and
                  passions.
                </p>
              </CardFooter>
            </Card>
          </div>
          <div className="flex items-center justify-end">
            <Button loading={isLoading} type="submit" className="h-full">
              Save
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
