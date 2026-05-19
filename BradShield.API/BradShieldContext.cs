using Microsoft.EntityFrameworkCore;

namespace BradShield.API
{
    public class BradShieldContext : DbContext
    {
        public BradShieldContext(DbContextOptions<BradShieldContext> options) : base(options) { }

        public DbSet<NumeroSeguro> NumerosSeguros { get; set; }
    }
}