using System;

namespace BradShield.API.Models;

public class HistoricoVerificacao
{
    public int Id { get; set; }
    public required string NumeroConsultado { get; set; }
    public required string StatusRetornado { get; set; }
    public DateTime DataConsulta { get; set; } = DateTime.UtcNow;
    public string? IpOrigem { get; set; }
}
