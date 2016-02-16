'use strict';

let w = class WordStats
{
	constructor()
	{
		this.words = {};
	}

	computeMessage(message)
	{
		let words = message.split(' ');

		for(let word of words)
		{
			if(!this.isWordComputable(word))
				continue;

			if(this.words[word])
				this.words[word] += 1;
			else
				this.words[word] = 1;
		}
	}

	addWord(word)
	{
		if(!this.isWordComputable(word))
			return;

		if(this.words[word])
			this.words[word] += 1;
		else
			this.words[word] = 1;
	}

	get mostPopular()
	{
		let _word;
		let _score = 0;

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

	isWordComputable(word)
	{
		if(!word || word == null || word === 'null')
			return false;

		return true;
	}

	reset()
	{
		this.words = {};
	}
}

module.exports = w;