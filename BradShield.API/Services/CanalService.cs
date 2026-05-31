using BradShield.API.Response;
using BradShield.API.Repositories;

namespace BradShield.API.Services;

public class CanalService : ICanalService
{
    private readonly INumeroSeguroRepository _numeroSeguroRepository;

    public CanalService(INumeroSeguroRepository numeroSeguroRepository)
    {
        _numeroSeguroRepository = numeroSeguroRepository;
    }

    public async Task<CanalSeguroResponse?> VerificarCanalAsync(string numeroTelefone, CancellationToken cancellationToken = default)
    {
        var numeroSeguro = await _numeroSeguroRepository.ObterPorTelefoneComInstituicaoAsync(
            numeroTelefone.Trim(),
            cancellationToken);

        if (numeroSeguro is null)
        {
            return null;
        }

        var nomeInstituicao = numeroSeguro.Instituicao?.Nome ?? $"Instituicao {numeroSeguro.InstituicaoId}";

        return new CanalSeguroResponse(nomeInstituicao, true);
    }
}