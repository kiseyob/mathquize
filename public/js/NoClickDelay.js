function NoClickDelay(el) {
	this.element = typeof el == 'object' ? el : document.getElementById(el);
	if( window.Touch ) this.element.addEventListener('touchstart', this, false);
}
NoClickDelay.prototype = {
	handleEvent: function(e) {
		switch(e.type) {
			case 'touchstart': this.onTouchStart(e); break;
			case 'touchmove': this.onTouchMove(e); break;
			case 'touchend': this.onTouchEnd(e); break;
		}
	},
	onTouchStart: function(e) {
		e.preventDefault();
		this.moved = false;
		this.x = e.targetTouches[0].clientX;
		this.y = e.targetTouches[0].clientY;
		this.theTarget = document.elementFromPoint(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
		if(this.theTarget.nodeType == 3) this.theTarget = theTarget.parentNode;
		this.theTarget.className+= ' pressed';
		this.element.addEventListener('touchmove', this, false);
		this.element.addEventListener('touchend', this, false);
	},
	onTouchMove: function(e) {
		var x = e.targetTouches[0].clientX;
		var y = e.targetTouches[0].clientY;
		if( Math.sqrt(Math.pow(x-this.x,2)+Math.pow(y-this.y,2))>50){
			this.moved = true;
			this.theTarget.className = this.theTarget.className.replace(/ ?pressed/gi, '');
			this.theTarget.className = this.theTarget.className.replace(/ ?active/gi, '');
		} else {
			if(this.moved==true){
			this.moved=false;
			this.theTarget.className+= ' pressed';
			}
		}
	},
	onTouchEnd: function(e) {
		this.element.removeEventListener('touchmove', this, false);
		this.element.removeEventListener('touchend', this, false);
		if( !this.moved && this.theTarget ) {
			this.theTarget.className = this.theTarget.className.replace(/ ?pressed/gi, '');
			this.theTarget.className+= ' active';
			var theEvent = document.createEvent('MouseEvents');
			theEvent.initEvent('click', true, true);
			this.theTarget.dispatchEvent(theEvent);
		}
		this.theTarget = undefined;
	}
};