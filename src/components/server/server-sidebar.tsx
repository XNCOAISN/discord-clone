import { ChannelType, MemberRole } from "@prisma/client";
import { redirect } from "next/navigation";

import { ScrollArea } from "@/components/ui/scroll-area";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

import { ServerHeader } from "./server-header";
import { ServerSearch } from "./server-search";
import { Hash, Mic, ShieldAlert, ShieldCheck, Video } from "lucide-react";

type ServerSidebarProps = {
  serverId: string;
};

const iconMap = {
  [ChannelType.TEXT]: <Hash className="mr-2 h-4 w-4" />,
  [ChannelType.AUDIO]: <Mic className="mr-2 h-4 w-4" />,
  [ChannelType.VIDEO]: <Video className="mr-2 h-4 w-4" />,
};

const roleIconMap = {
  [MemberRole.GUEST]: null,
  [MemberRole.MODERATOR]: (
    <ShieldCheck className="h-4 w-4 mr-2 text-indigo-500" />
  ),
  [MemberRole.ADMIN]: <ShieldAlert className="h-4 w-4 ml-2 text-rose-500" />,
};

export const ServerSidebar = async ({ serverId }: ServerSidebarProps) => {
  const profile = await currentProfile();

  if (!profile) {
    return redirect("/");
  }

  const server = await db.server.findUnique({
    where: {
      id: serverId,
    },
    include: {
      channels: {
        orderBy: {
          createdAt: "asc",
        },
      },
      members: {
        include: {
          profile: true,
        },
        orderBy: {
          role: "asc",
        },
      },
    },
  });

  if (!server) {
    return redirect("/");
  }

  const textChannels = server.channels.filter(
    (channel) => channel.type === ChannelType.TEXT
  );
  const audioChannels = server.channels.filter(
    (channel) => channel.type === ChannelType.AUDIO
  );
  const videoChannels = server.channels.filter(
    (channel) => channel.type === ChannelType.VIDEO
  );
  const members = server.members.filter(
    (member) => member.profileId !== profile.id
  );
  const role = server.members.find(
    (member) => member.profileId === profile.id
  )?.role;

  return (
    <div className="flex flex-col h-full text-primary w-full dark:bg-[#2B2D31] bg-[#F2F3F5]">
      <ServerHeader server={server} role={role} />

      <ScrollArea className="flex-1 px-3">
        <div className="mt-2">
          <ServerSearch
            data={[
              {
                label: "Text Channels",
                type: "channel",
                data: textChannels?.map(({ id, name, type }) => ({
                  id,
                  name,
                  icon: iconMap[type],
                })),
              },
              {
                label: "Voice Channels",
                type: "channel",
                data: audioChannels?.map(({ id, name, type }) => ({
                  id,
                  name,
                  icon: iconMap[type],
                })),
              },
              {
                label: "Video Channels",
                type: "channel",
                data: videoChannels?.map(({ id, name, type }) => ({
                  id,
                  name,
                  icon: iconMap[type],
                })),
              },
              {
                label: "Members",
                type: "member",
                data: members?.map(({ id, profile, role }) => ({
                  id,
                  name: profile.name,
                  icon: roleIconMap[role],
                })),
              },
            ]}
          />
        </div>
      </ScrollArea>
    </div>
  );
};
