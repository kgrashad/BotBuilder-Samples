using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web.Configuration;
using Newtonsoft.Json;

namespace SpellCheck.Services
{
    public class BingSpellCheckService
    {
        /// <summary>
        /// Microsoft Bing Spell Check Api Key.
        /// </summary>
        private static readonly string ApiKey = WebConfigurationManager.AppSettings["BingSpellCheckApiKey"];

        /// <summary>
        /// The Bing Spell Check Api Url.
        /// </summary>
        private const string SpellCheckApiUrl = "https://api.cognitive.microsoft.com/bing/v5.0/spellcheck/";

        /// <summary>
        /// Gets the correct spelling for the given text
        /// </summary>
        /// <param name="text">The text to be corrected</param>
        /// <returns>string with corrected text</returns>
        public async Task<string> GetCorrectedTextAsync(string text)
        {
            using (var client = new HttpClient())
            {
                client.DefaultRequestHeaders.Add("Ocp-Apim-Subscription-Key", ApiKey);

                var values = new Dictionary<string, string>
                {
                    { "text", text }
                };

                var content = new FormUrlEncodedContent(values);

                var response = await client.PostAsync(SpellCheckApiUrl, content);
                var responseString = await response.Content.ReadAsStringAsync();

                var spellCheckResponse = JsonConvert.DeserializeObject<BingSpellCheckResponse>(responseString);

                StringBuilder sb = new StringBuilder();
                int currentOffset = 0;

                foreach (var flaggedToken in spellCheckResponse.flaggedTokens)
                {
                    sb.Append(text.Substring(currentOffset, flaggedToken.offset - currentOffset));

                    sb.Append(flaggedToken.suggestions.First().suggestion);

                    currentOffset = flaggedToken.offset + flaggedToken.token.Length;
                }

                if (currentOffset < text.Length)
                {
                    sb.Append(text.Substring(currentOffset));
                }

                return sb.ToString();
            }
        }
    }
}