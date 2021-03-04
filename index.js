//Importando a classe Discord.
const Discord = require("discord.js");

//Criando uma instância de Client.
const client = new Discord.Client();

//TOKEN secreto para este bot.
const TOKEN = require("../bot-token.json").TOKEN;

//Importando a classe customizada CommandManager.
const CommandManager = require("./CommandManager");

//Criando uma instância de CommandManager para gerenciar os comandos requisitados ao bot.
const cm = new CommandManager(client);

//Prefixo com o qual se iniciarão os comandos do bot.
const prefix = require("./prefix.json").prefix;

//Definindo uma atividade para o bot.
client.on('ready', () => {
    console.log("Bot está online agora!");
    client.user.setActivity(prefix + "help", { type: 'PLAYING' })
});

//Evento que sempre é executado ao uma mensagem ser enviada no server.
client.on("message", async message => {

    //Não continuar se o autor da mensagem for um bot.
    if (message.author.bot) return;
  
    let content = message.content;
       
    //Dentro deste switch-case é definida ação que será realizada pelo bot.
    switch(true){

        case content.startsWith(prefix + "help"):
            cm.help(message);
        break;

        case content.startsWith(prefix + "counters"):
            cm.counters(message);
        break;

        /*case content.startsWith(prefix + "-wst"):
            cm.wst(message);
        break;*/

        case content.startsWith(prefix + "dog"):
            cm.dog(message);
        break;

        case content.startsWith(prefix + "capital"):
            cm.capital(message);
        break;

        case content.startsWith(prefix + "define"):
            cm.define(message);
        break;

        case content.startsWith(prefix + "fmsstart"):
            cm.fmsstart(message);
        break;

        case content.startsWith(prefix + "fmsend"):
            cm.fmsend(message);
        break;

        case content.startsWith(prefix + "dev"):
            cm.dev(message);
        break;

        case content.startsWith(prefix + "hangman"):
            cm.startHangman(message);
        break;

        case content.startsWith(prefix + "endhangman"):
            cm.endHangman(message);
        break;

        case content.startsWith(prefix + "scoreshangman"):
            cm.scoresHangman(message);
        break;

        case content.startsWith(prefix + "customhangman"):
            cm.prepareCustomHangman(message);
        break;

        case content.startsWith(prefix + "setword"):
            cm.startCustomHangman(message);
        break;

        case content.startsWith(prefix + "changenickname"):
            cm.changeNickname(message);
        break;

        case content.length == 1:
            cm.hangmanLetter(message);
        break;

        default: 
            cm.hangmanWord(message);
        break;

    }

    cm.fmscount(message);

});

//Comando para colocar o bot online.
client.login(TOKEN);