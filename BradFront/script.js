const botaoVerificar = document.getElementById('btnVerificar');
const inputNumero = document.getElementById('numeroInput');
const divResultado = document.getElementById('resultado');
const textoStatus = document.getElementById('statusTexto');
const textoMensagem = document.getElementById('mensagemTexto');

botaoVerificar.addEventListener('click', async () => {
    const numeroDigitado = inputNumero.value.trim();

    if (!numeroDigitado) {
        alert("Por favor, digite um número primeiro!");
        return;
    }


    divResultado.classList.remove('escondido', 'seguro', 'perigo');
    textoStatus.innerText = "Consultando...";
    textoMensagem.innerText = "Aguarde, verificando na base de dados...";

    try {
      const respostaDaApi = await fetch(`https://localhost:7220/api/canais/${numeroDigitado}`);

        //  Verifica a resposta da API 
        if (respostaDaApi.ok) {
            // Pega os dados do banco 
            const dados = await respostaDaApi.json(); 

            textoStatus.innerText = "Seguro";
            textoMensagem.innerText = `Este canal pertence a: ${dados.instituicao}. Pode confiar!`;
            divResultado.classList.add('seguro');
        } else {
            // A API não encontrou o número no banco
            textoStatus.innerText = "Perigo";
            textoMensagem.innerText = "Cuidado! Este número não consta na base de dados de canais oficiais.";
            divResultado.classList.add('perigo');
        }

    } catch (erro) {
        // Se a API estiver desligada ou der algum erro de conexão
        textoStatus.innerText = "Erro de Conexão";
        textoMensagem.innerText = "Não foi possível conectar ao servidor. Verifique se a API está rodando.";
        divResultado.classList.add('perigo');
        console.error("Erro na consulta:", erro);
    }
});