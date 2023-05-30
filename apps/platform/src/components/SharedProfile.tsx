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
  PROFILE_ABI,
  PROFILE_CONTRACT_ADDRESS,
} from "@/utils/abi/profile-contract";
import { isNotEmpty, matches, useForm } from "@mantine/form";
import { Toast, ToasterToast, useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";
import { SettingsFormValues } from "@/types/forms";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { AlertCircleIcon } from "lucide-react";
import { getInitials } from "@/utils/shorten-name";
import Image from "next/image";
import Web3Button from "@/components/Web3Button";

type Props = {
  title: string;
  type: "user" | "dao";
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

const PROFILE_TEXT = {
  user: {
    cardName: "Your name",
    cardNameDescription:
      "Your name is how people will know you on the platform.",
    cardNameLabel: "Name",
    cardNamePlaceholder: "John Doe",
    cardNameFooter: "Name is required.",
    cardBio: "Your Bio",
    cardBioDescription:
      "Help people discover your profile by sharing a short bio.",
    cardBioLabel: "Bio",
    cardBioPlaceholder: "I'm a software engineer from San Francisco.",
    cardBioFooter: "Think of this as your elevator pitch.",
    cardAvatar: "Your Avatar",
    cardAvatarDescription: "Upload a photo of yourself.",
    cardAvatarLabel: "Avatar",
    cardAvatarPlaceholder: "https://...",
    cardAvatarFooter:
      "For optimal results, we recommend using a square image that is at least 400px wide.",
    cardLocation: "Your Location",
    cardLocationDescription: "Where in the world are you?",
    cardLocationLabel: "Location",
    cardLocationPlaceholder: "San Francisco, CA",
    cardLocationFooter:
      "City, State, Country, whatever you are comfortable with.",
    cardWebsite: "Your Website URL",
    cardWebsiteDescription: "Do you have a website? Share it here.",
    cardWebsiteLabel: "Website",
    cardWebsitePlaceholder: "https://mywebsite.com",
    cardWebsiteFooter:
      "This could be a personal website, blog, or LinkedIn profile.",
  },
  dao: {
    cardName: "Your DAO's name",
    cardNameDescription: "What your DAO should be called.",
    cardNameLabel: "Name",
    cardNamePlaceholder: "Vayua",
    cardNameFooter: "Name is required.",
    cardBio: "Your DAO's Bio",
    cardBioDescription: "Help people discover your DAO by sharing a short bio.",
    cardBioLabel: "Bio",
    cardBioPlaceholder:
      "We are a DAO that is focused on building a better future.",
    cardBioFooter: "Think of this as your elevator pitch.",
    cardAvatar: "Your DAO's Avatar",
    cardAvatarDescription: "Upload a photo of your DAO.",
    cardAvatarLabel: "Avatar",
    cardAvatarPlaceholder: "https://...",
    cardAvatarFooter:
      "For optimal results, we recommend using a square image that is at least 400px wide.",
    cardLocation: "Your DAO's Location",
    cardLocationDescription: "Where in the world is your DAO?",
    cardLocationLabel: "Location",
    cardLocationPlaceholder: "Worldwide",
    cardLocationFooter:
      "City, State, Country, whatever you are comfortable with.",
    cardWebsite: "Your DAO's Website URL",
    cardWebsiteDescription: "Do you have a website? Share it here.",
    cardWebsiteLabel: "Website",
    cardWebsitePlaceholder: "https://mywebsite.com",
    cardWebsiteFooter:
      "For example, this could be a website, blog, or Twitter profile.",
  },
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
    abi: PROFILE_ABI,
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
      contractRead.refetch();
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
      {type === "dao" && (
        <div className="w-full mt-4">
          <Alert variant="warning">
            <AlertCircleIcon className="w-4 h-4" />
            <AlertTitle>Updating governance profile</AlertTitle>
            <AlertDescription>
              In order to update your governance profile, you will create a
              proposal with your new profile. This proposal will be voted on by
              the community.
            </AlertDescription>
          </Alert>
        </div>
      )}
      <form
        className="max-w-5xl shadow-lg border mx-auto flex w-full rounded-md my-8"
        onSubmit={form.onSubmit(
          (values) => onSubmit(values, toast),
          handleErrors
        )}
      >
        <div className="flex items-stretch gap-6 justify-start w-full flex-col p-6">
          <div className="w-full">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">
                  {PROFILE_TEXT[type].cardName}
                </CardTitle>
                <CardDescription>
                  {PROFILE_TEXT[type].cardNameDescription}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <Label
                    htmlFor={PROFILE_TEXT[type].cardNameLabel.toLowerCase()}
                    className="sr-only"
                  >
                    {PROFILE_TEXT[type].cardNameLabel}
                  </Label>
                  <Input
                    id={PROFILE_TEXT[type].cardNameLabel.toLowerCase()}
                    name={PROFILE_TEXT[type].cardNameLabel.toLowerCase()}
                    type="text"
                    autoComplete="name"
                    placeholder={PROFILE_TEXT[type].cardNamePlaceholder}
                    {...form.getInputProps("name")}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-destructive">
                  {PROFILE_TEXT[type].cardNameFooter}
                </p>
              </CardFooter>
            </Card>
          </div>
          <div className="w-full">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">
                  {PROFILE_TEXT[type].cardBio}
                </CardTitle>
                <CardDescription>
                  {PROFILE_TEXT[type].cardBioDescription}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <Label
                    htmlFor={PROFILE_TEXT[type].cardBioLabel.toLowerCase()}
                    className="sr-only"
                  >
                    {PROFILE_TEXT[type].cardBioLabel}
                  </Label>
                  <Textarea
                    id={PROFILE_TEXT[type].cardBioLabel.toLowerCase()}
                    name={PROFILE_TEXT[type].cardBioLabel.toLowerCase()}
                    placeholder={PROFILE_TEXT[type].cardBioPlaceholder}
                    {...form.getInputProps("bio")}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">
                  {PROFILE_TEXT[type].cardBioFooter}
                </p>
              </CardFooter>
            </Card>
          </div>
          <div className="w-full">
            <Card>
              <CardHeader className="flex-row justify-between">
                <div>
                  <CardTitle className="text-lg md:text-xl">
                    {PROFILE_TEXT[type].cardAvatar}
                  </CardTitle>
                  <CardDescription>
                    {PROFILE_TEXT[type].cardAvatarDescription}
                  </CardDescription>
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
                  <Label
                    htmlFor={PROFILE_TEXT[type].cardAvatarLabel.toLowerCase()}
                    className="sr-only"
                  >
                    {PROFILE_TEXT[type].cardAvatarLabel}
                  </Label>
                  <Input
                    id={PROFILE_TEXT[type].cardAvatarLabel.toLowerCase()}
                    name={PROFILE_TEXT[type].cardAvatarLabel.toLowerCase()}
                    type="text"
                    autoComplete="url"
                    placeholder={PROFILE_TEXT[type].cardAvatarPlaceholder}
                    {...form.getInputProps("avatar")}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">
                  {PROFILE_TEXT[type].cardAvatarFooter}
                </p>
              </CardFooter>
            </Card>
          </div>
          <div className="w-full">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">
                  {PROFILE_TEXT[type].cardLocation}
                </CardTitle>
                <CardDescription>
                  {PROFILE_TEXT[type].cardLocationDescription}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <Label
                    htmlFor={PROFILE_TEXT[type].cardLocationLabel.toLowerCase()}
                    className="sr-only"
                  >
                    {PROFILE_TEXT[type].cardLocationLabel}
                  </Label>
                  <Input
                    id={PROFILE_TEXT[type].cardLocationLabel.toLowerCase()}
                    name={PROFILE_TEXT[type].cardLocationLabel.toLowerCase()}
                    type="text"
                    autoComplete="country"
                    placeholder={PROFILE_TEXT[type].cardLocationPlaceholder}
                    {...form.getInputProps("location")}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">
                  {PROFILE_TEXT[type].cardLocationFooter}
                </p>
              </CardFooter>
            </Card>
          </div>
          <div className="w-full">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">
                  {PROFILE_TEXT[type].cardWebsite}
                </CardTitle>
                <CardDescription>
                  {PROFILE_TEXT[type].cardWebsiteDescription}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <Label
                    htmlFor={PROFILE_TEXT[type].cardWebsiteLabel.toLowerCase()}
                    className="sr-only"
                  >
                    {PROFILE_TEXT[type].cardWebsiteLabel}
                  </Label>
                  <Input
                    id={PROFILE_TEXT[type].cardWebsiteLabel.toLowerCase()}
                    name={PROFILE_TEXT[type].cardWebsiteLabel.toLowerCase()}
                    type="text"
                    autoComplete="url"
                    placeholder={PROFILE_TEXT[type].cardWebsitePlaceholder}
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
                  {PROFILE_TEXT[type].cardWebsiteFooter}
                </p>
              </CardFooter>
            </Card>
          </div>
          <div className="flex items-center justify-end">
            <Web3Button loading={isTransactionInProgress} type="submit">
              Save
            </Web3Button>
          </div>
        </div>
      </form>
    </div>
  );
}
