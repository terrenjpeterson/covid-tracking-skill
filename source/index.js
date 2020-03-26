// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');
const aws = require('aws-sdk');

// these is the latest COVID-19 Data sourced
var currData = require("data/currData.json");
var stateLookup = require("data/stateLookup.json");

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {

	console.log(JSON.stringify(currData[0]));
	
	var speakOutput = 'Welcome to the COVID 19 testing tracker. What state would you like current testing data for?';
	var repromptOutput = "If you would like data on a particular state, please say something like How many cases in Virginia?";

	console.log("ending");

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(repromptOutput)
            .getResponse();
    }
};

const StateLookupIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'stateLookupIntent';
    },
    handle(handlerInput) {
	const request = handlerInput.requestEnvelope.request;
        var speakOutput = 'State Level lookup ';

	console.log("State intent invoked");

	if (request.intent.slots.state.value) {
	    console.log(JSON.stringify(request.intent.slots.state));
	    speakOutput = speakOutput + request.intent.slots.state.value + ".";

	    var lookupState = "XX";

	    // validate state and find key needed for data lookup
	    for (i = 0; i < stateLookup.length; i++ ) {
		console.log("Checking" + request.intent.slots.state.value + stateLookup[i].stateName);
		if (request.intent.slots.state.value.toLowerCase() == stateLookup[i].stateName.toLowerCase()) {
		    console.log("Found a match: " + JSON.stringify(stateLookup[i]));
		    lookupState = stateLookup[i].stateCode;
		}	
	    }

	    if (lookupState == "XX") {
		// no state was found in the lookup - provided message indicating such
		console.log("Error message - no match for " + request.intent.slots.state.value);
		speakOutput = "Sorry, I don't have data for " + request.intent.slots.state.value + ". " +
		    "Please say something like How many cases in California?";
	    } else {
		console.log("Match data");
		for (j = 0; j < currData.length; j++ ) {
		    console.log("Checking" + lookupState + currData[j].state);
		    if (lookupState.toLowerCase() == currData[j].state.toLowerCase()) {
			console.log("Found match " + JSON.stringify(currData[j]));
			speakOutput = "There have been " + currData[j].total + " tests in " + request.intent.slots.state.value + ", with " + currData[j].positive + " positive cases. " +
			    "If you would like data for another state, please ask now.";
		    }
		}
	    }

	} else {
	    // no state was provided in the slot - provided proper message indicating such
	    console.log("No state provided");
	    speakOutput = "Sorry, I didn't catch what state you were looking for. Please say something like How many cases in New York?";
	}

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('What state would you like data for?')
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'This is a skill that provides testing data for the COVID 19 virus. The covid tracking project is collecting data from health departments across the United States. ' +
	    'If you would like to know the number of tests that have been run for a state, please say something like, How many tests in Virginia?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Thanks for using the COVID Tracker skill.';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
	StateLookupIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    )
    .addErrorHandlers(
        ErrorHandler,
    )
    .lambda();
