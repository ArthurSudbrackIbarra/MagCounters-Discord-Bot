//Importando a classe Discord.
const Discord = require("discord.js");

//Prefixo com o qual se iniciarão os comandos do bot.
const prefix = require("./prefix.json").prefix;

//Objeto axios para fazer requisições à API's.
const axios = require("axios");

//Importando a classe customizada TMF.
const TMF = require("./TMF");

//Hashmap necessário para guardar em quais canais está acontecendo o jogo tmf.
const tmfHashmap = new Map();

//Importando a classe customizada Hangman.
const Hangman = require("./Hangman");

const HangmanScores = require("./HangmanScores");

//Hashmap necessário para guardar em quais canais está acontecendo o jogo hangman.
const hangmanHashmap = new Map(); 

//Hashmap necessário para guardar o usuário criador do hangman e a guilda + canal em que será criado o hangman customizado.
const customHangmanInfo = new Map();

//Classe CommandManager para realizar comandos.
function CommandManager(client) {

    this.client = client;
    
    this.help = message => {

        const content = message.content;

        const parts = content.split(" ");

        //Se não houver especificação de comando, então mostrar quais comando existem e como conseguir informações sobre eles.
        if(parts.length == 1){

            const title = "Commands Help"
            let body = "";

            const commands = [];

            commands[0] = "**" + prefix + "help** capital";
            commands[1] = "**" + prefix + "help** changenickname";
            commands[2] = "**" + prefix + "help** counters";
            commands[3] = "**" + prefix + "help** customhangman";
            commands[4] = "**" + prefix + "help** define";
            commands[5] = "**" + prefix + "help** dog";
            commands[5] = "**" + prefix + "help** fms";
            commands[6] = "**" + prefix + "help** hangman";
            commands[7] = "**" + prefix + "help** scoreshangman";

            body += commands[0];
            let index = 1;

            while(commands[index] != undefined){
                body += "\n" + commands[index];
                index++;
            }

            const embed = new Discord.MessageEmbed().setTitle(title).setColor("#bfd4e9").setDescription(body);
            message.channel.send(embed);

        }
        //Se houver especifição de comando, então procurar a descrição deste nos arquivos de ajuda (commands_help).
        else{

            const command = parts[1];
            const fs = require("fs");
         
            try {

                const title = prefix + command;
                const body = fs.readFileSync("commands_help/" + command + ".txt", "utf-8").replace(/#prefix#/g, prefix);

                const embed = new Discord.MessageEmbed().setTitle(title).setColor("#bfd4e9").setDescription(body);
                message.channel.send(embed);

            } catch (error) {
                message.reply("There is currently no information for the command you typed.");
            }
            
        }   

    }

    this.counters = async message => {
              
        let content = message.content;
            
        let parts = content.split(" ");

        //Não continuar se a mensagem não possuir pelo menos 2 palavras.
        if(parts.length < 2) return;

        //Obtendo as parâmetros necessários para passar para a API (pokemon, option e allows).
        let pokemon = titleCase(parts[1]);

        let option = "offensive";

        if(content.includes("-d")){
            option = "defensive";
        }

        let allows = "everything";

        switch(true){             
            case content.includes("-n"): allows = "none"; break;
            case content.includes("-m"): allows = "mythicals"; break;
            case content.includes("-s"): allows = "mythicals-sub-legendaries"; break;
        }

        //Requisitando dados à API do MagCounters, passando o pokemon informado como parâmetro.
        try{
            
            let counters = await axios.get("http://www.magcounters.com/api/counters", {
                params: {
                    pokemon: pokemon,
                    option: option,
                    allows: allows
                }
            });
    
            //Criando e configurando o embed.
            const embed = new Discord.MessageEmbed().setColor('#bfd4e9').setTitle(pokemon + " Counters").setFooter("http://www.magcounters.com");

            embed.addFields(
                { name: "Counter Type: ", value: titleCase(option) },
                { name: "Allowing: ", value: titleCase(allows) },
            );
            
            counters.data.forEach(counter => {
                embed.addFields(
                    { name: counter.pokemonInfo.name, value: "Score: " + counter.score + "\n"},
                )
            });
                    
            //Se o Pokemon for encontrado, será enviado o embed com as informações dos counters ao usuário.
            message.channel.send(embed);
    
        } catch (error) {
            //Se o Pokemon não for encontrado, esta mensagem será enviada ao usuário.
            message.reply("The Pokemon you typed could not be found in MagCounters database.");
        }

    }

    /*this.wst = async message => {
                  
        let parts = message.content.split(" ");

        //Não continuar se a mensagem não possuir pelo menos 2 palavras.
        if(parts.length < 2) {
            message.reply("Your command is missing parameters! Correct is: -wst 100 #optional-channel-name");
            return;
        }

        const range = parts[1];

        //Não continuar se o alcance informado não for um número.
        if(isNaN(range) || range <= 0){
            message.reply("The messages range must be a number and higher than 0!");
            return;
        }

        const channelId = parts[2] != undefined ? parts[2].slice(1, parts[2].length - 1).replace("#", "") : message.channel.id;
        const channel = this.client.channels.cache.get(channelId);

        //Não continuar se o canal informado não for encontrado.
        if(channel == undefined || channel == null){
            message.reply("The channel you typed could not be found!");
            return;
        }
        
        try{
            
            const messages = Array.from(await fetchManyMessages(channel, range));             
            const chosenMessage = messages[messages.length - 1][1];
                            
            const chosenMessageContent = chosenMessage.content;
            const chosenMessageUser = chosenMessage.author.username;

            message.channel.send(`Who said that? \`\`\`${chosenMessageContent}\`\`\``);

            setTimeout(() => {
                message.channel.send(`**${chosenMessageContent}** was said by **${chosenMessageUser}**!`);
            }, 30000);

        } catch (error) {
            message.channel.send("there was an error with the wst command. That is Sr.Gordin's fault, kill him!");
        }

    }*/

    this.dog = async message => {

        try {
            
            //Requisitando dados JSON à API externa através do axios.
            const dogPicture = await axios.get("https://dog.ceo/api/breeds/image/random");
          
            //Criando e configurando o embed.
            const embed = new Discord.MessageEmbed().setColor('#bfd4e9').setImage(dogPicture.data.message);

            message.channel.send(embed);

        } catch (error) {
            message.channel.send("There was an error. No dog pictures for today :(");
        }       

    }

    this.capital = async message => {

        const content = message.content;

        //Obtendo o nome do país informado.
        const countryName = content.slice(content.indexOf(" ") + 1, content.length).replace(/ /g, "%20");
     
        try {
            
            //Requisitando informações do país à API externa.
            const country = await axios.get(`https://restcountries.eu/rest/v2/name/${countryName}?fullText=true`);

            message.channel.send(`\`\`\`The capital of ${country.data[0].name} is ${country.data[0].capital}\`\`\``);

        } catch (error) {
            message.reply("The country you typed could not be found!");
        }

    }

    this.define = async message => {

        const content = message.content;

        const parts = content.split(" ");

        //Não continuar se a mensagem não possuir pelo menos 2 palavras.
        if(parts.length < 2){
            message.reply("Your command is missing parameters! Correct is: " + prefix + "define chicken optional-language");
            return;
        }

        //Definindo a linguagem em que será dada a definição (default: english).
        const language = parts[2] != undefined ? parts[2] : "en_US";

        const word = titleCase(parts[1]);

        try {
            
            //Obtendo informações da palavra através de requisição à API.
            const wordInfo = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/${language}/${word}`);
            
            let definitions = "Word: " + word + "\n\n";

            //Iteração sobre os dados retornados - aqui são formatadas as definições e exemplos da palavra informada.
            wordInfo.data[0].meanings.forEach(meaning => {

                for(let i = 0; i < meaning.definitions.length; i++) {

                    let definition = meaning.definitions[i];
                    
                    if(definition.example != undefined){
                        definitions += `Definition:  ${definition.definition}\nExample:  ${definition.example}\n\n`;
                    }
                    else{
                        definitions += `Definition:  ${definition.definition}\n\n`;
                    }

                    if(i == 5) break;

                }

            });
                                                  
            definitions = "```" + definitions + "```";
                      
            message.channel.send(definitions);

        } catch (error) {
            message.reply("The word you typed could not be found!");
        }

    }

    this.fmsstart = message => {
        
        const channel = message.channel;
        
        //Tentativa de obter uma instância do objeto TMF para o canal em que a mensagem foi enviada.
        const tmf = tmfHashmap.get(channel);

        //Se a instância existe, não continuar.
        if(tmf != undefined){
            message.reply("There is already a tmf game running in this channel!");
            return;
        }
        
        //Se não existe, é criada uma instância do objeto TMF para o canal da mensagem.
        tmfHashmap.set(channel, new TMF());

        message.react("☑️");

    }

    this.fmscount = message => {
        
        //Tentativa de obter uma instância do objeto TMF para o canal em que a mensagem foi enviada.
        const tmf = tmfHashmap.get(message.channel);
        
        //Se a instância existe, incrementar contador de mensagens e adicionar o autor aos autores da frase, caso este ainda não tenha sido adicionado.
        if(tmf != undefined){
            tmf.increment();
            tmf.addAuthor(message.author.username);
        }

    }

    this.fmsend = async message => {

        const channel = message.channel;
        
        //Tentativa de obter uma instância do objeto TMF para o canal em que a mensagem foi enviada.
        const tmf = tmfHashmap.get(channel);
        
        //Se a instância não existe, não continuar. É preciso usar outro comando antes deste (-tmfstart).
        if(tmf == undefined){
            message.reply("You first need to use " + prefix + "tmfstart in order to use this command!");
            return;
        }

        //Apagando instância TMF para o canal da mensagem;
        tmfHashmap.delete(channel);

        //Processo de recuperar as mensagens enviadas e montar a frase final.
        try {
                 
            const messages = Array.from(await fetchManyMessages(channel, tmf.messagesCount));

            messages.shift();

            let newMessage = "";

            messages.forEach(m => {
                newMessage = m[1].content + " " + newMessage;
            });

            newMessage += "** - | ";

            tmf.authors.forEach(author => {
                newMessage += author + " | ";
            });

            newMessage += "**";

            channel.send(newMessage);

        } catch (error) {
            message.reply("There was an error with the tmf commands, please report this to Sr.Gordin!");
        }

    }

    this.dev = message => {

        const parts = message.content.split(" ");

        //Não continuar se a palavra não possuir pelo menos 2 palavras.
        if(parts.length < 2){
            message.reply("Your command is missing parameters! Correct is: " + prefix + "dev your code here.");
            return;
        }

        //Somente o desenvolvedor tem acesso à esse comando.
        if(message.author.id != "197507250229739520"){
            message.reply("Only the bot developer has access to this command!");
            return;
        }

        const code = message.content.replace(prefix + "dev", "");

        try {
            eval(code);
        } catch (error) {
            console.log(error);
            message.reply("Something went wrong with your code, fix it and try again.");
        }

    }

    this.startHangman = async message => {

        const channel = message.channel;

        //Tentativa de obter uma instância do objeto Hangman para o canal em que a mensagem foi enviada.
        if(hangmanHashmap.get(channel) == undefined){
           
            //Se a instância não existe, então criar um novo jogo Hangman para o canal.
            const countries = await axios.get("https://restcountries.eu/rest/v2/all");

            const randomNumber = Math.ceil(Math.random() * countries.data.length - 1);

            const randomCapital = countries.data[randomNumber].capital;
            const capitalCountry = countries.data[randomNumber].name;
            
            const game = new Hangman(randomCapital, channel, false);

            game.setMessages({
                title: "Hangman Capitals",
                game_over: "It is the capital of ||" + capitalCountry + "||.",
                victory: "It is the capital of ||" + capitalCountry + "||."
            });

            game.prettyPrint();
            
            hangmanHashmap.set(channel, game);

        }
        else{
            message.reply("There is already a hangman game running on this channel!");
        }

    }

    this.endHangman = message => {

        //Somente o desenvolvedor tem acesso à este comando.
        if(message.author.id != "197507250229739520"){
            message.reply("This command is for debug purposes only, you do not have the permission to use it!");
            return;
        }
        
        //Remove a instância do objeto Hangman do canal em que a mensagem foi enviada.
        hangmanHashmap.delete(message.channel);

        message.react("☑️");

    }

    this.hangmanLetter = message => {

        const channel = message.channel;

        //Tentativa de obter uma instância do objeto Hangman para o canal em que a mensagem foi enviada.
        const game = hangmanHashmap.get(channel);

        //Se a instância não existe, não fazer nada.
        if(game == undefined) return;

        //Se a instância existe, então dar o palpite da letra informada.
        game.guess(message);

        //Em caso de vitória ou derrota, apagar a instância Hangman do canal em que a mensagem foi enviada.
        if(game.hasEnded){
            hangmanHashmap.delete(channel);
        }

    }

    this.hangmanWord = message => {

        //Esta função é idêntica a de cima, com a exceção de que será dado como palpite uma palavra inteira ao invés de uma letra.
        //Neste caso, é usado o método wildGuess ao invés de somente guess da classe Hangman.
        const channel = message.channel;
        const game = hangmanHashmap.get(channel);

        if(game == undefined) return;

        game.wildGuess(message);

        if(game.hasEnded){
            hangmanHashmap.delete(channel);
        }

    }

    this.prepareCustomHangman = message => {

        const userId = message.author.id;
        
        const guildId = message.guild.id;
        const channelId = message.channel.id;
        const username = message.author.username;

        const guildName = message.guild.name;
        const channelName = message.channel.name;

        //Guardando as informações no que diz respeito a guilda e o canal onde deve ser criado o jogo hangman, bem como o username de quem irá criar o jogo.
        customHangmanInfo.set(userId, [guildId, channelId, username]);

        message.reply("A private message has been sent to you, follow the instructions to create a custom hangman game.");
        message.author.send("Your hangman game for the guild " + guildName + " on the channel " + channelName + " is all setup. Now use " + prefix + "setword your_word_here on **this private chat with me** to create your hangman game.");

    }

    this.startCustomHangman = async message => {

        const content = message.content;

        const parts = content.split(" ");

        //Não continuar se a mensagem não possuir pelo menos 2 palavras.
        if(parts.length < 2){
            message.reply("Your command is missing parameters! Correct is: " + prefix + "setword Watermelon.");
            return;
        }
        
        //Não continuar se o comando for enviado em um servidor. Ele Somente será aceito em mensagens privadas.
        if(message.guild != undefined){
            message.reply("This command is only allowed in private messages with MagCounters Bot.");
            return;
        }

        const info = customHangmanInfo.get(message.author.id);

        //Não continuar se o usuário ainda não tiver solicitado a criação de um hangman customizado.
        if(info == undefined || info.length < 3){
            message.reply("You first need to use the command " + prefix + "customhangman in order to use t");
            return;
        }

        const guildId = info[0];
        const channelId = info[1];
        const username = info[2];

        try {
           
            //Procurando a guilda através do id de guilda passado por parâmetro.
            const guild = await this.client.guilds.fetch(guildId);

            //Não continuar se não encontrar a guilda.
            if(guild == undefined){
                message.reply("MagCounters Bot was unable to find a guild with the id you typed! Try again with another guild id.");
                return;
            }

            //Procurando o canal da guilda passado por parâmetro.
            const channelToSend = guild.channels.cache.get(channelId);

            //Não continuar se não encontrar o canal.
            if(channelToSend == undefined){
                message.reply("MagCounters Bot was able to find a guild with the id you typed, but not the channel. Try again with another channel id.");
                return;
            }

            //Não continuar se já houver um jogo hangman acontecendo no canal informado.
            if(hangmanHashmap.get(channelToSend) != undefined){
                message.reply("There is already a hangman game happening on this channel.");
                return;
            }

            const word = content.replace(prefix + "setword ", "");

            //Criando um jogo hangman customizado.
            const game = new Hangman(word, channelToSend, true);

            game.setMessages({
                title: "Custom Hangman By " + username,
                game_over: "",
                victory: ""
            });

            game.prettyPrint();

            hangmanHashmap.set(channelToSend, game);

            message.reply("You've successfuly created a custom hangman game on " + guild.name + " - " + channelToSend.name + ".");


        } catch (error) {
            console.log(error);
            message.reply("There was an unexpected error, make sure MagCounters Bot is on the guild you typed and that the channel exists. Also, check if MagCounters Bot has all the necessary permissions to perform this action.");
        }

    }

    this.scoresHangman = (message) => {

        //Este trecho que código garante que os scores de Hangman somente sejam mostrados em servers.
        if(message.guild == undefined){
            message.reply("Sorry, hangman scores are not disponible in direct messages.");
            return;
        }

        const parts = message.content.split(" ");

        //Se nenhum parâmetro de página for passado, serão listados os 5 primeiros colocados.
        const offset = parts.length >= 2 ? parseInt(parts[1]) - 1: 0; 

        //Não continuar se o parâmetro de página especificado não for um número.
        if(isNaN(offset)){
            message.reply("The page parameter must be a number! Example: " + prefix + "scoreshangman 5.");
            return;
        }

        //Mostra o score dos jogos Hangman em toda a guilda.
        HangmanScores.showScores(message, offset * 5);

    }

    this.changeNickname = message => {

        const content = message.content;

        const parts = content.split(" ");

        //Não continuar se a mensagem não possuir pelo menos 2 palavras.
        if(parts.length < 2){
            message.reply("Your command is missing parameters! Correct is : " + prefix + "changenickname newNickname.");
            return;
        }

        //Pegando somente o parâmetro de nickname informado.
        const nickname = content.replace(prefix + "changenickname ", "");

        HangmanScores.changeNickname(message, nickname);

    }

}

//Função auxiliar para formatar strings.
function titleCase(string){
    return string[0].toUpperCase() + string.slice(1).toLowerCase();
}

//Função para obter um número x de mensagens enviadas em um determinado canal.
function fetchManyMessages(channel, limit) {
    
    return new Promise((resolve, reject) => {
      
        channel.messages.fetch({ limit: limit < 100 ? limit : 100 }).then(collection => {
            
            const nextBatch = () => {
                
                let remaining = limit - collection.size;
  
                if(remaining <= 0) {
                    resolve(collection);
                }
                
                channel.messages.fetch({ limit: remaining < 100 ? remaining : 100, before: collection.lastKey() }).then(next => {
                    
                    let concatenated = collection.concat(next);
        
                    if (collection.size >= limit || collection.size == concatenated.size) {
                        resolve(concatenated);
                    }
        
                    collection = concatenated;
                    
                    nextBatch();

                }).catch(error => reject(error));
            }
  
            nextBatch();

        }).catch(error => reject(error));
    
    });

}

module.exports = CommandManager;