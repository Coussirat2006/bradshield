using System.Collections.Generic;

namespace BradShield.API.Models;

public class Instituicao
{
    public int Id { get; set; }
    public required string Nome { get; set; }
    public ICollection<NumeroSeguro> NumerosSeguros { get; set; } = new List<NumeroSeguro>();
}
