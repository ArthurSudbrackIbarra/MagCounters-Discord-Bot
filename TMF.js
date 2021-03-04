class TMF{

    constructor(){
        this.messagesCount = 0;
        this.authors = [];
    }

    increment(){
        this.messagesCount++;
    }

    addAuthor(author){
        
        const a = this.authors.find(x => x == author);
        
        if(a == undefined){
            this.authors.push(author);
        }
        
    }

}

module.exports = TMF;