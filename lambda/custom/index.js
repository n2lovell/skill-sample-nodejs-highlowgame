/* eslint-disable  func-names */
/* eslint-disable  no-console */
/* eslint-disable  no-restricted-syntax */

const Alexa = require('ask-sdk');

const SKILL_NAME = 'High Low Game';
const FALLBACK_MESSAGE_DURING_GAME = `The ${SKILL_NAME} skill can't help you with that.  Try guessing a number between 0 and 100. `;
const FALLBACK_REPROMPT_DURING_GAME = 'Please guess a number between 0 and 100.';
const FALLBACK_MESSAGE_OUTSIDE_GAME = `The ${SKILL_NAME} skill can't help you with that.  It will come up with a number between 0 and 100 and you try to guess it by saying a number in that range. Would you like to play?`;
const FALLBACK_REPROMPT_OUTSIDE_GAME = 'Say yes to start the game or no to quit.';

const LaunchRequest = {
  canHandle(handlerInput) {
    // launch requests as well as any new session, as games are not saved in progress, which makes
    // no one shots a reasonable idea except for help, and the welcome message provides some help.
    return handlerInput.requestEnvelope.session.new || handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  async handle(handlerInput) {
    const attributesManager = handlerInput.attributesManager;
    const responseBuilder = handlerInput.responseBuilder;

    const attributes = await attributesManager.getPersistentAttributes() || {};
    if (Object.keys(attributes).length === 0) {
      attributes.endedSessionCount = 0;
      attributes.gamesPlayed = 0;
      attributes.gameState = 'ENDED';
    }

    attributesManager.setSessionAttributes(attributes);

    const speechOutput = `Welcome to High Low guessing game. You have played ${attributes.gamesPlayed.toString()} times. would you like to play?`;
    const reprompt = 'Say yes to start the game or no to quit.';
    return responseBuilder
      .speak(speechOutput)
      .reprompt(reprompt)
      .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;

    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
        || request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak('Thanks for playing!')
      .getResponse();
  },
};

const SessionEndedRequest = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
    return handlerInput.responseBuilder.getResponse();
  },
};

const HelpIntent = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;

    return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechOutput = 'You are thinking of a number between zero and one hundred, and I will try to guess it by asking' +
            ' if it is higher or lower.';
    const reprompt = 'Say higher, lower or correct';

    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(reprompt)
      .getResponse();
  },
};

const YesIntent = {
  canHandle(handlerInput) {
    // only start a new game if yes is said when not playing a game.
    let isCurrentlyPlaying = false;
    const request = handlerInput.requestEnvelope.request;
    const attributesManager = handlerInput.attributesManager;
    const sessionAttributes = attributesManager.getSessionAttributes();

    if (sessionAttributes.gameState &&
        sessionAttributes.gameState === 'STARTED') {
      isCurrentlyPlaying = true;
    }

    return !isCurrentlyPlaying && request.type === 'IntentRequest' && request.intent.name === 'AMAZON.YesIntent';
  },
  handle(handlerInput) {
    const attributesManager = handlerInput.attributesManager;
    const responseBuilder = handlerInput.responseBuilder;
    const sessionAttributes = attributesManager.getSessionAttributes();

    sessionAttributes.gameState = 'STARTED';
	sessionAttributes.maxNumber;
	sessionAttributes.minNumber 
    sessionAttributes.guessNumber = Math.floor(Math.random() * 101);

    return responseBuilder
      .speak('Great! Try saying a number to start the game.')
      .reprompt('Try saying a number.')
      .getResponse();
  },
};

const NoIntent = {
  canHandle(handlerInput) {
    // only treat no as an exit when outside a game
    let isCurrentlyPlaying = false;
    const request = handlerInput.requestEnvelope.request;
    const attributesManager = handlerInput.attributesManager;
    const sessionAttributes = attributesManager.getSessionAttributes();

    if (sessionAttributes.gameState &&
        sessionAttributes.gameState === 'STARTED') {
      isCurrentlyPlaying = true;
    }

    return !isCurrentlyPlaying && request.type === 'IntentRequest' && request.intent.name === 'AMAZON.NoIntent';
  },
  async handle(handlerInput) {
    const attributesManager = handlerInput.attributesManager;
    const responseBuilder = handlerInput.responseBuilder;
    const sessionAttributes = attributesManager.getSessionAttributes();

    sessionAttributes.endedSessionCount += 1;
    sessionAttributes.gameState = 'ENDED';
    attributesManager.setPersistentAttributes(sessionAttributes);

    await attributesManager.savePersistentAttributes();

    return responseBuilder.speak('Ok, see you next time!').getResponse();
  },
};

const UnhandledIntent = {
  canHandle() {
    return true;
  },
  handle(handlerInput) {
    const outputSpeech = 'Say yes to continue, or no to end the game.';
    return handlerInput.responseBuilder
      .speak(outputSpeech)
      .reprompt(outputSpeech)
      .getResponse();
  },
};


const NumberGuessIntent = {
  canHandle(handlerInput) {
    // handle numbers only during a game
    let isCurrentlyPlaying = false;
	let isCurrentlyStarted = false;

    const request = handlerInput.requestEnvelope.request;
    const attributesManager = handlerInput.attributesManager;
    const sessionAttributes = attributesManager.getSessionAttributes();

    if (sessionAttributes.gameState &&
        sessionAttributes.gameState === 'STARTED') {
      isCurrentlyPlaying = true;
    }
	if (sessionAttributes.minNumber)
	{
	  isCurrentlyStarted = true;
	}
    return !isCurrentlyStarted && isCurrentlyPlaying && request.type === 'IntentRequest' && request.intent.name === 'NumberGuessIntent';
  },
  async handle(handlerInput) {
    const { requestEnvelope, attributesManager, responseBuilder } = handlerInput;

    const minNumber = parseInt(requestEnvelope.request.intent.slots.numberStart.value, 1);
	const maxNumber = parseInt(requestEnvelope.request.intent.slots.numberEnd.value, 1000);
    const sessionAttributes = attributesManager.getSessionAttributes();
    sessionAttributes.minNumber = minNumber;
	sessionAttributes.maxNumber = maxNumber;
    if (maxNumber > minNumber) {
	  sessionAttributes.alexaGuess = Math.floor(Math.random() * (maxNumber - minNumber)) + minNumber;
      return responseBuilder
        .speak(I guess ${sessionAttributes.alexaGuess.toString()}`)
        .reprompt('Is it higher, lower, or just right')
        .getResponse();
    } 
    return handlerInput.responseBuilder
      .speak('Sorry, I didn\'t get that. Try saying two numbers between 1 and a thousand.')
      .reprompt('Try saying I\'m thinking of a number between 1 and 1000')
      .getResponse();
  },
};



const AlexaGuess = {
  canHandle(handlerInput) {
    // handle higher/lower during the game
    let isCurrentlyPlaying = false;

    const request = handlerInput.requestEnvelope.request;
    const attributesManager = handlerInput.attributesManager;
    const sessionAttributes = attributesManager.getSessionAttributes();

    if (sessionAttributes.minNumber &&
        sessionAttributes.gameState === 'STARTED') {
      isCurrentlyPlaying = true;
    }
	
    return isCurrentlyPlaying && request.type === 'IntentRequest' && request.intent.name === 'AlexaGuess';
  },
  async handle(handlerInput) {
    const { requestEnvelope, attributesManager, responseBuilder } = handlerInput;

    const utterance = requestEnvelope.request.intent.slots.Response.value;
    const sessionAttributes = attributesManager.getSessionAttributes();
	minNumber = sessionAttributes.minNumber;
	maxNumber = sessionAttributes.maxNumber;
	const lastGuess = sessionAttributes.alexaGuess;
	
	  //update the min/max values
	  //Note we call out users for cheating when it collapses to nothing
	if (utterance === 'higher') {
	  minNumber = lastGuess;
    } else if (utterance === 'lower') {
		maxNumber = lastGuess;
	} else if (utterance == 'correct') {
		sessionAttributes.endedSessionCount += 1;
		sessionAttributes.gameState = 'ENDED';
		attributesManager.setPersistentAttributes(sessionAttributes);
		await attributesManager.savePersistentAttributes();

		return responseBuilder.speak('Ok, see you next time!').getResponse();
	} else {
	  return handlerInput.responseBuilder
      .speak('Sorry, I didn\'t get that. Try saying two numbers between 1 and a thousand.')
      .reprompt('Try saying I\'m thinking of a number between 1 and 1000')
      .getResponse();
	}
	
	if (minNumber >= maxNumber) {
		sessionAttributes.endedSessionCount += 1;
		sessionAttributes.gameState = 'ENDED';
		attributesManager.setPersistentAttributes(sessionAttributes);
		await attributesManager.savePersistentAttributes();

		return responseBuilder.speak('CHEATER, see you next time').getResponse();
	}
	
	//make new guess
	sessionAttributes.minNumber = minNumber;
	sessionAttributes.maxNumber = maxNumber;
	sessionAttributes.alexaGuess = Math.floor(Math.random() * (maxNumber - minNumber)) + minNumber;
	
	return responseBuilder
		.speak(I guess ${sessionAttributes.alexaGuess.toString()}`)
		.reprompt('Is it higher, lower, or correct')
		.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

const FallbackHandler = {
  // 2018-May-01: AMAZON.FallackIntent is only currently available in en-US locale.
  //              This handler will not be triggered except in that locale, so it can be
  //              safely deployed for any locale.
  canHandle(handlerInput) {
    // handle fallback intent, yes and no when playing a game
    // for yes and no, will only get here if and not caught by the normal intent handler
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' &&
      (request.intent.name === 'AMAZON.FallbackIntent' ||
       request.intent.name === 'AMAZON.YesIntent' ||
       request.intent.name === 'AMAZON.NoIntent');
  },
  handle(handlerInput) {
    const attributesManager = handlerInput.attributesManager;
    const sessionAttributes = attributesManager.getSessionAttributes();

    if (sessionAttributes.gameState &&
        sessionAttributes.gameState === 'STARTED') {
      // currently playing

      return handlerInput.responseBuilder
        .speak(FALLBACK_MESSAGE_DURING_GAME)
        .reprompt(FALLBACK_REPROMPT_DURING_GAME)
        .getResponse();
    }

    // not playing
    return handlerInput.responseBuilder
      .speak(FALLBACK_MESSAGE_OUTSIDE_GAME)
      .reprompt(FALLBACK_REPROMPT_OUTSIDE_GAME)
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.standard();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequest,
    ExitHandler,
    SessionEndedRequest,
    HelpIntent,
    YesIntent,
    NoIntent,
    NumberGuessIntent,
    FallbackHandler,
    UnhandledIntent,
  )
  .addErrorHandlers(ErrorHandler)
  .withTableName('High-Low-Game')
  .withAutoCreateTable(true)
  .lambda();
