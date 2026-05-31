using BradShield.API.Data;
using BradShield.API.Repositories;
using BradShield.API.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException(
        "Configure a connection string named 'DefaultConnection' using user secrets, environment variables, Azure App Service connection strings, or Azure Key Vault.");
}

builder.Services.AddDbContext<BradShieldContext>(options =>
    options.UseSqlServer(
        connectionString,
        sqlOptions => sqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(10),
            errorNumbersToAdd: null)));

builder.Services.AddScoped<INumeroSeguroRepository, NumeroSeguroRepository>();
builder.Services.AddScoped<IHistoricoVerificacaoRepository, HistoricoVerificacaoRepository>();
builder.Services.AddScoped<ICanalService, CanalService>();
builder.Services.AddScoped<IVerificacaoService, VerificacaoService>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirTudo",
        policy => policy
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();

    app.MapGet("/teste-banco", async (BradShieldContext db, CancellationToken cancellationToken) =>
    {
        try
        {
            return await db.Database.CanConnectAsync(cancellationToken)
                ? Results.Ok("Conexao com o banco de dados realizada com sucesso.")
                : Results.Problem("Nao foi possivel conectar ao banco de dados.");
        }
        catch (Exception ex)
        {
            return Results.Problem($"Erro ao conectar no banco: {ex.Message}");
        }
    });
}

app.UseHttpsRedirection();
app.UseCors("PermitirTudo");
app.UseAuthorization();

app.MapControllers();

app.Run();
