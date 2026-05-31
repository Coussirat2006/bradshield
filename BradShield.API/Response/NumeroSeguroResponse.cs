namespace BradShield.API.Response;

public sealed record NumeroSeguroResponse(
    int Id,
    string NumeroTelefone,
    int InstituicaoId,
    string Instituicao,
    bool Seguro);
