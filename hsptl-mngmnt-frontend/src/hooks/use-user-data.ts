import { useQuery } from "@tanstack/react-query";
import { getUserSessionData } from "@/app/api/users/index.c";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

const useUserData = (sessionToken: string, router?: AppRouterInstance) => {
  const data = useQuery({
    queryKey: ["User", "Profile_Data"],
    queryFn: async () => await getUserSessionData(sessionToken, router),
    refetchInterval: 2000,
  });

  return data
};

export default useUserData;
