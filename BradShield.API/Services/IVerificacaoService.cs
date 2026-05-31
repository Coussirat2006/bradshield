using BradShield.API.Response;

namespace BradShield.API.Services;

public interface IVerificacaoService
{
    Task<ResultadoVerificacao> ChecarNumeroAsync(
        string numeroTelefone,
        string? ipOrigem,
        CancellationToken cancellationToken = default);
}
