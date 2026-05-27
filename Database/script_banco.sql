CREATE TABLE NumerosSeguros (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    NumeroTelefone VARCHAR(20) NOT NULL,
    InstituicaoID INT NOT NULL
);

INSERT INTO NumerosSeguros (NumeroTelefone, InstituicaoID) 
VALUES ('0800-591-2117', 1);
