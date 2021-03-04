const Discord = require("discord.js");

const knexConfig = require("../knex-config.json");

const knex = require('knex')({
    client: 'mysql2',
    connection: {
        host : '127.0.0.1',
        user : knexConfig.user,
        password : knexConfig.password,
        database : 'magcounters'
    }
});

class HangmanScores{

    static async addGuild(guildId){
        await knex("guilds").insert({guild_id: guildId});
    }

    static async getGuild(guildId){
        return await knex.select("*").from("guilds").where("guild_id", guildId).first();
    }

    static async addUser(guildId, userId, username, score){
        await knex("users").insert({
            guild_id: guildId,
            user_id: userId,
            username: username,
            score: score
        });
    }

    static async getUser(guildId, userId){
        return await knex.select("*").from("users").where({guild_id: guildId, user_id: userId}).first();
    }

    static async addPoint(guildId, userId, username){

        const guild = await this.getGuild(guildId);

        if(guild == undefined){

            await this.addGuild(guildId);

        }

        const user = await this.getUser(guildId, userId);

        if(user == undefined){
            await this.addUser(guildId, userId, username, 15);
        } 
        else{
            
            const newScore = user.score + 15;
            
            await knex.raw(`
                update users 
                set score = ?
                where guild_id = ? and user_id = ?
            `, [newScore, guildId, userId]);

        }

    }

    static async totalGuildPoints(guildId){
        const result = await knex("users").sum({sum: "score"}).where("guild_id", guildId).first();
        return result.sum;
    }

    static async countPages(guildId){
        const result = await knex("users").count({count: "user_id"}).where("guild_id", guildId).first();
        return result.count;
    }

    static async changeNickname(message, newNickname){

        const guildId = message.guild.id;
        const userId = message.author.id;

        try {
            
            await knex.raw(`
                update users
                set username = ?
                where user_id = ? and guild_id = ?
            `, [newNickname, userId, guildId]);

            message.reply("your nickname has been changed with success!");

        } catch (error) {
            message.reply("an error occured while trying to change your nickname, try again later!");
        }

    }

    static async showScores(message, offset){
    
        const guildId = message.guild.id;

        let results = await knex.select(["username", "score"]).from("users").where("guild_id", guildId).orderBy("score", "desc").limit(5).offset(offset);

        if(results.length == 0){
            message.reply("There are currently no hangman scores on this page.");
            return;
        }

        let leaderboard = "";
        let count = offset + 1;

        for(let user of results){

            const totalPoints = await this.totalGuildPoints(guildId);
            const percentageGamesWon = (user.score/totalPoints * 100).toFixed(2);
            leaderboard += `[#${count}]\n**Player: **${user.username}\n**Score: **${user.score}\n**Victories: **${user.score/15}\n**% Of Games Won: **${percentageGamesWon}%\n\n`;

            count++;

        }
        
        let pageCount = Math.ceil((await this.countPages(guildId)/5));
        pageCount = "Pages 1 - " + pageCount;

        const embed = new Discord.MessageEmbed().setTitle("Hangman Scores").setColor("#bfd4e9").setDescription(leaderboard).setFooter(pageCount);

        message.channel.send(embed);

    }

}

module.exports = HangmanScores;