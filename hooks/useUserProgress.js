import useSWR from "swr"
import fetchJson from "lib/fetchJson"
import { API_ROUTES } from "config/routes"

export default function useUserProgress() {
  const key = `${API_ROUTES.GET.USER_PROGRESS}`
  const { data, error, mutate } = useSWR(key, fetchJson)

  return {
    data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  }
}
