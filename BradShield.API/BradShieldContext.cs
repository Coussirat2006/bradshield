using Microsoft.EntityFrameworkCore;

namespace BradShield.API
{
    public class BradShieldContext : DbContext
    {
        public BradShieldContext(DbContextOptions<BradShieldContext> options) : base(options) { }

        public DbSet<NumeroSeguro> NumerosSeguros { get; set; }
        
        // Nova tabela de auditoria conectada ao Azure
        public DbSet<HistoricoVerificacao> HistoricoVerificacoes { get; set; }
    }
}