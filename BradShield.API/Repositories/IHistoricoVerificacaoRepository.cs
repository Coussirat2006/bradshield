using BradShield.API.Models;

namespace BradShield.API.Repositories;

public interface IHistoricoVerificacaoRepository
{
    Task RegistrarAsync(HistoricoVerificacao historicoVerificacao, CancellationToken cancellationToken = default);
}
