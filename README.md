# 🛡️ BradShield - API de Validação de Canais Oficiais

O **BradShield** é uma Web API desenvolvida em .NET para a validação de números de telefone e canais de comunicação de instituições financeiras. O objetivo principal do projeto é mitigar ataques de engenharia social, como *phishing* e *vishing*, permitindo que o usuário verifique se um determinado número de contato é de fato um canal oficial de um banco ou se trata de uma potencial fraude.

---

## 🛠️ Tecnologias Utilizadas

* **Linguagem:** C#
* **Framework:** .NET Core / ASP.NET Core Web API
* **Banco de Dados:** Azure SQL Database (Microsoft SQL Server)
* **ORM:** Dapper
* **Documentação:** Swagger (OpenAPI)

---

## 📂 Estrutura do Projeto

* `Database/`: Contém os scripts SQL de criação das tabelas e carga inicial de dados.
* `BradShield.API/`: Contém o código-fonte da API, organizado em Controllers, Models e Repositories.
* `BradFront/`: Interface web desenvolvida em HTML, CSS e JavaScript para interação com o usuário.

---

## 🗄️ Modelagem do Banco de Dados

O banco de dados armazena as informações das instituições financeiras e seus respectivos canais validados. A tabela principal foi estruturada da seguinte forma:

```sql
CREATE TABLE CanaisOficiais (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Instituicao VARCHAR(100) NOT NULL,
    TipoCanal VARCHAR(50) NOT NULL, -- Ex: Telefone, SMS, WhatsApp
    Contato VARCHAR(50) NOT NULL UNIQUE, -- O número ou identificador oficial
    DataCadastro DATETIME DEFAULT GETDATE(),
    Status INT NOT NULL DEFAULT 1 -- 1 = Ativo / Seguro
);
