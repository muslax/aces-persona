import useSWR from "swr";

import { API_ROUTES } from "config/routes";

export default function useUser() {
  const { data: user, error, mutate: mutateUser } = useSWR(API_ROUTES.User);

  const isLoading = !user && !error;

  return { user, mutateUser, isLoading };
}