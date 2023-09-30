import { redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

type ServerIdPageProps = {
  params: {
    serverId: string;
  };
};

const ServerIdPage = async ({ params }: ServerIdPageProps) => {
  const profile = await currentProfile();

  if (!profile) {
    return redirectToSignIn();
  }

  const server = await db.server.findUnique({
    where: {
      id: params.serverId,
      members: {
        some: {
          profileId: profile.id,
        },
      },
    },
    include: {
      channels: {
        where: {
          name: "general",
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  const initialCahnnel = server?.channels[0];

  if (initialCahnnel?.name !== "general") {
    return null;
  }

  return redirect(`/servers/${params.serverId}/channels/${initialCahnnel?.id}`);
};

export default ServerIdPage;
