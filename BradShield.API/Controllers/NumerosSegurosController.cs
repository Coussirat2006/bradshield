using BradShield.API.Data;
using BradShield.API.Models;
using BradShield.API.Repositories;
using BradShield.API.Request;
using BradShield.API.Response;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BradShield.API.Controllers;

[ApiController]
[Route("api/numeros-seguros")]
public class NumerosSegurosController : ControllerBase
{
    private readonly BradShieldContext _context;
    private readonly INumeroSeguroRepository _numeroSeguroRepository;

    public NumerosSegurosController(
        BradShieldContext context,
        INumeroSeguroRepository numeroSeguroRepository)
    {
        _context = context;
        _numeroSeguroRepository = numeroSeguroRepository;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<NumeroSeguroResponse>>> Listar(CancellationToken cancellationToken)
    {
        var numeros = await _numeroSeguroRepository.ListarComInstituicaoAsync(cancellationToken);

        return Ok(numeros.Select(MapearResponse).ToList());
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<NumeroSeguroResponse>> Obter(int id, CancellationToken cancellationToken)
    {
        var numeroSeguro = await _numeroSeguroRepository.ObterPorIdComInstituicaoAsync(id, cancellationToken);

        if (numeroSeguro is null)
        {
            return NotFound(new MensagemResponse("Numero seguro nao encontrado."));
        }

        return Ok(MapearResponse(numeroSeguro));
    }

    [HttpPost]
    public async Task<ActionResult<NumeroSeguroResponse>> Criar(
        NumeroSeguroRequest request,
        CancellationToken cancellationToken)
    {
        var erroValidacao = ValidarRequest(request);

        if (erroValidacao is not null)
        {
            return BadRequest(new MensagemResponse(erroValidacao));
        }

        var numeroNormalizado = Normalizar(request.NumeroTelefone);

        if (await _numeroSeguroRepository.ExistePorTelefoneAsync(numeroNormalizado, cancellationToken: cancellationToken))
        {
            return Conflict(new MensagemResponse("Numero ja cadastrado como seguro."));
        }

        try
        {
            var instituicao = await ObterOuCriarInstituicaoAsync(request.Instituicao, cancellationToken);
            var numeroSeguro = new NumeroSeguro
            {
                NumeroTelefone = numeroNormalizado,
                InstituicaoId = instituicao.Id,
                Instituicao = instituicao
            };

            await _numeroSeguroRepository.RegistrarAsync(numeroSeguro, cancellationToken);

            return CreatedAtAction(
                nameof(Obter),
                new { id = numeroSeguro.Id },
                MapearResponse(numeroSeguro));
        }
        catch (DbUpdateException)
        {
            return Conflict(new MensagemResponse("Nao foi possivel salvar o numero seguro. Verifique se ele ja existe."));
        }
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<NumeroSeguroResponse>> Atualizar(
        int id,
        NumeroSeguroRequest request,
        CancellationToken cancellationToken)
    {
        var erroValidacao = ValidarRequest(request);

        if (erroValidacao is not null)
        {
            return BadRequest(new MensagemResponse(erroValidacao));
        }

        var numeroSeguro = await _numeroSeguroRepository.ObterPorIdComInstituicaoAsync(id, cancellationToken);

        if (numeroSeguro is null)
        {
            return NotFound(new MensagemResponse("Numero seguro nao encontrado."));
        }

        var numeroNormalizado = Normalizar(request.NumeroTelefone);

        if (await _numeroSeguroRepository.ExistePorTelefoneAsync(numeroNormalizado, id, cancellationToken))
        {
            return Conflict(new MensagemResponse("Numero ja cadastrado como seguro."));
        }

        try
        {
            var instituicao = await ObterOuCriarInstituicaoAsync(request.Instituicao, cancellationToken);

            numeroSeguro.NumeroTelefone = numeroNormalizado;
            numeroSeguro.InstituicaoId = instituicao.Id;
            numeroSeguro.Instituicao = instituicao;

            await _numeroSeguroRepository.AtualizarAsync(numeroSeguro, cancellationToken);

            return Ok(MapearResponse(numeroSeguro));
        }
        catch (DbUpdateException)
        {
            return Conflict(new MensagemResponse("Nao foi possivel atualizar o numero seguro."));
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Remover(int id, CancellationToken cancellationToken)
    {
        var numeroSeguro = await _numeroSeguroRepository.ObterPorIdComInstituicaoAsync(id, cancellationToken);

        if (numeroSeguro is null)
        {
            return NotFound(new MensagemResponse("Numero seguro nao encontrado."));
        }

        await _numeroSeguroRepository.RemoverAsync(numeroSeguro, cancellationToken);

        return NoContent();
    }

    private static NumeroSeguroResponse MapearResponse(NumeroSeguro numeroSeguro)
    {
        var instituicao = numeroSeguro.Instituicao?.Nome ?? $"Instituicao {numeroSeguro.InstituicaoId}";

        return new NumeroSeguroResponse(
            numeroSeguro.Id,
            numeroSeguro.NumeroTelefone,
            numeroSeguro.InstituicaoId,
            instituicao,
            true);
    }

    private static string? ValidarRequest(NumeroSeguroRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.NumeroTelefone))
        {
            return "Informe o numero de telefone.";
        }

        if (string.IsNullOrWhiteSpace(request.Instituicao))
        {
            return "Informe a instituicao.";
        }

        if (Normalizar(request.NumeroTelefone).Length > 20)
        {
            return "O numero de telefone deve ter no maximo 20 caracteres.";
        }

        if (request.Instituicao.Trim().Length > 100)
        {
            return "A instituicao deve ter no maximo 100 caracteres.";
        }

        return null;
    }

    private async Task<Instituicao> ObterOuCriarInstituicaoAsync(
        string nome,
        CancellationToken cancellationToken)
    {
        var nomeNormalizado = nome.Trim();
        var instituicao = await _context.Instituicoes
            .FirstOrDefaultAsync(item => item.Nome == nomeNormalizado, cancellationToken);

        if (instituicao is not null)
        {
            return instituicao;
        }

        instituicao = new Instituicao { Nome = nomeNormalizado };
        await _context.Instituicoes.AddAsync(instituicao, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return instituicao;
    }

    private static string Normalizar(string valor)
    {
        return valor.Trim();
    }
}
