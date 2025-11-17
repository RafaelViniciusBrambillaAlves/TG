// src/hooks/useLinkUser.ts
import api from "@/services/api";
import { useState } from "react";

export type CreatedLinkUser = {
  userId: string;
  organizationId: string;
};

export default function useLinkUser() {
  const [loading, setLoading] = useState(false);

  async function linkUser(
    userIdOrObj: string | CreatedLinkUser,
    maybeOrganizationId?: string,
  ) {
    const payload: CreatedLinkUser =
      typeof userIdOrObj === "string"
        ? { userId: userIdOrObj, organizationId: String(maybeOrganizationId) }
        : userIdOrObj;

    if (!payload.userId || !payload.organizationId) {
      console.warn("linkUser: userId or organizationId missing", payload);
      return;
    }

    try {
      setLoading(true);
      await api.post("/api/v1/usuarios/linkUserOrganization", {
        userId: payload.userId,
        organizationId: payload.organizationId,
      });
      // opcional: retornar true/obj com sucesso
      return { success: true };
    } catch (e) {
      console.error("Erro ao linkar usuário:", e);
      return { success: false, error: e };
    } finally {
      setLoading(false);
    }
  }

  return { loading, linkUser };
}
