import Link from "next/link";
import { MapPin, LinkIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { getInitials } from "@/utils/shorten-name";
import Image from "next/image";

const user = {
  name: `Emily Thompson`,
  bio: "Emily Thompson was born on May 10, 1990, in a small town in California. From a young age, she displayed a natural talent for music and began taking piano lessons at the age of six. Her passion for music continued to grow, and she soon started composing her own songs.",
  avatar: "",
  place: "Austin, Texas",
  url: "https://chat.openai.com/",
};

export default function Profile() {
  return (
    <div className="border rounded-lg shadow-sm bg-card text-card-foreground flex flex-col divide-y w-auto md:text-base text-xs">
      <div className="text-xl font-semibold px-5 pt-5 pb-3">Your Identity</div>
      <div className="font-light px-6 pt-3 pb-6">
        <div className="flex flex-row lg:justify-between gap-5 items-start w-full">
          <div className="w-20 h-20">
            <Avatar className="h-20 w-20">
              <AvatarImage
                className="object-top"
                decoding="async"
                loading="lazy"
                title={`Avatar for ${user.name}`}
                src={user.avatar || ""}
              />
              <AvatarFallback delayMs={300}>
                <Image
                  src={`https://avatar.vercel.sh/${
                    user.name || "no-name"
                  }.svg?text=${encodeURIComponent(getInitials(user.name))}`}
                  width="80"
                  height="80"
                  alt={`Avatar for ${user.name}`}
                  className="select-none pointer-events-none rounded-full"
                />
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="w-full flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <div className="flex flex-row items-center gap-2 text-lg font-medium">
                <div>Emily Thompson</div>
              </div>
              <div className="lg:w-96 w-full">
                Emily Thompson was born on May 10, 1990, in a small town in
                California. From a young age, she displayed a natural talent for
                music and began taking piano lessons at the age of six. Her
                passion for music continued to grow, and she soon started
                composing her own songs.
              </div>
              <div className="flex flex-col mt-3 gap-1">
                <div className="flex flex-row items-center gap-2">
                  <MapPin />
                  <div>Austin, Texas</div>
                </div>
                <div className="flex flex-row items-center gap-2">
                  <LinkIcon />
                  <div>
                    <Link href="https://chat.openai.com/">
                      https://chat.openai.com/
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
