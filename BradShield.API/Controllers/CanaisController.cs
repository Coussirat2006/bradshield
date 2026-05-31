using BradShield.API.Response;
using BradShield.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace BradShield.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CanaisController : ControllerBase
{
    private readonly ICanalService _canalService;

    public CanaisController(ICanalService canalService)
    {
        _canalService = canalService;
    }

    [HttpGet("{numero}")]
    public async Task<IActionResult> VerificarCanal(string numero, CancellationToken cancellationToken)
    {
        var canal = await _canalService.VerificarCanalAsync(numero, cancellationToken);

        if (canal is null)
        {
            return NotFound(new MensagemResponse("Numero nao encontrado na base de dados."));
        }

        return Ok(canal);
    }
}
