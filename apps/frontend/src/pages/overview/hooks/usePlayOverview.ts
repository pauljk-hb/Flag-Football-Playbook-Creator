import { api } from "@/api/client";
import { useNavigate } from "react-router-dom";

export function usePlaybookOverview() {
  const navigate = useNavigate();

  const handleNewPlay = async () => {
    const newId = await api.plays.create();
    navigate(`/editor/${newId}`, { replace: true });
  };

  return { handleNewPlay };
}
