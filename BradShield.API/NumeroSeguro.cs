using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BradShield.API
{
    public class NumeroSeguro
    {
        public int ID { get; set; }
        
        // O "required" garante que o número nunca seja nulo ao criar o objeto
        public required string NumeroTelefone { get; set; }
        
        public int InstituicaoID { get; set; }
    }
}  
