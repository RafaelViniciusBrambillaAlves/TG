Aqui está a descrição completa do **DER (Diagrama Entidade-Relacionamento)** mostrado na imagem, com todas as entidades, atributos e relacionamentos organizados:

---

### **Entidade: enderecos**

* **id_endereco** (PK)
* logradouro
* numero
* complemento
* bairro
* cidade
* estado
* país
* cep
* latitude
* longitude

---

### **Entidade: usuarios**

* **id_usuario** (PK)
* nome
* email
* telefone
* id_perfil (FK → perfil.id_perfil)
* id_endereco (FK → enderecos.id_endereco)
* data_criacao

---

### **Entidade: perfil**

* **id_perfil** (PK)
* nome
* descricao

---

### **Entidade: organizacoes**

* **id_organizacao** (PK)
* nome
* id_endereco (FK → enderecos.id_endereco)
* telefone
* descricao
* email
* site
* tipo

---

### **Entidade: centros**

* **id_centro** (PK)
* nome
* id_organizacao (FK → organizacoes.id_organizacao)
* id_endereco (FK → enderecos.id_endereco)
* descricao
* telefone
* email

---

### **Entidade: centros_administradores**

* **id_centro_administrador** (PK)
* id_centro (FK → centros.id_centro)
* id_usuario (FK → usuarios.id_usuario)
* data_inicio
* data_fim

---

### **Entidade: emergencias**

* **id_emergencia** (PK)
* titulo
* subtitulo
* descricao
* id_endereco (FK → enderecos.id_endereco)
* data_inicio
* data_fim
* urgencia
* status

---

### **Entidade: emergencias_centros**

* **id_emergencia_organizacao** (PK)
* id_emergencia (FK → emergencias.id_emergencia)
* id_centro (FK → centros.id_centro)

---

### **Entidade: necessidades**

* **id_necessidade** (PK)
* id_emergencia (FK → emergencias.id_emergencia)
* id_centro (FK → centros.id_centro)
* nome_recurso
* descricao
* tipo_voluntariado
* quantidade_necessaria
* quantidade_atingida
* status

---

### **Entidade: postagens_demanda**

* **id_postagem** (PK)
* id_emergencia (FK → emergencias.id_emergencia)
* id_centro (FK → centros.id_centro)
* titulo
* descricao
* data_criacao
* data_validade
* status

---

### **Entidade: postagens_necessidades**

* **id_postagens_necessidades** (PK)
* id_postagem (FK → postagens_demanda.id_postagem)
* id_necessidade (FK → necessidades.id_necessidade)

---

### **Entidade: atividades**

* **id_atividade** (PK)
* titulo
* descricao
* id_centro (FK → centros.id_centro)
* data_inicio
* data_fim
* status
* tipo_atividade

---

### **Entidade: atividades_voluntario**

* **id_atividade_voluntario** (PK)
* id_atividade (FK → atividades.id_atividade)
* id_usuario (FK → usuarios.id_usuario)
* data_inicio
* data_fim
* status

---

### **Entidade: intencao_doacao**

* **id_intencao** (PK)
* id_necessidade (FK → necessidades.id_necessidade)
* id_usuario (FK → usuarios.id_usuario)
* data_intencao

---

### **Entidade: rotas_seguras**

* **id_rota** (PK)
* id_centro (FK → centros.id_centro)
* id_emergencia (FK → emergencias.id_emergencia)
* ponto_inicio
* ponto_fim
* descricao
* tempo_estimado
* distancia_estimada
* status

---

### **Relacionamentos principais**

* **enderecos** é referenciado por **usuarios**, **organizacoes**, **centros** e **emergencias**.
* **organizacoes** se relacionam com **centros** (1:N).
* **centros** se relacionam com **centros_administradores**, **emergencias_centros**, **necessidades**, **postagens_demanda**, **atividades** e **rotas_seguras**.
* **emergencias** se relacionam com **emergencias_centros**, **necessidades**, **postagens_demanda** e **rotas_seguras**.
* **necessidades** se relacionam com **postagens_necessidades** e **intencao_doacao**.
* **atividades** se relacionam com **atividades_voluntario**.
* **usuarios** se relacionam com **atividades_voluntario**, **centros_administradores** e **intencao_doacao**.

---

Deseja que eu escreva isso em formato de **script SQL (CREATE TABLE)** também? Assim já fica pronto para criação do banco.
