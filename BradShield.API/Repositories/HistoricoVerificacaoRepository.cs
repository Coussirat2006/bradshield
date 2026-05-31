using BradShield.API.Data;
using BradShield.API.Models;

namespace BradShield.API.Repositories;

public class HistoricoVerificacaoRepository : IHistoricoVerificacaoRepository
{
    private readonly BradShieldContext _context;

    public HistoricoVerificacaoRepository(BradShieldContext context)
    {
        _context = context;
    }

    public async Task RegistrarAsync(HistoricoVerificacao historicoVerificacao, CancellationToken cancellationToken = default)
    {
        await _context.HistoricoVerificacoes.AddAsync(historicoVerificacao, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
