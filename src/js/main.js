var main = (function () {
"use strict";

	var main = {};
	
	var JSON; // loaded quiz file
	var onQuestion = 0; // what question the viewer is on
	var submitBtn; // reference to the submit button
	var retryBtn;
	var quizcontent;
	var quizresult;
	
	var message; // reference to the error message
	var onQuestion; // which question the user is on
	var correctMap = []; // map of correct answers
	var correctAnswerID;
	var checkboxes = []; // array for numeric access to checkboxes
	var explainer;
	var explanation;
	var numQuestions;

	// initalize the application
	main.init = function()
	{
		message = document.getElementById("message");
		submitBtn = document.getElementById("submitBtn");
		retryBtn = document.getElementById("retryBtn");
		quizcontent = document.getElementById("quizcontent");
		quizresult = document.getElementById("quizresult");
		explainer = document.getElementById("explainer");
		
		submitBtn.addEventListener( "mousedown" , submitClicked , false );
		retryBtn.addEventListener( "mousedown" , resetClicked , false );
		
		var path = "data/"+getParameterByName('quiz')+".json";
		$.getJSON(path, function(response){
		   JSON = response;
		})
		//feel free to use chained handlers, or even make custom events out of them!
		.success(function() { quizLoadedSuccess(); })
		.error(function() { quizLoadedError(); })
		.complete(function() { quizLoadedComplete(); });
	}
	
	// functions for JSON loading success
	function quizLoadedSuccess()
	{
		numQuestions = JSON.questions.length;
		main.loadQuestion(onQuestion);
	}
	
	function quizLoadedError()
	{
		//console.log("error");
		message.innerHTML = "Uh oh! Something went wrong when trying to load the quiz!"
		message.classList.remove("hide");
	}
	
	function quizLoadedComplete()
	{
		//console.log("complete");
		quizcontent.classList.remove("hide");
	}
	
	function submitClicked()
	{
		message.classList.add("hide");
		// ensure the radio buttons are checked
		
		var rba1 = document.getElementById("rba1");
		var rba2 = document.getElementById("rba2");
		var rba3 = document.getElementById("rba3");
		var rba4 = document.getElementById("rba4");
		
		var rba1check = document.getElementById("rba1correct");
		var rba2check = document.getElementById("rba2correct");
		var rba3check = document.getElementById("rba3correct");
		var rba4check = document.getElementById("rba4correct");

		var rba1cross = document.getElementById("rba1wrong");
		var rba2cross = document.getElementById("rba2wrong");
		var rba3cross = document.getElementById("rba3wrong");
		var rba4cross = document.getElementById("rba4wrong");
		
		checkboxes = [
						{"el":rba1,"check":rba1check,"cross":rba1cross},
						{"el":rba2,"check":rba2check,"cross":rba2cross},
						{"el":rba3,"check":rba3check,"cross":rba3cross},
						{"el":rba4,"check":rba4check,"cross":rba4cross}
					];
		
		if ( !(rba1.checked == true || 
			rba2.checked == true ||
			rba3.checked == true ||
			rba4.checked == true) 
		){
			message.innerHTML = "Please make a selection!"
			message.classList.remove("hide");
		}
		else
		{
			var whichChecked;
			if (rba1.checked) whichChecked = 0;
			else if (rba2.checked) whichChecked = 1;
			else if (rba3.checked) whichChecked = 2;
			else if (rba4.checked) whichChecked = 3;
			
			// check if the correct option was checked
			if ( whichChecked == correctAnswerID ) 
			{
				correctMap[onQuestion] = true;
				checkboxes[whichChecked]["check"].classList.remove("invisible");
				
				explainer.innerHTML = "CORRECT! " + explanation;
			}
			else 
			{
				correctMap[onQuestion] = false;
				checkboxes[whichChecked]["cross"].classList.remove("invisible");
				
				explainer.innerHTML = "INCORRECT! " + explanation;
			}
			
			rba1.disabled = true;
			rba2.disabled = true;
			rba3.disabled = true;
			rba4.disabled = true;
			
			submitBtn.innerHTML = "Next...";
			submitBtn.removeEventListener( "mousedown" , submitClicked , false );
			submitBtn.addEventListener( "mousedown" , nextClicked , false );			
		}
	}
	
	function nextClicked()
	{
		rba1.disabled = false;
		rba2.disabled = false;
		rba3.disabled = false;
		rba4.disabled = false;
		
		rba1.checked = false;
		rba2.checked = false;
		rba3.checked = false;
		rba4.checked = false;
		
		for (var i = 0; i <4; i++)
		{
			checkboxes[i]["check"].classList.add("invisible");
			checkboxes[i]["cross"].classList.add("invisible");				
		}
		
		explainer.innerHTML = "Make a selection...";
		submitBtn.innerHTML = "Submit >";
		submitBtn.removeEventListener( "mousedown" , nextClicked , false );
		submitBtn.addEventListener( "mousedown" , submitClicked , false );
			
		if (onQuestion != numQuestions-1)
		{
			main.loadQuestion(++onQuestion);
		}
		else
		{
			quizcontent.classList.add("hide");
			quizresult.classList.remove("hide");
			
			var scoreResults = "";
			
			for (var r = 1; r <= numQuestions;r++)
			{
				scoreResults += "<div>Question "+r+": ";
				if (correctMap[r-1]) scoreResults+="CORRECT!";
				else scoreResults+="INCORRECT!";
				scoreResults += "</div>";
			}
			
			document.getElementById( "score" ).innerHTML = scoreResults;
		}
	}
	
	function resetClicked()
	{
		correctMap = [];
		quizcontent.classList.remove("hide");
		quizresult.classList.add("hide");
		onQuestion = 0;
		main.loadQuestion(onQuestion);
	}
	
	// loads a question
	main.loadQuestion = function(number)
	{
		var question = JSON.questions[number];
		onQuestion = number;
		correctAnswerID = question["correct"];
		explanation = question["explanation"];
		
		progress.innerHTML = "Question: "+(number+1)+"/"+numQuestions;
		
		document.getElementById("question").innerHTML = question["question"];
		document.getElementById("a1").innerHTML = question["answers"][0];
		document.getElementById("a2").innerHTML = question["answers"][1];
		document.getElementById("a3").innerHTML = question["answers"][2];
		document.getElementById("a4").innerHTML = question["answers"][3];
	}
	
	// load a parameter from the URL
	function getParameterByName(name)
	{
		name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
		var regexS = "[\\?&]" + name + "=([^&#]*)";
		var regex = new RegExp(regexS);
		var results = regex.exec(window.location.search);
		if(results == null)
		return "";
		else
		return decodeURIComponent(results[1].replace(/\+/g, " "));
	}

// return internally scoped var as value of globally scoped object
return main;

})();