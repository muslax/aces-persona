import useSWR from "swr"
import fetchJson from "lib/fetchJson"
import { API_ROUTES } from "config/routes"

export default function useTestProgress(type) {
  const key = `${API_ROUTES.GET.TEST_PROGRESS}&type=${type}`
  const { data, error, mutate } = useSWR(key, fetchJson)

  return {
    progress: data,
    isLoading: !error && !data,
    isError: error,
    mutateProgress: mutate,
  }
}
