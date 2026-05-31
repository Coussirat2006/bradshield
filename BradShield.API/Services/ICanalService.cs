using BradShield.API.Response;

namespace BradShield.API.Services;

public interface ICanalService
{
    Task<CanalSeguroResponse?> VerificarCanalAsync(string numeroTelefone, CancellationToken cancellationToken = default);
}
