"use client";

import React, { useEffect, useState } from "react";
import styles from "./volunteers.module.css";
import { Volunteer } from "@/app/mocks";
import { getPost } from "@/hooks/getPost";
import { getAllVoluntarios, Usuario } from "@/hooks/getVoluntarios";

type Props = {
  volunteers?: Usuario[];
};

export default function VolunteersList() {
  const [localVolunteers, setLocalVolunteers] = useState<Usuario[]>();

  useEffect(() => {
      getAllVoluntarios().then(async data => {
        await setLocalVolunteers(data)
        console.log("Publicação recebida:", data);
        // Aqui você pode atualizar o estado com os dados recebidos, se necessário
      });
    }, []);

  return (
    <section className={styles.wrap}>
      <header className={styles.header}>
        <h2 className={styles.title}>Voluntários</h2>
        <p className={styles.subtitle}>Lista de pessoas cadastradas como voluntários da sua ONG.</p>
      </header>

      <div className={styles.list}>
        {localVolunteers?.map((v) => (
          <article key={v._id} className={styles.card}>
            <img src={`http://localhost:3001${v.image}`} alt={v.nome} className={styles.avatar} />
            <div className={styles.info}>
              <h3 className={styles.name}>{v.nome}</h3>
              <p className={styles.email}>{v.email}</p>
            </div>
            <button className={styles.profileBtn}>Ver perfil</button>
          </article>
        ))}
      </div>
    </section>
  );
}
