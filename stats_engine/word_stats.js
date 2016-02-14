'use strict';

let w = class WordStats
{
	constructor()
	{
		this.words = {};
	}

	computeMessage(message)
	{
		var words = message.split(' ');

		for(let word of words)
		{
			if(this.words[word])
				this.words[word] += 1;
			else
				this.words[word] = 1;
		}
	}

	addWord(word)
	{
		if(this.words[word])
			this.words[word] += 1;
		else
			this.words[word] = 1;
	}

	get mostPopular()
	{
		var _word;
		var _score = 0;

		for (let word in this.words)
		{
		    if (!this.words.hasOwnProperty(word)) continue;
		    
		    if(this.words[word] > _score)
		    {
		    	_score = this.words[word];
		    	_word = word;
		    }
		}

		return _word;
	}
}

module.exports = w;