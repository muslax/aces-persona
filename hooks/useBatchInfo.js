import useSWR from "swr"
import fetchJson from "lib/fetchJson"
import { API_ROUTES } from "config/routes"

export default function useBatchInfo(bid, gid) {
  const key = `${API_ROUTES.GET.BATCH_INFO}&bid=${bid}&gid=${gid}`
  const { data, error, mutate } = useSWR(key, fetchJson)

  return {
    data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  }
}
