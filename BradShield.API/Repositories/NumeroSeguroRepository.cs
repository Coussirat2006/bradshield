using BradShield.API.Data;
using BradShield.API.Models;
using Microsoft.EntityFrameworkCore;

namespace BradShield.API.Repositories;

public class NumeroSeguroRepository : INumeroSeguroRepository
{
    private readonly BradShieldContext _context;

    public NumeroSeguroRepository(BradShieldContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<NumeroSeguro>> ListarComInstituicaoAsync(CancellationToken cancellationToken = default)
    {
        return await _context.NumerosSeguros
            .AsNoTracking()
            .Include(numeroSeguro => numeroSeguro.Instituicao)
            .OrderBy(numeroSeguro => numeroSeguro.Instituicao!.Nome)
            .ThenBy(numeroSeguro => numeroSeguro.NumeroTelefone)
            .ToListAsync(cancellationToken);
    }

    public Task<NumeroSeguro?> ObterPorIdComInstituicaoAsync(int id, CancellationToken cancellationToken = default)
    {
        return _context.NumerosSeguros
            .Include(numeroSeguro => numeroSeguro.Instituicao)
            .FirstOrDefaultAsync(numeroSeguro => numeroSeguro.Id == id, cancellationToken);
    }

    public Task<NumeroSeguro?> ObterPorTelefoneAsync(string numeroTelefone, CancellationToken cancellationToken = default)
    {
        return _context.NumerosSeguros
            .AsNoTracking()
            .FirstOrDefaultAsync(numeroSeguro => numeroSeguro.NumeroTelefone == numeroTelefone, cancellationToken);
    }

    public Task<NumeroSeguro?> ObterPorTelefoneComInstituicaoAsync(string numeroTelefone, CancellationToken cancellationToken = default)
    {
        return _context.NumerosSeguros
            .AsNoTracking()
            .Include(numeroSeguro => numeroSeguro.Instituicao)
            .FirstOrDefaultAsync(numeroSeguro => numeroSeguro.NumeroTelefone == numeroTelefone, cancellationToken);
    }

    public Task<bool> ExistePorTelefoneAsync(
        string numeroTelefone,
        int? ignorarId = null,
        CancellationToken cancellationToken = default)
    {
        return _context.NumerosSeguros
            .AnyAsync(
                numeroSeguro =>
                    numeroSeguro.NumeroTelefone == numeroTelefone
                    && (!ignorarId.HasValue || numeroSeguro.Id != ignorarId.Value),
                cancellationToken);
    }

    public async Task RegistrarAsync(NumeroSeguro numeroSeguro, CancellationToken cancellationToken = default)
    {
        await _context.NumerosSeguros.AddAsync(numeroSeguro, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task AtualizarAsync(NumeroSeguro numeroSeguro, CancellationToken cancellationToken = default)
    {
        _context.NumerosSeguros.Update(numeroSeguro);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task RemoverAsync(NumeroSeguro numeroSeguro, CancellationToken cancellationToken = default)
    {
        _context.NumerosSeguros.Remove(numeroSeguro);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
