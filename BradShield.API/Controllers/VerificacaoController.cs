using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

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
            // Consulta no banco do Azure se o número pertence à base oficial
            var seguro = await _context.NumerosSeguros.FirstOrDefaultAsync(n => n.NumeroTelefone == numero);

            string statusResultado = (seguro != null) ? "Seguro" : "Alerta";
            string? ipRequisicao = HttpContext.Connection.RemoteIpAddress?.ToString();

            // Grava a trilha de auditoria de segurança
            var logAuditoria = new HistoricoVerificacao
            {
                NumeroConsultado = numero,
                StatusRetornado = statusResultado,
                IPOrigem = ipRequisicao,
                DataConsulta = DateTime.Now
            };

            _context.HistoricoVerificacoes.Add(logAuditoria);
            await _context.SaveChangesAsync();

            // Respostas tratadas para o Front-end consumir dinamicamente
            if (seguro != null)
            {
                return Ok(new { status = "Seguro", mensagem = "Este número é de um banco oficial. Pode atender!" });
            }

            return BadRequest(new { status = "Alerta", mensagem = "⚠️ ALERTA: Número não encontrado na base oficial. Possível golpe!" });
        }
    }
}