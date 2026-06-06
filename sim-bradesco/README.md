# BradShield Mobile

Aplicativo mobile configurado com React Native e Expo, integrado à API BradShield em `C:\meucliente\bradshield`.

Base configurada com Expo SDK 55, React 19.2.0 e React Native 0.83.6.

## Rodar o projeto

```bash
npm install
npm run start
```

No PowerShell, se `npm` for bloqueado pela Execution Policy, use `npm.cmd install` e `npm.cmd run start`.

## API

O app consome a API BradShield. Por padrão, usa:

- Android Emulator: `http://10.0.2.2:5189`
- iOS Simulator/Web: `http://localhost:5189`

Para dispositivo físico, use a aba `Conexão` no app ou inicie com:

```bash
$env:EXPO_PUBLIC_BRADSHIELD_API_URL="http://SEU-IP-LOCAL:5189"
npm.cmd run start
```

## Tela Saiba Mais

Quando a verificacao retornar `suspeito` ou `fraudulento`, o app mostra o botao **Saiba mais** e abre a tela de suspeita dentro do proprio aplicativo.

A tela interna tambem possui a opcao **Ver dicas**, com orientacoes de seguranca adaptadas do projeto `saiba-mais-bra`.
