const Alexa = require('ask-sdk-core');
const i18n = require('i18next');
const sprintf = require('i18next-sprintf-postprocessor');

const aplEs = require('./es');
const aplEn = require('./en');

const AYUDA_ID = "ayuda";
const BIENVENIDA_ID = "bienvenida";
const COMIDATIPICA_ID = "comidatipica";
const DESCRIPCION_ID = "descripcion";
const ERROR_ID = "error";
const LUGARESTURISTICOS_ID = "lugaresturisticos";
const MUSICA_ID = "musica";
const PERSONAJES_ID = "personajes";
const SALIR_ID = "salir";
const TRAJE_ID = "traje";


const languageStrings = {
    en: {
        translation: {
            WELCOME_MSG: 'Welcome to Knowing Rome! You can ask for a description, tourist spots, typical food, traditional dress, famous characters, or music. How can I assist you today?',
            HELLO_MSG: 'Hello! How can I help you with Rome today?',
            HELP_MSG: 'You can ask me for information about Rome, such as a description, tourist spots, typical food, traditional dress, famous characters, or music.',
            GOODBYE_MSG: 'Goodbye! Hope you enjoyed learning about Rome.',
            FALLBACK_MSG: 'Sorry, I don\'t understand that. You can ask for information about Rome.',
            ERROR_MSG: 'Sorry, I had trouble doing what you asked. Please try again.',
            DESCRIPTION_MSG: 'Rome is the capital city of Italy and the Lazio region. With a population of 2,857,321 inhabitants, it is the most populated municipality in Italy and the third most populated city in the European Union.',
            PLACES_MSG: 'Some of the most notable tourist spots in Rome are: the Colosseum, Roman Forum, Vatican City, Pantheon, Trevi Fountain, Piazza Navona, Spanish Steps, Castel Sant\'Angelo, Borghese Gallery, and Villa Borghese.',
            FOOD_MSG: 'Typical Roman dishes include Pasta Carbonara, Cacio e Pepe, Supplì, Saltimbocca alla Romana, Carciofi alla Romana, Abbacchio alla Romana, Roman Pizza, Bucatini all\'Amatriciana, Trapizzino, and Gelato.',
            DRESS_MSG: 'The traditional Roman attire includes tunics for both men and women, with togas and stolas worn on top. Wealthy Romans had better quality and more colorful clothes.',
            CHARACTERS_MSG: 'Notable figures in Rome\'s history include Julius Caesar, Marcus Aurelius, Cicero, Michelangelo, Galileo Galilei, Pope Francis, Raphael, Giuseppe Garibaldi, Livia Drusilla, and Giacomo Puccini.',
            MUSIC_MSG: 'Here is some typical music from Rome.'
        }
    },
    es: {
        translation: {
            WELCOME_MSG: '¡Bienvenido a Conociendo Roma! Puedes pedir una descripción, lugares turísticos, comida típica, traje tradicional, personajes famosos o música. ¿Cómo puedo ayudarte hoy?',
            HELLO_MSG: '¡Hola! ¿Cómo puedo ayudarte con Roma hoy?',
            HELP_MSG: 'Puedes pedirme información sobre Roma, como una descripción, lugares turísticos, comida típica, traje tradicional, personajes famosos o música.',
            GOODBYE_MSG: '¡Adiós! Espero que hayas disfrutado aprendiendo sobre Roma.',
            FALLBACK_MSG: 'Lo siento, no entiendo eso. Puedes pedirme información sobre Roma.',
            ERROR_MSG: 'Lo siento, tuve problemas para hacer lo que pediste. Por favor, inténtalo de nuevo.',
            DESCRIPTION_MSG: 'Roma es la capital de Italia y de la región del Lacio. Con una población de 2,857,321 habitantes, es el municipio más poblado de Italia y la tercera ciudad más poblada de la Unión Europea.',
            PLACES_MSG: 'Algunos de los lugares turísticos más destacados de Roma son: el Coliseo, el Foro Romano, la Ciudad del Vaticano, el Panteón, la Fontana di Trevi, la Piazza Navona, la Escalinata de la Plaza de España, el Castillo de Sant\'Angelo, la Galería Borghese y la Villa Borghese.',
            FOOD_MSG: 'Los platos típicos romanos incluyen Pasta Carbonara, Cacio e Pepe, Supplì, Saltimbocca alla Romana, Carciofi alla Romana, Abbacchio alla Romana, Pizza Romana, Bucatini all\'Amatriciana, Trapizzino y Gelato.',
            DRESS_MSG: 'La vestimenta tradicional romana incluye túnicas para hombres y mujeres, con togas y stolas encima. Los romanos adinerados tenían ropa de mejor calidad y más colorida.',
            CHARACTERS_MSG: 'Algunas figuras notables en la historia de Roma incluyen a Julio César, Marco Aurelio, Cicerón, Miguel Ángel, Galileo Galilei, el Papa Francisco, Rafael, Giuseppe Garibaldi, Livia Drusilla y Giacomo Puccini.',
            MUSIC_MSG: 'Aquí hay algo de música típica de Roma.'
        }
    }
};

const createDirectivePayload = (aplDocumentId, dataSources = {}, tokenId = "documentToken") => {
    return {
        type: "Alexa.Presentation.APL.RenderDocument",
        token: tokenId,
        document: {
            type: "Link",
            src: "doc://alexa/apl/documents/" + aplDocumentId
        },
        datasources: dataSources
    }
};

const getAplData = (locale) => {
    if (locale.startsWith('es')) {
        return aplEs;
    } else {
        return aplEn;
    }
};

const LocalizationInterceptor = {
    process(handlerInput) {
        const localizationClient = i18n.use(sprintf).init({
            lng: handlerInput.requestEnvelope.request.locale,
            fallbackLng: 'en',
            overloadTranslationOptionHandler: sprintf.overloadTranslationOptionHandler,
            resources: languageStrings,
            returnObjects: true
        });

        const attributes = handlerInput.attributesManager.getRequestAttributes();
        attributes.t = function (...args) {
            return localizationClient.t(...args);
        };

        attributes.locale = handlerInput.requestEnvelope.request.locale;
    }
};
const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
        
        const locale = requestAttributes.locale;
        const aplData = getAplData(locale);

        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            const aplDatasource = aplData.bienvenida;
            const aplDirective = createDirectivePayload(BIENVENIDA_ID, aplDatasource);
            handlerInput.responseBuilder.addDirective(aplDirective);
        }
        
        const speakOutput = requestAttributes.t('WELCOME_MSG');
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const descripcionIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'descripcionIntent';
    },
    handle(handlerInput) {
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
         const locale = requestAttributes.locale;
        const aplData = getAplData(locale);

        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            let aplDatasource;
            aplDatasource = aplData.descripcion;
            const aplDirective = createDirectivePayload(DESCRIPCION_ID, aplDatasource);
            handlerInput.responseBuilder.addDirective(aplDirective);
        }
        const speakOutput = requestAttributes.t('DESCRIPTION_MSG');

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const lugaresIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'lugaresIntent';
    },
    handle(handlerInput) {
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
         const locale = requestAttributes.locale;
        const aplData = getAplData(locale);

        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            let aplDatasource;
            aplDatasource = aplData.lugaresturisticos;
            const aplDirective = createDirectivePayload(LUGARESTURISTICOS_ID, aplDatasource);
            handlerInput.responseBuilder.addDirective(aplDirective);
        }
        const speakOutput = requestAttributes.t('PLACES_MSG');

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const comidaIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'comidaIntent';
    },
    handle(handlerInput) {
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
         const locale = requestAttributes.locale;
        const aplData = getAplData(locale);

        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            let aplDatasource;
            aplDatasource = aplData.comidatipica;
            const aplDirective = createDirectivePayload(COMIDATIPICA_ID, aplDatasource);
            handlerInput.responseBuilder.addDirective(aplDirective);
        }
        const speakOutput = requestAttributes.t('FOOD_MSG');

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const trajeIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'trajeIntent';
    },
    handle(handlerInput) {
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
         const locale = requestAttributes.locale;
        const aplData = getAplData(locale);

        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            let aplDatasource;
            aplDatasource = aplData.traje;
            const aplDirective = createDirectivePayload(TRAJE_ID, aplDatasource);
            handlerInput.responseBuilder.addDirective(aplDirective);
        }
        const speakOutput = requestAttributes.t('DRESS_MSG');

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const personajesIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'personajesIntent';
    },
    handle(handlerInput) {
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
         const locale = requestAttributes.locale;
        const aplData = getAplData(locale);

        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            let aplDatasource;
            aplDatasource = aplData.personajes;
            const aplDirective = createDirectivePayload(PERSONAJES_ID, aplDatasource);
            handlerInput.responseBuilder.addDirective(aplDirective);
        }
        const speakOutput = requestAttributes.t('CHARACTERS_MSG');

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const musicaIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'musicaIntent';
    },
    handle(handlerInput) {
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
         const locale = requestAttributes.locale;
        const aplData = getAplData(locale);

        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            let aplDatasource;
            aplDatasource = aplData.musica;
            const aplDirective = createDirectivePayload(MUSICA_ID, aplDatasource);
            handlerInput.responseBuilder.addDirective(aplDirective);
        }
        const speakOutput = requestAttributes.t('MUSIC_MSG');

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
         const locale = requestAttributes.locale;
        const aplData = getAplData(locale);

        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            let aplDatasource;
            aplDatasource = aplData.ayuda;
            const aplDirective = createDirectivePayload(AYUDA_ID, aplDatasource);
            handlerInput.responseBuilder.addDirective(aplDirective);
        }
        const speakOutput = requestAttributes.t('HELP_MSG');

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
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
         const locale = requestAttributes.locale;
        const aplData = getAplData(locale);

        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            let aplDatasource;
            aplDatasource = aplData.salir;
            const aplDirective = createDirectivePayload(SALIR_ID, aplDatasource);
            handlerInput.responseBuilder.addDirective(aplDirective);
        }
        const speakOutput = requestAttributes.t('GOODBYE_MSG');

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
        const speakOutput = requestAttributes.t('FALLBACK_MSG');

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};

const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = requestAttributes.t('You just triggered %s', intentName);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
         const locale = requestAttributes.locale;
        const aplData = getAplData(locale);

        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            let aplDatasource;
            aplDatasource = aplData.error;
            const aplDirective = createDirectivePayload(ERROR_ID, aplDatasource);
            handlerInput.responseBuilder.addDirective(aplDirective);
        }
        const speakOutput = requestAttributes.t('ERROR_MSG');
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        descripcionIntentHandler,
        lugaresIntentHandler,
        comidaIntentHandler,
        trajeIntentHandler,
        personajesIntentHandler,
        musicaIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addRequestInterceptors(LocalizationInterceptor)
    .addErrorHandlers(ErrorHandler)
    .withCustomUserAgent('sample/hello-world/v1.2')
    .lambda();
