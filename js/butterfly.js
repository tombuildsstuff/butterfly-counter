function Butterfly(name,index,optionalArg) {
this.id = index;
this.submitlistItem = 0;
this.name = name;
if(typeof(optionalArg) === "undefined") {
	this.positionInStorage = null;
	this.positionInBasket = null;
	this.positionInOlderSightings = null;
	this.amount = 0;
	this.date = false;
	this.time = false;
	this.myPosition = {"latitude":false,"longitude":false,"isSet":false};
	this.inBasket = false;
	this.errorCode = {"position":false,"network":false,"server":false};
	this.serverMessage = false;
} else {
	this.positionInStorage = optionalArg.positionInStorage;
	this.positionInBasket = optionalArg.positionInBasket;
	this.positionInOlderSightings = optionalArg.positionInOlderSightings;
	this.amount = optionalArg.amount;
	this.date = optionalArg.date;
	this.time = optionalArg.time;
	this.myPosition = {"latitude":optionalArg.myPosition.latitude,"longitude":optionalArg.myPosition.longitude,"isSet":optionalArg.myPosition.isSet};
	this.inBasket = optionalArg.inBasket;
	this.errorCode = {"position":optionalArg.errorCode.position,"network":optionalArg.errorCode.network,"server":optionalArg.errorCode.server};
	this.serverMessage = optionalArg.serverMessage;
}

this.printMe = printMe;
this.countMe = countMe;
this.uploadMe = uploadMe;
this.storeMe = storeMe;
this.editMe = editMe;
this.resetMe = resetMe;
this.submitResult = submitResult;
this.setInfoMessage = setInfoMessage;
this.getName = getName;
this.getAmount = getAmount;
this.getMyPosition = getMyPosition;
this.getDate = getDate;
this.getTime = getTime;
this.validateMyPosition = validateMyPosition;
this.cloneMe = cloneMe;

return true;
}

Butterfly.prototype = new Butterflyapp;

function printMe(forwhat,what) {
	switch(forwhat) {
		case "butterflylist":
			var that = this;
			var output = $("<li data-icon='false' data-shadow='false'><a href='#bfc_choosebutterfly'><img class='bf_image' src='images/"+this.bf_images[this.name]+"'/><div class='bf_infowrapper'><span class='bf_info'>"+this.name+"</span><span id='bf_"+this.id+"' class='bf_currentamount'></span></div></a></li>").on("click", function() { that.countMe(); });
			$("#butterflylist").append(output);
		break;
		case "sightingbasket":
			var that = this;
			var count = " count";
			if(this.amount > 1) { count = " counts"; }
			var output = $("<li id='"+this.name+"' data-icon='false'><a href='#bfc_edit'><img class='bf_image' src='images/"+this.bf_images[this.name]+"'/><span class='bf_info'>"+this.name+"</span><span class='ui-li-count'>"+this.amount+count+"</span></a></li>").on("click", function() { that.editMe("new"); });
			$("#sightingbasket").append(output);
		break;
		case "oldersightings":
			var that = this;
			var count = " count";
			if(this.amount > 1) { count = " counts"; }
			var output = $("<li id='"+this.name+"' data-icon='false'><a href='#bfc_edit'><img class='bf_image' src='images/"+this.bf_images[this.name]+"'/><span class='bf_info'>"+this.name+"</span><span class='servermessage'>"+this.serverMessage+"</span><span class='ui-li-count'>"+this.amount+count+"</span></a></li>").on("click", function() { that.editMe("old"); });
			$("#oldersightings").append(output);
		break;
		case "submitlist":
			var count = " count";
			if(this.amount > 1) { count = " counts"; }
			var output = "<li id='"+what+this.submitlistItem+"' data-icon='false'><a href='#'><img class='bf_image' src='images/"+this.bf_images[this.name]+"'/><span class='bf_info'>"+this.name+"</span><div class='floatingBarsG'><div class='blockG' id='rotateG_01'></div><div class='blockG' id='rotateG_02'></div><div class='blockG' id='rotateG_03'></div><div class='blockG' id='rotateG_04'></div><div class='blockG' id='rotateG_05'></div><div class='blockG' id='rotateG_06'></div><div class='blockG' id='rotateG_07'></div><div class='blockG' id='rotateG_08'></div></div><div class='result'></div><span class='ui-li-count'>"+this.amount+count+"</span></a></li>";
			$("#submitlist").append(output);
		break;
		default:
	}
}

function countMe() {
	try {
		this.amount++;
		$("#bf_"+this.id).text(this.amount);
		if(!this.myPosition.isSet) {
			this.myPosition.latitude = Butterflyapp.prototype.currentPosition.latitude;
			this.myPosition.longitude = Butterflyapp.prototype.currentPosition.longitude;
			this.myPosition.isSet = true;
		}
		if(!this.inBasket) {
			var d = new Date();
			var hours = "" + d.getHours();
			if(hours.length == 1) { hours = "0" + hours; }
			var minutes = "" + d.getMinutes();
			if(minutes.length == 1) { minutes = "0" + minutes; }
			var seconds = d.getSeconds();
			if(seconds.length == 1) { seconds = "0" + seconds; }
			this.time = hours + ":" + minutes + ":" + seconds;
			this.date = Butterflyapp.prototype.date;
			var oldlength = Butterflyapp.prototype.basket.length;
			this.positionInBasket = oldlength;
			var that = this;
			var newlength = Butterflyapp.prototype.addToBasket.call(this, that);
			if(oldlength < newlength) {
				this.inBasket = true;
			} else {
				throw "insert_err";
			}
		}
	} catch(e) {
		var errormsg = "";
		if(e == "insert_err") { errormsg += "An error occurred while trying to insert the new sighting into the basket."; }
		else { errormsg += e.message; }
		alert(errormsg);
	}
}

function submitResult(result, that, what) {
	var response = result.toLowerCase();
	var adjust_positions = false;
	var style = "";
	if(response == "success") {
		style = "ok";
		that.serverMessage = "Upload was successfully.";
		// after upload was successful, remove item from basket/olderSightings and localStorage:
		if(what == "new") {
			if(that.positionInBasket < Butterflyapp.prototype.basket.length-1) {
				adjust_positions = true;
				var i = that.positionInBasket;
			}
			// remove current item from basket:
			var oldlength = Butterflyapp.prototype.basket.length;
			Butterflyapp.prototype.basket.splice(0,1);
			var newlength = Butterflyapp.prototype.basket.length;
			if(newlength < oldlength) {
				that.positionInBasket = null;
				if(adjust_positions) {
					for(i; i < Butterflyapp.prototype.basket.length; i++) {
						Butterflyapp.prototype.basket[i].positionInBasket = i;
					}
				 }
			}
			// if basket not empty, upload next item:
			if(Butterflyapp.prototype.basket.length) {
				Butterflyapp.prototype.basket[0].uploadMe("new");
			}
		} else {
			// adjust the position properties of every bf item in olderSightings and localStorage if necessary:
			if(typeof(Storage) !== "undefined") {
				var sightings = JSON.parse(window.localStorage.getItem("sightings"));

				var diff_length = sightings.length - Butterflyapp.prototype.olderSightings.length;
				var diff_pos = that.positionInStorage - that.positionInOlderSightings;
				// make sure both arrays and positions of bf item stored in them are equal:
				if(!diff_length && !diff_pos) {
					if(that.positionInOlderSightings < Butterflyapp.prototype.olderSightings.length-1) {
						adjust_positions = true;
						var i = that.positionInOlderSightings;
					}
					// delete from older sightings ...:
					var oldlength_os = Butterflyapp.prototype.olderSightings.length;
					Butterflyapp.prototype.olderSightings.splice(that.positionInOlderSightings,1);
					var newlength_os = Butterflyapp.prototype.olderSightings.length;
					// ... and local storage:
					var oldlength_ls = sightings.length;
					sightings.splice(that.positionInStorage,1);
					var newlength_ls = sightings.length;
					if((newlength_os < oldlength_os) && (newlength_ls < oldlength_ls)) {
						if(adjust_positions) {
							for(i; i < Butterflyapp.prototype.olderSightings.length; i++) {
								Butterflyapp.prototype.olderSightings[i].positionInOlderSightings = i;
								sightings[i].positionInOlderSightings = i;
								Butterflyapp.prototype.olderSightings[i].positionInStorage = i;
								sightings[i].positionInStorage = i;
							}
						}
					} else {
						throw "erase_err";
					}
				} else {
					throw "diff_err";
				}
			} else {
				throw "locstor_err";
			}
			window.localStorage.setItem("sightings",JSON.stringify(sightings));
			// if still older sightings exist, upload them:
			if(Butterflyapp.prototype.olderSightings.length) {
				Butterflyapp.prototype.olderSightings[0].uploadMe("old");
			}
		}
	} else {
		style = "error";
		that.errorCode.server = true;
		that.serverMessage = result;
		if(what == "new") {
			var adjust_positions = false;
			if(that.positionInBasket < Butterflyapp.prototype.basket.length-1) {
				adjust_positions = true;
				var i = that.positionInBasket;
			}
			// remove this sighting from basket:
			var oldlength = Butterflyapp.prototype.basket.length;
			Butterflyapp.prototype.basket.splice(0,1);
			var newlength = Butterflyapp.prototype.basket.length;

			if(newlength < oldlength) {
				//Butterflyapp.prototype.itemsToUpload--;
				that.positionInBasket = null;
				if(adjust_positions) {
					for(i; i < Butterflyapp.prototype.basket.length; i++) {
						Butterflyapp.prototype.basket[i].positionInBasket = i;
					}
				 }
			}
			// determine position of current item in olderSightings array before storing:
			that.positionInOlderSightings = Butterflyapp.prototype.olderSightings.length;
			// store a copy of current bf sighting:
			that.storeMe();
			Butterflyapp.prototype.olderSightings.push(that);
			// if there still some items exist in the basket, upload them:
			if(Butterflyapp.prototype.basket.length) {
				// try to upload next sighting:
				Butterflyapp.prototype.basket[0].uploadMe("new");
			}
		// changelog 30/11/12: also try to upload the next sightings from older sightings:
		} else {
			if(that.positionInOlderSightings < Butterflyapp.prototype.olderSightings.length-1) {
				// try to upload next old item:
				var i = that.positionInOlderSightings;
				i++;
				Butterflyapp.prototype.olderSightings[i].uploadMe("old");
			}
		}
	}
	$("#"+what+that.submitlistItem+" div.floatingBarsG").css("display","none");
	$("#"+what+that.submitlistItem+" div.result").css("background-image","url('images/"+style+".png')");
	$("#submitlist").listview("refresh");
}

function upload(data, callback, that, what) {
	$.ajax({
		url: 'http://192.168.1.22/bfsighting.php',
		type: 'POST',
		async: true,
		data: data,
		complete: function(jqXHR, textStatus) {
			callback(textStatus, that, what);
		}
	});
}

function uploadMe(what) {
	try {
		var position_valid = true;
		var adjust_positions = false;
		if(!this.validateMyPosition()) {
			// try to determine the correct position now:
			Butterflyapp.prototype.getPosition();
			if(Butterflyapp.prototype.currentPosition.latitude != false && Butterflyapp.prototype.currentPosition.longitude != false) {
				this.myPosition.latitude = Butterflyapp.prototype.currentPosition.latitude;
				this.myPosition.longitude = Butterflyapp.prototype.currentPosition.longitude;
				this.errorCode.position = false;
			} else {
				position_valid = false;
			}
		}
		if(position_valid) {
			// check if a network connection is available:
			if(Butterflyapp.prototype.checkConnection()) {
				var that = this.cloneMe();
				var data = "name=" + this.getName() + "&" +
				"amount=" + this.getAmount() + "&" +
				"date=" + this.getDate() + "&" +
				"time=" + this.getTime() + "&" +
				"latitude=" + this.myPosition.latitude + "&" +
				"longitude=" + this.myPosition.longitude;
				// try to submit the bf object:
				upload(data, this.submitResult, that, what);	
			} else {
				this.errorCode.network = true;
				this.serverMessage = "No network connection";
				if(what == "new") {
					if(this.positionInBasket < Butterflyapp.prototype.basket.length-1) {
						adjust_positions = true;
						var i = this.positionInBasket;
					}
					// remove current item from basket:
					var oldlength = Butterflyapp.prototype.basket.length;
					Butterflyapp.prototype.basket.splice(0,1);
					var newlength = Butterflyapp.prototype.basket.length;
					if(newlength < oldlength) {
						this.positionInBasket = null;
						if(adjust_positions) {
							for(i; i < Butterflyapp.prototype.basket.length; i++) {
								Butterflyapp.prototype.basket[i].positionInBasket = i;
							}
						 }
					}
					// determine position of current item in olderSightings array before storing:
					this.positionInOlderSightings = Butterflyapp.prototype.olderSightings.length;
					// store a copy of current bf sighting:
					var tmp = this.cloneMe();
					tmp.storeMe();
					Butterflyapp.prototype.olderSightings.push(tmp);
					if(Butterflyapp.prototype.basket.length) {
						// try to upload next sighting:
						Butterflyapp.prototype.basket[0].uploadMe("new");
					}
				// changelog 30/11/12: also try to upload the next sightings from older sightings:
				} else {
					if(this.positionInOlderSightings < Butterflyapp.prototype.olderSightings.length-1) {
						// try to upload next old item:
						var i = this.positionInOlderSightings;
						i++;
						Butterflyapp.prototype.olderSightings[i].uploadMe("old");
					}
				}
				$("#"+what+this.submitlistItem+" div.floatingBarsG").css("display","none");
				$("#"+what+this.submitlistItem+" div.result").css("background-image","url('images/error.png')");
				$("#submitlist").listview("refresh");
			}
		} else {
			this.errorCode.position = true;
			this.serverMessage = "Invalid position";
			if(what == "new") {
				if(this.positionInBasket < Butterflyapp.prototype.basket.length-1) {
					adjust_positions = true;
					var i = this.positionInBasket;
				}
				var oldlength = Butterflyapp.prototype.basket.length;
				Butterflyapp.prototype.basket.splice(0,1);
				var newlength = Butterflyapp.prototype.basket.length;
				if(newlength < oldlength) {
					this.positionInBasket = null;
					if(adjust_positions) {
						for(i; i < Butterflyapp.prototype.basket.length; i++) {
							Butterflyapp.prototype.basket[i].positionInBasket = i;
						}
					 }
				}
				// determine position of current item in olderSightings array before storing:
				this.positionInOlderSightings = Butterflyapp.prototype.olderSightings.length;
				// store a copy of current bf sighting:
				var tmp = this.cloneMe();
				tmp.storeMe();
				Butterflyapp.prototype.olderSightings.push(tmp);
				if(Butterflyapp.prototype.basket.length) {
					// try to upload next sighting:
					Butterflyapp.prototype.basket[0].uploadMe("new");
				}
			// changelog 30/11/12: also try to upload the next sightings from older sightings:
			} else {
				if(this.positionInOlderSightings < Butterflyapp.prototype.olderSightings.length-1) {
					// try to upload next old item:
					var i = this.positionInOlderSightings;
					i++;
					Butterflyapp.prototype.olderSightings[i].uploadMe("old");
				}
			}
			$("#"+what+this.submitlistItem+" div.floatingBarsG").css("display","none");
			$("#"+what+this.submitlistItem+" div.result").css("background-image","url('images/error.png')");
			$("#submitlist").listview("refresh");
		}
		// reset the bf item again for next sighting session:
		if(what == "new") {
			this.resetMe();
		}
	} catch(e) {
		var errormsg = "Upload failed.\n" + e.message;
		alert(errormsg);
	}
}

function storeMe() {
	try {
		if(typeof(Storage) !== undefined) {
			if(window.localStorage.getItem("sightings") === null) {
				var sightings = new Array();
			} else {
				var sightings = JSON.parse(window.localStorage.getItem("sightings"));
			}
			// store the bf items that couldn't be submitted:
			var position = sightings.length;
			this.positionInStorage = position;
			sightings.push(this);
			window.localStorage.setItem("sightings",JSON.stringify(sightings));
		} else {
			throw "storage_err";
		}
	} catch(e) {
		var errormsg = "Storing failed.\n";
		if(e == "storage_err") {
			errormsg += "Local storage is not supported on the device.";
		} else {
			errormsg += e.message;
		}
		alert(errormsg);
	}
}

function editMe(what) {
	// make sure edit array is empty:
	var len = Butterflyapp.prototype.editSighting.length;
	while(len--) {
		Butterflyapp.prototype.editSighting.pop();
	}
	var that = {me: this, status: what};
	Butterflyapp.prototype.editSighting.push(that);
}

function resetMe() {
	this.positionInStorage = null;
	this.positionInBasket = null;
	this.positionInOlderSightings = null;
	this.amount = 0;
	this.date = false;
	this.time = false;
	this.myPosition = {"latitude":false,"longitude":false,"isSet":false};
	this.inBasket = false;
	this.errorCode = {"position":false,"network":false,"server":false};
	this.serverMessage = false;
}

function setInfoMessage(message) {
	this.infomessage = message;
}

function getName() { return this.name; }
function getAmount() { return this.amount; }
function getMyPosition() {
	var mypos = this.myPosition.latitude+","+this.myPosition.longitude;
	return mypos;
}

function getDate() { return this.date; }
function getTime() { return this.time; }

function validateMyPosition() {
	if(this.myPosition.latitude != false && this.myPosition.longitude != false) {
		return true;
	} else {
		return false;	
	}
}

function cloneMe() {
	var newMe = {};
	for(i in this) {
		if(this[i] && typeof(this[i]) == "object") {
			newMe[i] = jQuery.extend(true, {}, this[i]);
		} else {
			newMe[i] = this[i];
		}
	}
	return newMe;
}
