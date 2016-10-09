// The exported functions in this module makes a call to Bing Spell Check API that returns spelling corrections.
// For more info, check out the API reference:
// https://dev.cognitive.microsoft.com/docs/services/56e73033cf5ff80c2008c679/operations/56e73036cf5ff81048ee6727
const request = require('request');

const SPELL_CHECK_API_URL = "https://api.cognitive.microsoft.com/bing/v5.0/spellcheck/",
    SPELL_CHECK_API_KEY = process.env.BING_Spell_Check_API_KEY;

/**
 * Gets the correct spelling for the given text
 * @param {string} text The text to be corrected
 * @returns {Promise} Promise with corrected text if succeeded, error otherwise.
 */
exports.getCorrectedText = text => {
    return new Promise(
        (resolve, reject) => {
            
            const requestData = {
                url: SPELL_CHECK_API_URL,
                headers: {
                    "Ocp-Apim-Subscription-Key": SPELL_CHECK_API_KEY
                },
                form: {
                    text: text
                },
                json: true
            }

            request.post(requestData, (error, response, body) => {
                if (error) {
                    reject(error);
                }
                else if (response.statusCode != 200) {
                    reject(body);
                }
                else {
                    var currentOffset = 0;
                    var result = "";

                    for (var i = 0; i < body.flaggedTokens.length; i++) {
                        var element = body.flaggedTokens[i];

                        result += text.substring(currentOffset, element.offset);

                        result += element.suggestions[0].suggestion;

                        currentOffset = element.offset + element.token.length;
                    }

                    if (currentOffset < text.length) {
                        result += text.substring(currentOffset);
                    }

                    resolve(result);
                }

            });
        }
    )

}
