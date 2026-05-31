using BradShield.API.Models;
using Microsoft.EntityFrameworkCore;

namespace BradShield.API.Data;

public class BradShieldContext : DbContext
{
    public BradShieldContext(DbContextOptions<BradShieldContext> options) : base(options)
    {
    }

    public DbSet<Instituicao> Instituicoes => Set<Instituicao>();
    public DbSet<NumeroSeguro> NumerosSeguros => Set<NumeroSeguro>();
    public DbSet<HistoricoVerificacao> HistoricoVerificacoes => Set<HistoricoVerificacao>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Instituicao>(entity =>
        {
            entity.ToTable("Instituicoes");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("ID");

            entity.Property(e => e.Nome)
                .IsRequired()
                .HasMaxLength(100);

            entity.HasIndex(e => e.Nome)
                .IsUnique();
        });

        modelBuilder.Entity<NumeroSeguro>(entity =>
        {
            entity.ToTable("NumerosSeguros");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("ID");

            entity.Property(e => e.NumeroTelefone)
                .IsRequired()
                .HasMaxLength(20);

            entity.Property(e => e.InstituicaoId)
                .HasColumnName("InstituicaoID");

            entity.HasIndex(e => e.NumeroTelefone)
                .IsUnique();

            entity.HasOne(e => e.Instituicao)
                .WithMany(e => e.NumerosSeguros)
                .HasForeignKey(e => e.InstituicaoId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<HistoricoVerificacao>(entity =>
        {
            entity.ToTable("HistoricoVerificacoes");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("ID");

            entity.Property(e => e.NumeroConsultado)
                .IsRequired()
                .HasMaxLength(20);

            entity.Property(e => e.StatusRetornado)
                .IsRequired()
                .HasMaxLength(20);

            entity.Property(e => e.IpOrigem)
                .HasColumnName("IPOrigem")
                .HasMaxLength(45);

            entity.Property(e => e.DataConsulta)
                .HasDefaultValueSql("SYSUTCDATETIME()");
        });
    }
}
