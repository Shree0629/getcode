var auto_amount = auto_amount_var = auto_condition = auto_game = 0;
var number_bet_done = 0;
var number_rolls = 0;
var on_win = "";
var pourc_on_win = 0;
var on_lose = "";
var pourc_on_lose = 0;		
var autobet_mode = false;
var autobet_stop = false;
var unlimited_bet = true;

var auto_stats_won = 0;
var auto_stats_lost = 0;
var auto_stats_lucky = 0;
var auto_stats_wagered = 0;
var auto_stats_profit = 0;

$("#btn-bet-dice").on("click", function() {	
	if (button_max_clicked == true) {	
		$("#btn-bet-dice").html("ALL IN - ARE YOU SURE?");
		button_max_clicked = false;		
	}
	else {
		$("#btn-bet-dice, #btn-bet-start-pilot-dice, #btn-bet-start-fast-dice").button("loading");
		play();
	}
});

$("#btn-bet-start-pilot-dice").on("click", function() {	
	if (button_max_clicked == true) {	
		$("#btn-bet-start-pilot-dice").html("ALL IN - ARE YOU SURE?");
		button_max_clicked = false;		
	}
	else {
		autobet_mode = true;
		autobet_stop = false;
		
		$("#btn-bet-dice, #btn-bet-start-fast-dice").button("loading");
		$("#btn-bet-start-pilot-dice").hide();
		$("#btn-bet-stop-pilot-dice").show();
		
		if ($('#limit-rolls-checkbox').is(':checked'))
			number_rolls = parseInt($('#limit-rolls-input').val());
		else
			number_rolls = 0;
		
		if ($.trim(number_rolls) == "" || number_rolls < 0)
			number_rolls = 0;
		
		if (number_rolls == 0)
			unlimited_bet = true;
		else
			unlimited_bet = false;
		
		number_rolls_total = number_rolls;
		
		if ($('#id-bet-on-win').is(':checked')) {
			on_win = "id-bet-win";				
			pourc_on_win = $('#pourc-bet-on-win').val();
			
			if ($.trim(pourc_on_win) == "")
				pourc_on_win = 0;
			
			if (parseFloat(pourc_on_win) == 0)
				on_win = "return-base-win";
		}
		else {
			on_win = "return-base-win";
		}
		
		on_lose = "";
		if ($('#id-bet-on-lose').is(':checked')) {
			on_lose = "id-bet-lose";				
			pourc_on_lose = $('#pourc-bet-on-lose').val();
			
			if ($.trim(pourc_on_lose) == "")
				pourc_on_lose = 0;
			
			if (parseFloat(pourc_on_lose) == 0)
				on_lose = "return-base-lose";
		}
		else {
			on_lose = "return-base-lose";
		}
		
		auto_amount = auto_amount_var = $("#amount").val();	
		auto_condition = $("#condition-input").val();
		auto_game = $("#game-input").val();
		
		auto_stats_won = 0;
		auto_stats_lost = 0;
		auto_stats_lucky = 0;
		auto_stats_wagered = 0;
		auto_stats_profit = 0;
		
		play();	
	}
});


$("#btn-bet-stop-pilot-dice").on("click", function() {	
	stop_pilot_mode_ask();
});

function stop_pilot_mode_ask() {
	$("#btn-bet-stop-pilot-dice").button('loading');	
	autobet_stop = true;
}

function stop_pilot_mode() {	
	autobet_stop = false;
	autobet_mode = false;
	
	$("#btn-bet-start-pilot-dice").show();

	$("#btn-bet-stop-pilot-dice").button('reset');		
	$("#btn-bet-stop-pilot-dice").hide();	
	
	$("#btn-bet-dice, #btn-bet-start-fast-dice").button("reset");
	
	update_stats_auto();
	
	auto_stats_won = 0;
	auto_stats_lost = 0;
	auto_stats_lucky = 0;
	auto_stats_wagered = 0;
	auto_stats_profit = 0;
	
	number_bet_done = 0;			
	on_win = "";
	pourc_on_win = 0;
	on_lose = "";
	pourc_on_lose = 0;		
}

var bet_nb_errors = 0;
function play() {		
	if (game_in_progress == true) {
		$("#btn-bet-dice, #btn-bet-start-pilot-dice, #btn-bet-start-fast-dice").button("reset");
		return false;
	}
	
	game_in_progress = true;
	
	if (autobet_mode == false) {
		var amount = $("#amount").val();
		var condition = $("#condition-input").val();
		var game = $("#game-input").val();
	}
	else {
		var amount = auto_amount;
		var condition = auto_condition;
		var game = auto_game;
	}
	
	amount = round_float(amount, devise_decimal);
	
	var profit = parseFloat($("#profit").val());
	var balance = parseFloat($("#balance-"+devise).val());
	var error = false;
	var error_value = "";
	var error_title = "";
	var error_info = "";
	
	if (profit > profit_max) {
		error_title = "Maximum profit exceeded";
		error_info = "Maximum profit: "+number_format(profit_max, devise_decimal);		
		error_value = "Maximum profit exceeded - Maximum profit: "+number_format(profit_max, devise_decimal);
		error = true;
	}	
	else if (amount > balance) {
		error_title = "Bet amount";
		error_info = "Maximum bet: "+number_format(balance, devise_decimal);		
		error_value = "Bet amount - Maximum bet: "+number_format(balance, devise_decimal);
		error = true;
	}		
	else if (amount > bet_max) {
		error_title = "Bet amount";
		error_info = "Maximum bet: "+number_format(bet_max, devise_decimal);		
		error_value = "Bet amount - Maximum bet: "+number_format(bet_max, devise_decimal);
		error = true;
	}	
	else if (amount < bet_min) {
		error_title = "Bet amount";
		error_info = "Minimum bet: "+number_format(bet_min, devise_decimal);
		error_value = "Bet amount - Minimum bet: "+number_format(bet_min, devise_decimal);
		error = true;
	}
	
	if (error == true) {
		game_in_progress = false;
		$("#btn-bet-dice, #btn-bet-start-pilot-dice, #btn-bet-start-fast-dice").button("reset");
		
		if (autobet_mode == true) {
			if (number_bet_done >= 1) {
				$("#modal-stop-autobet-numbers").html(number_bet_done);
				$("#modal-stop-autobet-value").html(error_value);
				$("#modal-stop-autobet-reason").modal("show");	
			}	
			else {
				showErrorNotification(error_title, error_info);
			}
			
			stop_pilot_mode();	
		}
		else {
			showErrorNotification(error_title, error_info);
		}
		
		return;
	}
	
	$.ajax({
		type: "POST",
		url: server_front_name+"/api/bet",			
		data: {
			access_token		:		access_token,
			username			:		user_username,
			type					:			"dice",
			amount				:		amount,
			condition			:			condition,
			game					:		game,
			devise					:		devise
		},
		success: function(text) {			
			var val = JSON.parse(text);	
			if (val.return.success == 'true') {		
				bet_nb_errors = 0;
				
				var username = val.return.username;
				var id = val.return.id;
				var type = val.return.type;							
				var devise = val.return.devise;
				var ts = val.return.ts;
				var time = val.return.time;
				var winning_chance = val.return.winning_chance;
				var roll_number = val.return.roll_number;
				var amount_return = val.return.amount_return;
				var new_balance = val.return.new_balance;							
				var show = val.return.show;
				var amount = val.return.amount;
				var condition = val.return.condition;
				var game = val.return.game;
				var payout = val.return.payout;
				
				$("#won-bet span").html(amount_return);
				$("#won-bet span").removeClass("text-danger text-success");
				if (amount_return >= 0)	{							
					$("#won-bet span").addClass("text-success");
					$("#won-bet span").html("+"+number_format(round_float(amount_return, 8), 8));
				}
				else {
					$("#won-bet span").addClass("text-danger");
					$("#won-bet span").html(number_format(round_float(amount_return, 8), 8));
				}
				show_result_bet();
								
				$("#balance-"+devise).val(round_float(new_balance, 12));		
				
				if (amount_return >= 0)	
					$(".balance-"+devise+"-html").addClass("result-bet-win");
				else
					$(".balance-"+devise+"-html").addClass("result-bet-lose");
				
				$(".balance-"+devise+"-html").html(round_float(new_balance, 8));
				
				if (amount_return >= 0)	
					setTimeout(function() {	$(".balance-"+devise+"-html").removeClass("result-bet-win");	}, 350);
				else
					setTimeout(function() {	$(".balance-"+devise+"-html").removeClass("result-bet-lose");	}, 350);
				
				addBetHistory("my-bets", type, id, username, time, amount, devise, winning_chance, roll_number, amount_return, condition, game, payout);
								
				var notifications = val.return.notifications;					
				for (var prop in notifications) {		
					if (notifications[prop].name == "rcvJackpotDice")
						rcvJackpotDice(notifications[prop]);					
					else {
						rcvnotificationbet(notifications[prop]);							
					}
				}
								
				var time_delay = getTimeDelay("dice", devise, amount, winning_chance);				
								
				if (autobet_mode == false) {		
					setTimeout(function() {					
						$("#btn-bet-dice, #btn-bet-start-pilot-dice, #btn-bet-start-fast-dice").button("reset");
					}, time_delay);
				}
				else {
					number_bet_done++;	
																
					if (unlimited_bet == false) {
						number_rolls--;
						$("#limit-rolls-input").val(number_rolls);
						
						var pourcBarre = ((number_rolls_total-number_rolls)/number_rolls_total)*100;
						$("#progress-bar-pilot-mode div").css("width", pourcBarre+"%");
					}
					
					if (amount_return >= 0) {
						auto_stats_won++;									
					}
					else {
						auto_stats_lost++;
					}
					
					auto_stats_lucky = ((((parseInt(auto_stats_won)/parseInt(number_bet_done))*100)/parseFloat(winning_chance))*100).toFixed(2);
					
					auto_stats_wagered = parseFloat(auto_stats_wagered)+parseFloat(amount);
					auto_stats_profit = parseFloat(auto_stats_profit)+parseFloat(amount_return);
					
					if (on_win == "id-bet-win" && amount_return >= 0) {									
						auto_amount = parseFloat(auto_amount)+parseFloat(auto_amount*(pourc_on_win/100));	
					}
					else if (amount_return >= 0) {
						auto_amount = auto_amount_var;
					}
					
					if (on_lose == "id-bet-lose" && amount_return < 0) {									
						auto_amount = parseFloat(auto_amount)+parseFloat(auto_amount*(pourc_on_lose/100));
					}
					else if (amount_return < 0) {
						auto_amount = auto_amount_var;
					}
					
					var tmp = Math.pow(10, 8);
					auto_amount = Math.round(auto_amount*tmp)/tmp;
										
					update_stats_auto();
					
					if ((number_bet_done < number_rolls_total) || unlimited_bet == true) {	
						var speed_bet_val = $("#speed-bet").val();
						if (speed_bet_val == 20)
							var time_by_bet = parseInt(time_delay*15);
						else if (speed_bet_val == 40)
							var time_by_bet = parseInt(time_delay*10);
						else if (speed_bet_val == 60)
							var time_by_bet = parseInt(time_delay*5);
						else
							var time_by_bet = parseInt(time_delay);
						
						if (autobet_stop == false) {
							setTimeout(function() {	play();	}, time_by_bet);
						}
						else {								
							stop_pilot_mode();
						}
					}
					else {
						stop_pilot_mode();
					}					
				}	
				
				game_in_progress = false;
				
				if (val.return.event == true) {				
					socket.emit("event", {});
				}
			}
			else {	
				game_in_progress = false;
				
				if (val.return.type != "abort") {			
					if (autobet_mode == false) {
						showErrorNotification(val.return.value, val.return.info);
						$("#btn-bet-dice, #btn-bet-start-pilot-dice, #btn-bet-start-fast-dice").button("reset");						
					}
					else {
						if (number_bet_done >= 1) {
							$("#modal-stop-autobet-numbers").html(number_bet_done);
							$("#modal-stop-autobet-value").html(val.return.value);
							$("#modal-stop-autobet-reason").modal("show");	
						}	
						else {
							showErrorNotification(val.return.value, val.return.info);
						}
						
						stop_pilot_mode();	
					}						
				}
				else {
					if (bet_nb_errors >= 2) {				
						bet_nb_errors = 0;
						if (autobet_mode == false) {
							showErrorNotification(val.return.value, val.return.info);
							$("#btn-bet-dice, #btn-bet-start-pilot-dice, #btn-bet-start-fast-dice").button("reset");						
						}
						else {
							if (number_bet_done >= 1) {
								$("#modal-stop-autobet-numbers").html(number_bet_done);
								$("#modal-stop-autobet-value").html(val.return.value);
								$("#modal-stop-autobet-reason").modal("show");	
							}	
							else {
								showErrorNotification(val.return.value, val.return.info);
							}
							
							stop_pilot_mode();	
						}
						
					}
					else {
						bet_nb_errors++;
						setTimeout(function() {	play();	}, 1000);
					}
				}
				
			}

		},
		error:		function (xhr, ajaxOptions, thrownError)	{game_in_progress = false;setTimeout(function() {	play();	}, 1000);},
		timeout:	function (xhr, ajaxOptions, thrownError)	{game_in_progress = false;setTimeout(function() {	play();	}, 1000);},
		abort:	function (xhr, ajaxOptions, thrownError)	{game_in_progress = false;setTimeout(function() {	play();	}, 1000);}
	});
			
}

/* FAST DICE */
$('#btn-bet-start-fast-dice').on('click', function () {		
	play_flash_bet();
});

function play_flash_bet() {	
	if (button_max_clicked == true) {		
		$("#btn-bet-start-fast-dice").html("ALL IN - ARE YOU SURE?");
		button_max_clicked = false;
		return false;
	}
	
	if (game_in_progress == true) {
		$("#btn-bet-dice, #btn-bet-start-pilot-dice, #btn-bet-start-fast-dice").button("reset");
		return false;	
	}
	
	game_in_progress = true;
	$("#btn-bet-start-fast-dice, #btn-bet-dice, #btn-bet-start-pilot-dice").button("loading");
	
	var rolls_number = $("#rolls-number").val();	
	var amount = $("#amount").val();
	var condition = $("#condition-input").val();
	var game = $("#game-input").val();
	
	amount = round_float(amount, devise_decimal);
	
	var profit = parseFloat($("#profit").val());
	var balance = parseFloat($("#balance-"+devise).val());
	var error = false;
		
	if (profit > profit_max) {
		showErrorNotification("Maximum profit exceeded", "Maximum profit: "+number_format(profit_max, devise_decimal));		
		error = true;
	}	
	else if (amount > balance) {
		showErrorNotification("Bet amount", "Maximum bet: "+number_format(balance, devise_decimal));		
		error = true;
	}		
	else if (amount > bet_max) {
		showErrorNotification("Bet amount", "Maximum bet: "+number_format(bet_max, devise_decimal));		
		error = true;
	}	
	else if (amount < bet_min) {
		showErrorNotification("Bet amount", "Minimum bet: "+number_format(bet_min, devise_decimal));		
		error = true;
	}
	
	if (error == true) {
		game_in_progress = false;			
		$("#btn-bet-dice, #btn-bet-start-pilot-dice, #btn-bet-start-fast-dice").button("reset");
		return;
	}
	
	if ($('#id-bet-on-win-flash').is(':checked')) {
		on_win = "true";				
		pourc_on_win = parseFloat($('#pourc-bet-on-win-flash').val());
		
		if ($.trim(pourc_on_win) == "")
			pourc_on_win = 0;
	}
	else {
		on_win = "false";
	}
	
	on_lose = "";
	if ($('#id-bet-on-lose-flash').is(':checked')) {
		on_lose = "true";				
		pourc_on_lose = parseFloat($('#pourc-bet-on-lose-flash').val());
		
		if ($.trim(pourc_on_lose) == "")
			pourc_on_lose = 0;
	}
	else {
		on_lose = "false";
	}
	
	$.ajax({
		type: "POST",
		url: server_front_name+"/api/bet-boost-dice",		
		data: {
			access_token			:	access_token,
			username				:	user_username,
			type						:	"dice",
			rolls_number			:	rolls_number,
			amount					:	amount,
			condition				:	condition,
			game						:	game,
			return_base_lose		:	on_lose,
			return_base_win		:	on_win,
			pourc_bet_on_win	:	pourc_on_win,
			pourc_bet_on_lose	:	pourc_on_lose,
			devise					:	devise
		},
		success: function(text) {	
			var val = JSON.parse(text);	
			if (val.return.success == 'true') {
				
				for(var i = 0; i < val.return.bets_id.length; i++) {
					$("#result-bets-select").append("<option value='"+val.return.bets_id[i]+"'>"+val.return.bets_id[i]+"</option>");	
				}
				
				var bets_profit = val.return.bets_profit;
				if (bets_profit != 0) {
					var new_balance = val.return.new_balance;
					
					$("#won-bet span").html(bets_profit);
					$("#won-bet span").removeClass("text-danger text-success");
					if (bets_profit >= 0)	{							
						$("#won-bet span").addClass("text-success");
						$("#won-bet span").html("+"+number_format(round_float(bets_profit, 8), 8));
					}
					else {
						$("#won-bet span").addClass("text-danger");
						$("#won-bet span").html(number_format(round_float(bets_profit, 8), 8));
					}
					show_result_bet();
										
					$("#balance-"+devise).val(round_float(new_balance, 12));		
					$(".balance-"+devise+"-html").html(round_float(new_balance, 8));						
				}
				
				$("#speed-betting").html(val.return.speed_betting);
				
				$("#speed-bets-won").html(val.return.bets_won);
				$("#speed-bets-lost").html(val.return.bets_lost);
				$("#speed-bets-wagered").html(number_format(round_float(val.return.bets_wagered, 8), 8));
				$("#speed-bets-profit").html(number_format(round_float(bets_profit, 8), 8));
				$("#speed-bets-lost").html(val.return.bets_lost);
				
				$("#speed-bets-lucky").html(val.return.bets_lucky+"%");
						
				addFlashBetHistory("my-", user_username, val.return.ts_bet, val.return.devise, number_format(round_float(val.return.bets_wagered, 8), 8), val.return.game, val.return.payout, val.return.rolls_number_played, number_format(round_float(bets_profit, 8), 8));
				
				var notifications = val.return.notifications;					
				for (var prop in notifications) {		
					if (notifications[prop].name == "rcvJackpotDice")
						rcvJackpotDice(notifications[prop]);					
					else {
						rcvnotificationbet(notifications[prop]);							
					}
				}
				
				socket.emit("event", {});
				
				$("#modal-fast-dice-result").modal("show");				
			}
			else {		
				showErrorNotification(val.return.value, val.return.info);
				
				if (autobet_mode == false)
					$("#btn-bet-dice").button("reset");					
				else
					stop_pilot_mode();		
			}
				
			game_in_progress = false;
			$("#btn-bet-start-fast-dice, #btn-bet-dice, #btn-bet-start-pilot-dice").button("reset");
		},
		error:		function (xhr, ajaxOptions, thrownError)	{game_in_progress = false;setTimeout(function() {	play_flash_bet();	}, 1000);},
		timeout:	function (xhr, ajaxOptions, thrownError)	{game_in_progress = false;setTimeout(function() {	play_flash_bet();	}, 1000);},
		abort:	function (xhr, ajaxOptions, thrownError)	{game_in_progress = false;setTimeout(function() {	play_flash_bet();	}, 1000);}
	});
}

$('#speed-bet-selected').on('click', function () {	
	var bet_id = $("#result-bets-select").val();	
	get_infos_bet(bet_id);
});

var hotkeys = "disabled";
$('#btn-hotkeys').on('click', function () {	
	if (hotkeys == "disabled") {
		hotkeys = "enabled";
		$("#modal-hot-keys").modal("show");		
		
		$("#btn-hotkeys").html('<i class="fa fa-keyboard-o"></i> Disabled Hotkeys');
	}
	else {
		hotkeys = "disabled";
		$("#btn-hotkeys").html('<i class="fa fa-keyboard-o"></i> Enabled Hotkeys');
	}
});

/* Hotkeys */
$(document).keypress(function(e) {		
	var modalVisible = $('.modal.fade').filter(function() {
        return $(this).css('display') !== 'none';
	}).length;
	
	if ((hotkeys == "enabled") && (modalVisible == 0) && (!$("#message").is(":focus"))) {		
		/* H */
		if (e.which == 104) {			
			var_condition = "<";
			roll_by_condition();
			return false;
		}
		
		/* L */
		if (e.which == 108) {
			var_condition = ">";
			alert("lol");
			roll_by_condition();
			return false;
		}
		
		/* X */
		if (e.which == 120) {			
			var amount = parseFloat($("#amount").val());
			amount = round_float(amount/2, devise_decimal);			
			$("#amount").val(amount);
			window['var_amount'] = amount;	
			calculate_profit();
			return false;
		}
		
		/* C */
		if (e.which == 99) {			
			var amount = parseFloat($("#amount").val());
			amount = round_float(amount*2, devise_decimal);			
			$("#amount").val(amount);
			window['var_amount'] = amount;
			calculate_profit();
			return false;
		}			
	}
});

var night_mode = false;
$('.btn-night-mode').on('click', function () {			
	if (night_mode == false) {				
		$("#container").addClass("night-mode");
		$("#dice-theme").hide();
		night_mode = true;
		
		$.cookie("night_mode", 1, { expires : 30 });
	}	
	else {		
		$("#container").removeClass("night-mode");
		$("#dice-theme").show();
		night_mode = false;
		
		$.removeCookie("night_mode");
	}
});

$("#amount").keyup(function() {
	var amount = parseFloat($(this).val());
	amount = round_float(amount, devise_decimal);			
	
	if (devise == "btc")
		var base = 0.00001000;
	else if (devise == "eth")
		var base = 0.00050000;
	else if (devise == "ltc")
		var base = 0.00150000;
	else if (devise == "doge")
		var base = 20.00000000;
	
	$("#rolls-number option").attr("disabled", true);
	if (amount >= (base*10)) {
		$("#rolls-number option").attr("disabled", false);
	}	
	else if (amount >= (base*8)) {		
		$("#rolls-number-200, #rolls-number-500, #rolls-number-1000, #rolls-number-2000").attr("disabled", false);
	}
	else if (amount >= (base*4)) {		
		$("#rolls-number-500, #rolls-number-1000, #rolls-number-2000").attr("disabled", false);
	}
	else if (amount >= (base*2)) {		
		$("#rolls-number-1000, #rolls-number-2000").attr("disabled", false);
	}
	else if (amount >= base) {
		$("#rolls-number-2000").attr("disabled", false);
	}
	
	calculate_profit();
	
	reset_button_max_clicked();
});

function calculate_profit() {
	var amount = $.trim($("#amount").val());
	var payout = $.trim($("#editable-payout-field").val());
	
	if (amount != "") {
		var profit = round_float(parseFloat((payout*amount)-amount), devise_decimal);
		$("#profit").val(profit);
	}
	else 
		$("#profit").val(Number(0).toFixed(devise_decimal));
}

function roll_by_condition() {	
	var condition = $.trim($("#condition-input").val());	
	var chance = $.trim($("#editable-chance-field").val());
	
	if (condition == "<") {		
		var game = (100-parseFloat(chance)-0.01).toFixed(2);		
		$("#updated_condition").html(">"+game+' <i class="fa fa-exchange" style="font-size:12px"></i>');
		$("#condition-text").html("ROLL OVER<span class='hidden-xs'> TO WIN</span>");
		$("#condition-input").val(">");
	}
	else {
		var game = parseFloat(chance).toFixed(2);
		$("#updated_condition").html("<"+game+' <i class="fa fa-exchange" style="font-size:12px"></i>');
		$("#condition-text").html("ROLL UNDER<span class='hidden-xs'> TO WIN</span>");		
		$("#condition-input").val("<");
	}
	
	$("#game-input").val(game);
}

function roll_by_payout(value) {
	var condition = $.trim($("#condition-input").val());
	
	var chance = (100/value);
	chance = chance-(chance*(edge_dice/100));
	
	$("#editable-chance").html(parseFloat(chance).toFixed(2)+"%"+' <i class="hidden-xs fa fa-pencil" style="font-size:12px"></i>');			
	$("#editable-chance-field").val(parseFloat(chance).toFixed(2));
	
	if (condition == "<") {	
		var game = parseFloat(chance).toFixed(2);
		$("#updated_condition").html("<"+parseFloat(chance).toFixed(2)+' <i class="hidden-xs fa fa-exchange" style="font-size:12px"></i>');
	}
	else {	
		var game = parseFloat((100-chance-0.01)).toFixed(2);
		$("#updated_condition").html(">"+parseFloat((100-chance-0.01)).toFixed(2)+' <i class="hidden-xs fa fa-exchange" style="font-size:12px"></i>');				
	}	
	
	$("#game-input").val(game);
	calculate_profit();
}

function roll_by_chance(value) {	
	var chance = value;
	var condition = $.trim($("#condition-input").val());
	
	var payout = (100/value);
	payout = payout-(payout*(edge_dice/100));
	
	var value = parseFloat(payout);
	if (value < 1000) 
		value = value.toFixed(4);
	
	$("#editable-payout").html(value+"x"+' <i class="hidden-xs fa fa-pencil" style="font-size:12px"></i>');			
	$("#editable-payout-field").val(value);
	
	if (condition == "<") {			
		var game = parseFloat(chance).toFixed(2);
		$("#updated_condition").html("<"+parseFloat(chance).toFixed(2)+' <i class="hidden-xs fa fa-exchange" style="font-size:12px"></i>');
	}
	else {					
		var game = parseFloat((100-chance-0.01)).toFixed(2);
		$("#updated_condition").html(">"+parseFloat(99.99-chance).toFixed(2)+' <i class="hidden-xs fa fa-exchange" style="font-size:12px"></i>');				
	}	
	
	$("#game-input").val(game);
	calculate_profit();
}

$(".editable").click(function() {
	
	var id = $(this).attr("rel");
	
	$("#editable-"+id).hide();
	$("#editable-"+id+"-field").show();
	$("#editable-"+id+"-field").focus();
	
	$('[data-toggle="tooltip"]').tooltip('hide');
	
	return false;
});

$(".editable-field").keyup(function() {
	var id = $(this).attr("rel");
	var value = parseFloat($(this).val());
	if (id == "payout") {
		if ((value >= 1.0102) && (value <= 9900)) {
			roll_by_payout(value);	
			$('#editable-payout-field').tooltip('hide');
		} else {			
			var attr = $('#editable-payout-field').attr("aria-describedby");
					
			if ($("#"+attr).css("display") == "none" || attr == undefined)
				$('#editable-payout-field').tooltip('show');		
		}
	}
	else if (id == "chance") {		
		if ((value >= 0.01) && (value <= 98)) {
			roll_by_chance(value);	
			$('#editable-chance-field').tooltip('hide');
		} else {		
			var attr = $('#editable-chance-field').attr("aria-describedby");
					
			if ($("#"+attr).css("display") == "none" || attr == undefined)
				$('#editable-chance-field').tooltip('show');		
		}	
	}
})

$(".editable-field").focusout(function() {
	var id = $(this).attr("rel");	
	var value = parseFloat($(this).val());
	if (id == "payout") {
		if (!isNaN(value)) {
			if (value < 1.0102) 
				value = 1.0102;		
			else if (value > 9900)
				value = 9900;		
		}
		else 
			value = 2;
			
		$("#editable-payout").html(value+"x");
		roll_by_payout(value);
		
		var val_chance = $("#editable-chance-field").val();
		roll_by_chance(val_chance);
	}
	else if (id == "chance") {
		if (!isNaN(value)) {
			if (value < 0.01) 
				value = 0.01;		
			else if (value > 98)
				value = 98;		
		}
		else 
			value = parseInt((100-edge_dice)/2);
			
		$("#editable-chance").html(value+"%");
		roll_by_chance(value);
	}
	
	$(this).val(value);
	
	$("#editable-"+id+"-field").hide();
	$("#editable-"+id).show();
	
	return false;
});

function update_stats_auto() {
	var bet_total = auto_stats_won+auto_stats_lost;
	if (bet_total > 0) {		
		$("#auto_stats_won").html(auto_stats_won);
		$("#auto_stats_lost").html(auto_stats_lost);				
		$("#auto_stats_lucky").html(auto_stats_lucky+"%");				
		$("#auto_stats_wagered").html(number_format(round_float(auto_stats_wagered, devise_decimal), devise_decimal));		
		$("#auto_stats_profit").html(number_format(round_float(auto_stats_profit, devise_decimal), devise_decimal));		
	}
}

$(".amount").focusout(function() {
	if ($.trim($(this).val()) == "")
		$(this).val(parseFloat("0").toFixed(devise_decimal));	
});

$('.btn-d2').on('click', function () {
	var attr = $(this).attr("rel");
	var amount = parseFloat($("#amount"+attr).val());
	amount = round_float(amount/2, devise_decimal);			
	$("#amount"+attr).val(amount);
	window['var_amount'+attr] = amount;	
	calculate_profit();
	reset_button_max_clicked();
});

$('.btn-m2').on('click', function () {
	var attr = $(this).attr("rel");
	var amount = parseFloat($("#amount"+attr).val());
	amount = round_float(amount*2, devise_decimal);			
	$("#amount"+attr).val(amount);
	window['var_amount'+attr] = amount;
	calculate_profit();
});

var button_max_clicked = false;
$('.btn-max').on('click', function () {		
	var attr = $(this).attr("rel");
	amount = round_float($("#balance-"+devise).val(), devise_decimal);			
	$("#amount"+attr).val(amount);
	window['var_amount'+attr] = amount;
	calculate_profit();
	
	button_max_clicked = true;
});

function reset_button_max_clicked() {
	button_max_clicked= false;	
	$("#btn-bet-dice, #btn-bet-start-pilot-dice, #btn-bet-start-fast-dice").html("<img src=\"/img/dice-roll.png\" />  ROLL DICE");
}

$('#dice-theme img').on('click', function () {
	var rel = $(this).attr("rel");
	change_theme(rel);	
});

function change_theme(rel) {
	for (var i=0;i<=6;i++) {
		$("#content-container").removeClass("theme-bg-"+i);
		$("#content-container #themes-bg-"+i).removeClass("on");
	}
			
	if (rel != "0") {	
		$("#content-container").addClass("theme-bg-"+rel);		
	}
	
	$("#content-container #themes-bg-"+rel).addClass("on");
	
	$.cookie("themes", rel, { expires : 30, path: '/'  });
}

$(document).ready(function() {
	$("#speed-bet-slider").noUiSlider({		
		start: 80,
		step: 20,
		connect: 'lower',	
		range: {
			min: 20,
			max: 80
		}
	}, true).Link('lower').to($("#speed-bet"));
	
	// if ($.cookie("night_mode_info") != 1)  {
		// $("#modal-night-mode").modal("show");
		// $.cookie("night_mode_info", 1, { expires : 30  });
	// }		
	
	if ($.cookie("themes") != "" && $.cookie("themes") != undefined) {
		change_theme($.cookie("themes"));
	}
	
	if (parseInt($.cookie("night_mode")) == 1) {	
		$("#container").addClass("night-mode");
		$("#dice-theme").hide();
		night_mode = true;
	}		
});
