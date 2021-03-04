const Discord = require("discord.js");

const HangmanScores = require("./HangmanScores");

class Hangman{

    constructor(word, channel, isCustom){
        
        this.word = word.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");    

        this.secret = this.hideWord();

        this.title = "";
        this.gameOverMessage = "";
        this.victoryMessage = "";
               
        this.channel = channel;
        this.isCustom = isCustom;

        this.guessedLetters = "";

        this.color = "#bfd4e9";
        this.lives = 8;
        this.hasEnded = false;

    }

    setMessages(obj){

        if(typeof obj == "object" && obj.title != undefined && obj.game_over != undefined && obj.victory != undefined){
            this.title = obj.title;
            this.gameOverMessage = obj.game_over;
            this.victoryMessage = obj.victory;
        }

    }

    hideWord(){

        const special = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
        let secret = "";

        for(let i = 0; i < this.word.length; i++){
            
            switch(true){

                case special.test(this.word[i]):
                    secret += this.word[i];
                break;

                default: 
                    secret += "〇";
                break;

            }
            
        }

        return secret;

    }

    getLetterOccurancesIndexes(letter) {

        const indexes = [];

        for(let i = 0; i < this.word.length; i++){
            if(this.word[i] == letter) indexes.push(i);
        }

        return indexes;

    }

    guess(message) {

        const letter = message.content.toUpperCase();

        if(this.guessedLetters.includes(letter)){
            message.reply("this letter has already been guessed!");
            return;
        }
        
        this.guessedLetters += letter;
        
        const indexes = this.getLetterOccurancesIndexes(letter);

        if(indexes.length == 0){
            
            this.lives--;
            
            this.color = "#f0190a";

            this.prettyPrint();
            
            if(this.lives <= 0) {
                this.hasEnded = true;
                const embed = new Discord.MessageEmbed().setTitle(this.title).setColor(this.color).setDescription("**GAME OVER**\n\nThe answer was " + this.word.toUpperCase() + ". " + this.gameOverMessage);
                this.channel.send(embed);
            }
            
        }
        else{

            for(let i = 0; i < indexes.length; i++){
                this.secret = setCharAt(this.secret, indexes[i], letter);
            }
           
            this.color = "#75db30";

            this.prettyPrint();

            if(this.word == this.secret){
                
                if(message.guild != undefined && !this.isCustom){
                    HangmanScores.addPoint(message.guild.id, message.author.id, message.author.username);
                }

                this.hasEnded = true;
                
                const embed = new Discord.MessageEmbed().setTitle(this.title).setColor(this.color).setDescription("**VICTORY!**\n\nThe winner is **" + message.author.username + "**! The answer was " + this.word.toUpperCase() + ". " + this.victoryMessage);
                this.channel.send(embed);
                
            }

        }
               
    }

    wildGuess(message){

        if(message.content.toUpperCase() == this.word.toUpperCase()){
           
            this.color = "#75db30";
            
            if(message.guild != undefined && !this.isCustom){
                HangmanScores.addPoint(message.guild.id, message.author.id, message.author.username);
            }

            this.hasEnded = true;
            
            const embed = new Discord.MessageEmbed().setTitle(this.title).setColor(this.color).setDescription("**VICTORY!**\n\nThe winner is **" + message.author.username + "**! The answer was " + this.word.toUpperCase() + ". " + this.victoryMessage);
            this.channel.send(embed);

        }

    }

    prettyPrint(){
        const embed = new Discord.MessageEmbed().setTitle(this.title).setColor(this.color).setDescription("**" + this.secret + "\n\n** Lives: " + this.lives).setFooter(this.guessedLetters);
        this.channel.send(embed);
    }

}

function setCharAt(str, index, chr) {
    if(index > str.length - 1) return str;
    return str.substring(0, index) + chr + str.substring(index + 1);
}

module.exports = Hangman;