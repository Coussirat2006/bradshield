using System;

namespace BradShield.API
{
    public class HistoricoVerificacao
    {
        public int ID { get; set; }
        public required string NumeroConsultado { get; set; }
        public required string StatusRetornado { get; set; }
        public DateTime DataConsulta { get; set; } = DateTime.Now;
        public string? IPOrigem { get; set; }
    }
}