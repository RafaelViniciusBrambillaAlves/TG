// src/hooks/useLinkUser.ts
import api from "@/services/api";
import { useState } from "react";

export type CreatedLinkUser = {
  userId: string;
  necessidade: string;
};

export default function useDonate() {
  const [loading, setLoading] = useState(false);

  async function donate(
    userIdOrObj: string | CreatedLinkUser,
    necessidade?: string,
  ) {
    const payload: CreatedLinkUser =
      typeof userIdOrObj === "string"
        ? { userId: userIdOrObj, necessidade: String(necessidade) }
        : userIdOrObj;

    if (!payload.userId || !payload.necessidade) {
      console.warn("linkUser: userId or organizationId missing", payload);
      return;
    }

    try {
      setLoading(true);
      await api.post(`/api/v1/necessidades/ajudar/${payload.necessidade}`, {
        userId: payload.userId,
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

  return { loading, donate };
}
