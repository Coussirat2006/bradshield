using BradShield.API.Models;
using BradShield.API.Repositories;
using BradShield.API.Response;  
namespace BradShield.API.Services;

public class VerificacaoService : IVerificacaoService
{
    private readonly INumeroSeguroRepository _numeroSeguroRepository;
    private readonly IHistoricoVerificacaoRepository _historicoVerificacaoRepository;

    public VerificacaoService(
        INumeroSeguroRepository numeroSeguroRepository,
        IHistoricoVerificacaoRepository historicoVerificacaoRepository)
    {
        _numeroSeguroRepository = numeroSeguroRepository;
        _historicoVerificacaoRepository = historicoVerificacaoRepository;
    }

    public async Task<ResultadoVerificacao> ChecarNumeroAsync(
        string numeroTelefone,
        string? ipOrigem,
        CancellationToken cancellationToken = default)
    {
        var numeroNormalizado = numeroTelefone.Trim();
        var numeroSeguro = await _numeroSeguroRepository.ObterPorTelefoneAsync(numeroNormalizado, cancellationToken);
        var seguro = numeroSeguro is not null;
        var status = seguro ? "Seguro" : "Alerta";

        var historicoVerificacao = new HistoricoVerificacao
        {
            NumeroConsultado = numeroNormalizado,
            StatusRetornado = status,
            IpOrigem = ipOrigem,
            DataConsulta = DateTime.UtcNow
        };

        await _historicoVerificacaoRepository.RegistrarAsync(historicoVerificacao, cancellationToken);

        return new ResultadoVerificacao(seguro, status);
    }
}
