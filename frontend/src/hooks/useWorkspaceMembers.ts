import {
  useEffect,
  useState,
} from "react";

import {
  apiRequest,
} from "../lib/api";

import type {
  WorkspaceMember,
} from "../types/crm";


export default function useWorkspaceMembers(
  workspaceId: string,
  enabled = true,
) {
  const [
    members,
    setMembers,
  ] = useState<
    WorkspaceMember[]
  >([]);


  useEffect(() => {
    if (!enabled) {
      setMembers([]);
      return;
    }

    let active = true;

    async function load() {
      try {
        const data =
          await apiRequest<
            WorkspaceMember[]
          >(
            `/workspaces/${workspaceId}/members`,
          );

        if (active) {
          setMembers(data);
        }
      } catch {
        if (active) {
          setMembers([]);
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [
    enabled,
    workspaceId,
  ]);


  return members;
}