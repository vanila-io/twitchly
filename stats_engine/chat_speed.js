'use strict';

let c = class ChatSpeed
{
	constructor()
	{
		this.tick = 0;
		this.oldSpeed = 0;
	}

	addTick()
	{
		this.tick += 1;

		if(this.tick === 1)
		{
			this.firstDate = new Date().getTime();
		}

		if(this.tick === 120)
		{
			this.oldSpeed = this.messagesByMinutes;
			this.tick = 0;
			this.addTick();
			return;
		}

		this.speed;
	}

	get messagesByMinutes()
	{
		if(this.tick <= 1)
			return this.oldSpeed;

		let elapsedTime = new Date().getTime() - this.firstDate;

		let millisBetweenMessages = elapsedTime / this.tick;
		let messagesByMinutes = 60 / (millisBetweenMessages / 1000);
		
		return messagesByMinutes;
	}

	get messagesBySeconds()
	{
		return this.messagesByMinutes / 60;
	}

	reset()
	{
		this.tick = 0;
		this.oldSpeed = 0;
	}
}

module.exports = c;