using BradShield.API.Models;

namespace BradShield.API.Repositories;

public interface INumeroSeguroRepository
{
    Task<IReadOnlyList<NumeroSeguro>> ListarComInstituicaoAsync(CancellationToken cancellationToken = default);
    Task<NumeroSeguro?> ObterPorIdComInstituicaoAsync(int id, CancellationToken cancellationToken = default);
    Task<NumeroSeguro?> ObterPorTelefoneAsync(string numeroTelefone, CancellationToken cancellationToken = default);
    Task<NumeroSeguro?> ObterPorTelefoneComInstituicaoAsync(string numeroTelefone, CancellationToken cancellationToken = default);
    Task<bool> ExistePorTelefoneAsync(string numeroTelefone, int? ignorarId = null, CancellationToken cancellationToken = default);
    Task RegistrarAsync(NumeroSeguro numeroSeguro, CancellationToken cancellationToken = default);
    Task AtualizarAsync(NumeroSeguro numeroSeguro, CancellationToken cancellationToken = default);
    Task RemoverAsync(NumeroSeguro numeroSeguro, CancellationToken cancellationToken = default);
}
