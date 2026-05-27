using BradShield.API;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

//  Permite que a API reconheça seus arquivos Controllers
builder.Services.AddControllers();

// Conectando a API ao Banco de Dados SQL do Azure usando a configuração já existente
builder.Services.AddDbContext<BradShieldContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
    
// Criação da regra do CORS 
builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirTudo",
        policy => policy
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader());
});

var app = builder.Build();

// requisição HTTP
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

// inica o Cors
app.UseCors("PermitirTudo");

app.MapControllers();

app.Run();