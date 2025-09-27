import { GetUserParams } from "@/lib/actions/shared.types";
import { getUserData } from "@/lib/actions/user.action";
import { useEffect, useState } from "react";

export const useGetUser = () => {
  const [data, setData] = useState<GetUserParams>({} as GetUserParams);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
};
