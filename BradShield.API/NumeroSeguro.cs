using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BradShield.API
{
    [Table("NumerosSeguros")]
    public class NumeroSeguro
    {
        [Key]
        public int ID { get; set; }
        public string NumeroTelefone { get; set; }
        public int InstituicaoID { get; set; }
    }
}       
