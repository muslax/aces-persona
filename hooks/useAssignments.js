import useSWR from "swr"
import fetchJson from "lib/fetchJson"
import { API_ROUTES } from "config/routes"

export default function useAssignments() {
  const key = `${API_ROUTES.GET.ASSIGNMENTS}`
  const { data, error, mutate } = useSWR(key, fetchJson)

  return {
    assignments: data,
    isLoading: !error && !data,
    isError: error,
    mutateAssignments: mutate,
  }
}
