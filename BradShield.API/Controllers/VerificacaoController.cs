using BradShield.API.Response;
using BradShield.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace BradShield.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VerificacaoController : ControllerBase
{
    private readonly IVerificacaoService _verificacaoService;

    public VerificacaoController(IVerificacaoService verificacaoService)
    {
        _verificacaoService = verificacaoService;
    }

    [HttpGet("checar/{numero}")]
    public async Task<IActionResult> ChecarNumero(string numero, CancellationToken cancellationToken)
    {
        var ipRequisicao = HttpContext.Connection.RemoteIpAddress?.ToString();
        var resultado = await _verificacaoService.ChecarNumeroAsync(numero, ipRequisicao, cancellationToken);

        if (resultado.Seguro)
        {
            return Ok(new VerificacaoResponse(
                resultado.Status,
                "Este n\u00FAmero \u00E9 de um banco oficial. Pode atender!"));
        }

        return BadRequest(new VerificacaoResponse(
            resultado.Status,
            "\u26A0\uFE0F ALERTA: N\u00FAmero n\u00E3o encontrado na base oficial. Poss\u00EDvel golpe!"));
    }
}
