using Microsoft.AspNetCore.Mvc;

namespace BradShield.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // Isso faz a rota virar /api/canais
    public class CanaisController : ControllerBase
    {
        [HttpGet("{numero}")]
        public IActionResult VerificarCanal(string numero)
        {
            // Simulando a ida ao banco de dados rápido
            if (numero == "0800-591-2117")
            {
                // Se o número for esse, devolve OK (Status 200) e os dados do banco
                return Ok(new
                {
                    instituicao = "Banco Bradesco Oficial",
                    seguro = true
                });
            }

            // Se for qualquer outro número, devolve Não Encontrado (Status 404 - Perigo!)
            return NotFound(new { mensagem = "Número não encontrado na base de dados." });
        }
    }
}