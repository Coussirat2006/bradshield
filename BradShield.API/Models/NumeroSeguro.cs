namespace BradShield.API.Models;

public class NumeroSeguro
{
    public int Id { get; set; }
    public required string NumeroTelefone { get; set; }
    public int InstituicaoId { get; set; }
    public Instituicao? Instituicao { get; set; }
}
