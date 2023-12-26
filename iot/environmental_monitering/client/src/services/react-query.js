import { QueryClient } from "@tanstack/react-query";
import { axiosInstance } from "./axios.config";

const defaultFn = async ({ queryKey }) => {
  const [endpoint, params, options] = queryKey;

  const res = await axiosInstance.get(endpoint, {
    params,
    ...options,
  });

  return res?.data;
};

const queryConfig = {
  queries: {
    queryFn: defaultFn,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: false,
  },
};

export const APIQueryKey = {
  GET_HISTORY: "get_history",
  GET_CHART_DATA: "get_chart_data",
  GET_MAX_HUMIDITY: "get_max_humidity",
  GET_MIN_HUMIDITY: "get_min_humidity",
  GET_MAX_TEMPERATURE: "get_max_temperature",
  GET_MIN_TEMPERATURE: "get_min_temperature",
  GET_MAX_GAS: "get_max_gas",
  GET_MIN_GAS: "get_min_gas",
};

export const queryClient = new QueryClient({ defaultOptions: queryConfig });
