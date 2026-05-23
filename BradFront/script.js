const botaoVerificar = document.getElementById('btnVerificar');
const inputNumero = document.getElementById('numeroInput');
const divResultado = document.getElementById('resultado');
const textoStatus = document.getElementById('statusTexto');
const textoMensagem = document.getElementById('mensagemTexto');

botaoVerificar.addEventListener('click', () => {
    const numeroDigitado = inputNumero.value.trim();

    if (!numeroDigitado) {
        alert("Por favor, digite um número primeiro!");
        return;
    }


    let dadosFalsosDaApi = {};

    if (numeroDigitado === "0800-591-2117") {
        dadosFalsosDaApi = {
            status: "Seguro",
            mensagem: "Este número é de um banco oficial. Pode atender!"
        };
    } else {
        dadosFalsosDaApi = {
            status: "Perigo",
            mensagem: "Cuidado! Este número não consta na base de dados."
        };
    }

    divResultado.classList.remove('escondido', 'seguro', 'perigo');
    textoStatus.innerText = dadosFalsosDaApi.status;
    textoMensagem.innerText = dadosFalsosDaApi.mensagem;

    if (dadosFalsosDaApi.status === "Seguro") {
        divResultado.classList.add('seguro');
    } else {
        divResultado.classList.add('perigo');
    }
});