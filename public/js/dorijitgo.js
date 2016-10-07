// dorijitgo
var CardsTimer = null;

function CardSet(time_limit, last_score, fpn_write, image_path)
{
	this.Cards = null;
	this.Time = null;
	this.Score = 0;
	this.HighScore = last_score;
	this.TimeLimit = time_limit;	//ms
	this.WriteCookie = fpn_write;	//callback for write cookie
	this.ImagePath = image_path;
	this.ImageArray = null;

	this.Reset = Reset;
	function Reset() {
		this.Cards = null;
		while (!this.IsPossible()) {
			this.GenCards();
		}
		
		for (var i in this.Cards) {
			this.Cards[i].DivID = "card" + String(i);
		}
		this.Time = (new Date()).getTime();
	}
	
	this.GenCards = GenCards;
	function GenCards() {
		this.Cards = new Array();
		raw_numbers = new Array();
		raw_numbers2 = new Array();
		while (this.Cards.length < 5) {
			var card = new Card(this, 'a');
			if (raw_numbers.indexOf(card.Num) == -1) {
				raw_numbers.push(card.Num);
				this.Cards.push(card);
			}
			else if (raw_numbers2.indexOf(card.Num) == -1) {
				raw_numbers2.push(card.Num);
				card.AB = 'b';
				this.Cards.push(card);
			}
		}
	}
	
	this.IsPossible = IsPossible;
	function IsPossible() {
		if (this.Cards == null || this.Cards.length != 5)
			return false;
		
		for (var i = 0; i < 3; i++) {
			for (var j = i + 1; j < 4; j++) {
				for (var k = j + 1; k < 5; k++) {
					if ((this.Cards[i].Num + this.Cards[j].Num + this.Cards[k].Num) % 10 == 0)
						return true;
				}
			}
		}
		
		return false;
	}
	
	this.IsCorrect = IsCorrect;
	function IsCorrect() {
		var sum = this.CalcSum();
		var chosen_count = this.CalcChosenCount();
		return (chosen_count == 3) && (sum % 10 == 0);
	}
	
	this.CalcSum = CalcSum;
	function CalcSum() {
		var sum = 0;
		for (var i in this.Cards) {
			if (this.Cards[i].Chosen) {
				sum += this.Cards[i].Num;
			}
		}
		return sum;
	}
	
	this.CalcChosenCount = CalcChosenCount;
	function CalcChosenCount() {
		var chosen_count = 0;
		for (var i in this.Cards) {
			if (this.Cards[i].Chosen) {
				chosen_count++;
			}
		}
		return chosen_count;
	}

	this.ElapsedTime = ElapsedTime;
	function ElapsedTime() {
		if (this.Time == null)
			return 0;
		return (new Date()).getTime() - this.Time;
	}

	this.CalcScore = CalcScore;
	function CalcScore() {
		if (!this.IsCorrect()) {
			return 0;
		}
		
		var score = 0;
		var remainings = new Array();
		
		for (var i in this.Cards) {
			if (this.Cards[i].Chosen == false)
				remainings.push(this.Cards[i].Num);
		}
		
		if (remainings[0] == remainings[1])
			score = (remainings[0] + 1) * 10;
		else
			score = remainings[0] + remainings[1];
		
		return Math.floor((this.TimeLimit - this.ElapsedTime()) / 1000.0 * score);
	}
	
	this.SetHTML = SetHTML;
	function SetHTML() {
		for (var i in this.Cards) {
			if (this.ImagePath != null) {
				this.Cards[i].SetHTML(this.ImageArray);
			}
			else
				this.Cards[i].SetHTML(null);
		}
		
		this.UpdateScore();
		var that = this;
		CardsTimer = window.setInterval( function() {that.onTimer();}, Math.floor(this.TimeLimit / 50));
	}
	
	this.onTimer = onTimer;
	function onTimer() {
		if (this.ElapsedTime() < this.TimeLimit) {
			this.UpdateRemainTime();
			return;
		}
		this.Score = 0;
		this.ResetCards();
	}
	
	this.AfterClick = AfterClick;
	function AfterClick() {
		if (this.CalcChosenCount() < 3)
			return;

		this.ResetCards();
	}
	
	this.ResetCards = ResetCards;
	function ResetCards() {
		if (CardsTimer != null) {
			window.clearInterval(CardsTimer);
			CardsTimer = null;
		}

		this.UpdateScore();
		this.Reset();
		this.SetHTML();
		this.UpdateRemainTime();
	}
	
	this.UpdateScore = UpdateScore;
	function UpdateScore() {
		if (this.CalcChosenCount() > 0)
			this.Score = this.CalcScore();

		if (this.Score >= this.HighScore) {
			this.HighScore = this.Score;
			this.WriteCookie(this.HighScore);
			$("#high_score").css('color', '#F78181').css('font-weight', 'bold');
		}
		else
			$("#high_score").css('color', 'white').css('font-weight', 'normal');

		$("#high_score").html(String(this.HighScore));
		$("#score").html(String(this.Score));
	}
	
	this.UpdateRemainTime = UpdateRemainTime;
	function UpdateRemainTime() {
		$("#remaining_time").css('width', String(Math.floor((this.TimeLimit - this.ElapsedTime()) / this.TimeLimit * 100)) + '%' );
	}
	
	this.PreLoading = PreLoading;
	function PreLoading(div, callback) {
		this.ImageArray = new Array();
		var picture_urls = new Array();
		for (var i=1; i<=10; i++) {
			picture_urls.push(String(i) + "a");
			picture_urls.push(String(i) + "b");
		}
	
		var loaded  = 0;
		for(var i = 0, j = picture_urls.length; i < j; i++) {
			var img = new Image();
			img.onload = function() {
				div.empty();
				div.append($(this));
				if(++loaded == picture_urls.length && callback)
				{
					div.empty();
					callback();
				}
			}
			img.id = "img_" + picture_urls[i];
			img.className = (this.ImagePath == "Cards/") ? "image2" : "image";
			img.src = this.ImagePath + picture_urls[i] + ".png";
			
			this.ImageArray.push(img);
		}
	}
}

function Card(cards, ab) {
	this.Cards = cards;
	this.Num = Math.floor(Math.random() * 9.9 + 1);
	this.AB = ab;
	this.Chosen = false;
	this.DivID = null;	
	
	this.SetHTML = SetHTML;
	function SetHTML(image_array) {
		card = this.GetJQ();
		card.css('display', 'none');
		if (image_array == null) {
			card.html(String(this.Num));
		}
		else {
			card.removeClass("card");
			card.empty();
			var image_index = (this.Num - 1) * 2 + ((this.AB == 'a') ? 0 : 1);
			card.append(image_array[image_index]);
		}
		card.slideDown("fast");
		
		card.click({card:this}, function (ev) {
			ev.data.card.Chosen = true;
			$(this).slideUp(200);
			ev.data.card.Cards.AfterClick();
		});
	}
	
	this.GetJQ = GetJQ;
	function GetJQ() {
		return $("#" + this.DivID);
	}
}