using BradShield.API;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Permite que a API reconheça seus arquivos Controllers
builder.Services.AddControllers();

// Conectando a API ao Banco de Dados SQL do Azure usando a configuração já existente
builder.Services.AddDbContext<BradShieldContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
    
// Adiciona os serviços necessários para o Swagger funcionar
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
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

// requisição HTTP e Ativação da tela do Swagger
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();   // Gera o mapeamento
    app.UseSwaggerUI(); // Cria a tela visual no navegador
}

app.UseHttpsRedirection();
app.UseAuthorization();

// inicia o Cors
app.UseCors("PermitirTudo");

app.MapControllers();

// Rota temporária para testar a conexão com o banco de dados
app.MapGet("/teste-banco", async (BradShieldContext db) =>
{
    try
    {
        // Tenta abrir a conexão com o banco
        bool conectou = await db.Database.CanConnectAsync();

        if (conectou)
            return Results.Ok("Conexão com o banco de dados funcionou perfeitamente! 🚀");
        else
            return Results.StatusCode(500);
    }
    catch (Exception ex)
    {
        // Se der erro (senha errada, firewall bloqueando, etc), ele mostra o motivo
        return Results.Problem($"Erro ao conectar no banco: {ex.Message}");
    }
});

app.Run();