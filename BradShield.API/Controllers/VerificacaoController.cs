using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BradShield.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VerificacaoController : ControllerBase
    {
        private readonly BradShieldContext _context;

        public VerificacaoController(BradShieldContext context)
        {
            _context = context;
        }

        [HttpGet("checar/{numero}")]
        public async Task<IActionResult> ChecarNumero(string numero)
        {
            var seguro = await _context.NumerosSeguros.FirstOrDefaultAsync(n => n.NumeroTelefone == numero);

            if (seguro != null)
            {
                return Ok(new { status = "Seguro", mensagem = "Este número é de um banco oficial. Pode atender!" });
            }

            return BadRequest(new { status = "Alerta", mensagem = "⚠️ ALERTA: Número não encontrado na base oficial. Possível golpe!" });
        }
    }
}