IF OBJECT_ID(N'dbo.Instituicoes', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Instituicoes (
        ID INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Instituicoes PRIMARY KEY,
        Nome VARCHAR(100) NOT NULL
    );
END;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = N'UX_Instituicoes_Nome'
      AND object_id = OBJECT_ID(N'dbo.Instituicoes')
)
BEGIN
    CREATE UNIQUE INDEX UX_Instituicoes_Nome
        ON dbo.Instituicoes (Nome);
END;
GO

IF NOT EXISTS (
    SELECT 1
    FROM dbo.Instituicoes
    WHERE ID = 1
)
BEGIN
    SET IDENTITY_INSERT dbo.Instituicoes ON;

    INSERT INTO dbo.Instituicoes (ID, Nome)
    VALUES (1, 'Banco Bradesco Oficial');

    SET IDENTITY_INSERT dbo.Instituicoes OFF;
END;
GO

IF OBJECT_ID(N'dbo.NumerosSeguros', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.NumerosSeguros (
        ID INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_NumerosSeguros PRIMARY KEY,
        NumeroTelefone VARCHAR(20) NOT NULL,
        InstituicaoID INT NOT NULL
    );
END;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = N'UX_NumerosSeguros_NumeroTelefone'
      AND object_id = OBJECT_ID(N'dbo.NumerosSeguros')
)
BEGIN
    CREATE UNIQUE INDEX UX_NumerosSeguros_NumeroTelefone
        ON dbo.NumerosSeguros (NumeroTelefone);
END;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE name = N'FK_NumerosSeguros_Instituicoes_InstituicaoID'
)
BEGIN
    ALTER TABLE dbo.NumerosSeguros
    ADD CONSTRAINT FK_NumerosSeguros_Instituicoes_InstituicaoID
        FOREIGN KEY (InstituicaoID) REFERENCES dbo.Instituicoes(ID);
END;
GO

IF NOT EXISTS (
    SELECT 1
    FROM dbo.NumerosSeguros
    WHERE NumeroTelefone = '0800-591-2117'
)
BEGIN
    INSERT INTO dbo.NumerosSeguros (NumeroTelefone, InstituicaoID)
    VALUES ('0800-591-2117', 1);
END;
GO

IF OBJECT_ID(N'dbo.HistoricoVerificacoes', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.HistoricoVerificacoes (
        ID INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_HistoricoVerificacoes PRIMARY KEY,
        NumeroConsultado VARCHAR(20) NOT NULL,
        StatusRetornado VARCHAR(20) NOT NULL,
        DataConsulta DATETIME2 NOT NULL CONSTRAINT DF_HistoricoVerificacoes_DataConsulta DEFAULT SYSUTCDATETIME(),
        IPOrigem VARCHAR(45) NULL
    );
END;
GO
