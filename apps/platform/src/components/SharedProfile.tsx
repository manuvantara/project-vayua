import type { SettingsFormValues } from '@/types/forms';

import Web3Button from '@/components/Web3Button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/hooks/use-toast';
import { VRC1_CONTRACT_ABI, VRC1_CONTRACT_ADDRESS } from '@/utils/VRC1';
import { getInitials } from '@/utils/helpers/common.helper';
import { URL_REGEX } from '@/utils/regexes';
import { isNotEmpty, useForm } from '@mantine/form';
import { AlertCircleIcon } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useContractRead } from 'wagmi';

type Props = {
  address: `0x${string}` | undefined;
  isTransactionInProgress: boolean;
  isTransactionSuccessful: boolean;
  onSubmit: (values: SettingsFormValues) => void;
  title: string;
  type: 'dao' | 'user';
};

const PROFILE_TEXT = {
  dao: {
    cardAvatar: "Your DAO's Avatar",
    cardAvatarDescription: 'Upload a photo of your DAO.',
    cardAvatarFooter:
      'For optimal results, we recommend using a square image that is at least 400px wide.',
    cardAvatarLabel: 'Avatar',
    cardAvatarPlaceholder: 'https://...',
    cardBio: "Your DAO's Bio",
    cardBioDescription: 'Help people discover your DAO by sharing a short bio.',
    cardBioFooter: 'Think of this as your elevator pitch.',
    cardBioLabel: 'Bio',
    cardBioPlaceholder:
      'We are a DAO that is focused on building a better future.',
    cardLocation: "Your DAO's Location",
    cardLocationDescription: 'Where in the world is your DAO?',
    cardLocationFooter:
      'City, State, Country, whatever you are comfortable with.',
    cardLocationLabel: 'Location',
    cardLocationPlaceholder: 'Worldwide',
    cardName: "Your DAO's name",
    cardNameDescription: 'What your DAO should be called.',
    cardNameFooter: 'Name is required.',
    cardNameLabel: 'Name',
    cardNamePlaceholder: 'Vayua',
    cardWebsite: "Your DAO's Website URL",
    cardWebsiteDescription: 'Do you have a website? Share it here.',
    cardWebsiteFooter:
      'For example, this could be a website, blog, or Twitter profile.',
    cardWebsiteLabel: 'Website',
    cardWebsitePlaceholder: 'https://mywebsite.com',
  },
  user: {
    cardAvatar: 'Your Avatar',
    cardAvatarDescription: 'Upload a photo of yourself.',
    cardAvatarFooter:
      'For optimal results, we recommend using a square image that is at least 400px wide.',
    cardAvatarLabel: 'Avatar',
    cardAvatarPlaceholder: 'https://...',
    cardBio: 'Your Bio',
    cardBioDescription:
      'Help people discover your profile by sharing a short bio.',
    cardBioFooter: 'Think of this as your elevator pitch.',
    cardBioLabel: 'Bio',
    cardBioPlaceholder: "I'm a software engineer from San Francisco.",
    cardLocation: 'Your Location',
    cardLocationDescription: 'Where in the world are you?',
    cardLocationFooter:
      'City, State, Country, whatever you are comfortable with.',
    cardLocationLabel: 'Location',
    cardLocationPlaceholder: 'San Francisco, CA',
    cardName: 'Your name',
    cardNameDescription:
      'Your name is how people will know you on the platform.',
    cardNameFooter: 'Name is required.',
    cardNameLabel: 'Name',
    cardNamePlaceholder: 'John Doe',
    cardWebsite: 'Your Website URL',
    cardWebsiteDescription: 'Do you have a website? Share it here.',
    cardWebsiteFooter:
      'This could be a personal website, blog, or LinkedIn profile.',
    cardWebsiteLabel: 'Website',
    cardWebsitePlaceholder: 'https://mywebsite.com',
  },
};

export default function SharedProfile({
  address,
  isTransactionInProgress,
  isTransactionSuccessful,
  onSubmit,
  title,
  type,
}: Props) {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<SettingsFormValues>({
    initialValues: {
      avatar: '',
      bio: '',
      location: '',
      name: '',
      website: '',
    },
    validate: {
      name: isNotEmpty('Name is required'),
      website: (value) =>
        !URL_REGEX.test(value)
          ? value.length === 0
            ? null
            : 'Please enter a valid URL'
          : null,
    },
    validateInputOnBlur: true,
  });

  const contractRead = useContractRead({
    abi: VRC1_CONTRACT_ABI,
    address: VRC1_CONTRACT_ADDRESS,
    args: [address!],
    enabled: !!address,
    functionName: 'profiles',
  });

  useEffect(() => {
    const userProfileData: string[] = contractRead?.data as unknown as string[];
    //console.log("userProfileData", userProfileData);
    if (userProfileData) {
      form.setValues({
        avatar: userProfileData[2],
        bio: userProfileData[1],
        location: userProfileData[3],
        name: userProfileData[0],
        website: userProfileData[4],
      });
      form.resetDirty();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractRead?.data]);

  // Refetching the data after the transaction is successful
  useEffect(() => {
    if (isTransactionSuccessful) {
      if (type == 'dao') {
        toast({
          description:
            'Success! The proposal for DAO profile update has been created.',
        });
        router.push(`/organisations/${address}`);
      } else {
        toast({
          description: 'Success! Your profile has been successfully changed.',
        });
      }

      contractRead.refetch();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTransactionSuccessful]);

  const handleErrors = (errors: typeof form.errors) => {
    for (const key in errors) {
      if (errors[key]) {
        toast({
          description: errors[key],
          title: 'Validation error',
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <div>
      <div className="flex items-stretch justify-start border-b">
        <div className="my-8 flex items-center">
          <h1 className="text-3xl font-medium tracking-tight md:text-4xl">
            {title || 'Profile'}
          </h1>
        </div>
      </div>
      {type === 'dao' && (
        <div className="mt-4 w-full">
          <Alert variant="warning">
            <AlertCircleIcon className="h-4 w-4" />
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
        onSubmit={form.onSubmit(
          (values) => onSubmit(values),
          handleErrors,
        )}
        className="mx-auto my-8 flex w-full max-w-5xl rounded-md border shadow-lg"
      >
        <div className="flex w-full flex-col items-stretch justify-start gap-6 p-6">
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
                    className="sr-only"
                    htmlFor={PROFILE_TEXT[type].cardNameLabel.toLowerCase()}
                  >
                    {PROFILE_TEXT[type].cardNameLabel}
                  </Label>
                  <Input
                    autoComplete="name"
                    id={PROFILE_TEXT[type].cardNameLabel.toLowerCase()}
                    name={PROFILE_TEXT[type].cardNameLabel.toLowerCase()}
                    placeholder={PROFILE_TEXT[type].cardNamePlaceholder}
                    type="text"
                    {...form.getInputProps('name')}
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
                    className="sr-only"
                    htmlFor={PROFILE_TEXT[type].cardBioLabel.toLowerCase()}
                  >
                    {PROFILE_TEXT[type].cardBioLabel}
                  </Label>
                  <Textarea
                    id={PROFILE_TEXT[type].cardBioLabel.toLowerCase()}
                    name={PROFILE_TEXT[type].cardBioLabel.toLowerCase()}
                    placeholder={PROFILE_TEXT[type].cardBioPlaceholder}
                    {...form.getInputProps('bio')}
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
                  <Avatar className="border md:h-20 md:w-20">
                    <AvatarImage
                      className="object-top"
                      decoding="async"
                      loading="lazy"
                      src={form.values.avatar || ''}
                      title={`Avatar for ${form.values.name}`}
                    />
                    <AvatarFallback delayMs={300}>
                      <Image
                        src={`https://avatar.vercel.sh/${
                          form.values.name || 'no-name'
                        }.svg?text=${encodeURIComponent(
                          getInitials(form.values.name),
                        )}`}
                        alt={`Avatar for ${form.values.name}`}
                        className="pointer-events-none select-none"
                        fill
                        sizes="80px"
                      />
                    </AvatarFallback>
                  </Avatar>
                </div>
              </CardHeader>
              <CardContent>
                <div>
                  <Label
                    className="sr-only"
                    htmlFor={PROFILE_TEXT[type].cardAvatarLabel.toLowerCase()}
                  >
                    {PROFILE_TEXT[type].cardAvatarLabel}
                  </Label>
                  <Input
                    autoComplete="url"
                    id={PROFILE_TEXT[type].cardAvatarLabel.toLowerCase()}
                    name={PROFILE_TEXT[type].cardAvatarLabel.toLowerCase()}
                    placeholder={PROFILE_TEXT[type].cardAvatarPlaceholder}
                    type="text"
                    {...form.getInputProps('avatar')}
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
                    className="sr-only"
                    htmlFor={PROFILE_TEXT[type].cardLocationLabel.toLowerCase()}
                  >
                    {PROFILE_TEXT[type].cardLocationLabel}
                  </Label>
                  <Input
                    autoComplete="country"
                    id={PROFILE_TEXT[type].cardLocationLabel.toLowerCase()}
                    name={PROFILE_TEXT[type].cardLocationLabel.toLowerCase()}
                    placeholder={PROFILE_TEXT[type].cardLocationPlaceholder}
                    type="text"
                    {...form.getInputProps('location')}
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
                    className="sr-only"
                    htmlFor={PROFILE_TEXT[type].cardWebsiteLabel.toLowerCase()}
                  >
                    {PROFILE_TEXT[type].cardWebsiteLabel}
                  </Label>
                  <Input
                    autoComplete="url"
                    id={PROFILE_TEXT[type].cardWebsiteLabel.toLowerCase()}
                    name={PROFILE_TEXT[type].cardWebsiteLabel.toLowerCase()}
                    placeholder={PROFILE_TEXT[type].cardWebsitePlaceholder}
                    type="text"
                    {...form.getInputProps('website')}
                  />
                  {form.errors.website && (
                    <p className="mt-1 text-sm text-destructive">
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
