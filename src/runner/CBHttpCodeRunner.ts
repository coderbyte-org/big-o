import {CodeRunner} from "./CodeRunner";
import {HttpClient} from "./HttpClient";
import {Language} from "../structures";
import {CodeRunnerError} from "./CodeRunnerError";
import {LanguageExtensions} from "./LanguageExtensions";

const TIMEOUT_ERROR_MESSAGE = 'process killed as timeout reached';

type ResponseHandler = (stdout: string) => number;

class CBHttpCodeRunner implements CodeRunner {
    static readonly URI_PATTERN_LANG_PART = '[runnerLanguage]';
    private uriPattern: string;
    private client: HttpClient;
    private languageUris: { [key: string]: string };
    private languageResponseHandlers: Map<Language,  ResponseHandler>;

    constructor(uri: string, client: HttpClient) {
        this.languageUris = {};
        this.uriPattern = uri;
        this.client = client;
        this.languageResponseHandlers = new Map<Language,  ResponseHandler>();
    }

    addResponseHandler(language: Language, handler: ResponseHandler): void
    {
        this.languageResponseHandlers.set(language, handler);
    }

    checkCodeExecDuration(language: Language, code: string, context: { [key: string]: any } = {}): Promise<number> {
        const uri: string = this.determineRunnerUri(language);
        const body: string = this.createCodeSampleBody(language, code, context);
        return this.client.post(uri, body)
            .then((data: any) => {
                if (data.stderr !== '' || (data.error !== '' && data.error !== TIMEOUT_ERROR_MESSAGE)) {
                    let err = new CodeRunnerError('Failed at coderunner')
                    err.codeRunnerResponse = data;
                    return Promise.reject(err);
                }
                if (this.languageResponseHandlers.has(language)) {
                    try {
                        let handler: ResponseHandler = this.languageResponseHandlers.get(language)!;
                        let duration: number = handler(data.stdout);
                        return Promise.resolve(duration);
                    } catch (err) {
                        return Promise.reject(err);
                    }
                }
                return Promise.resolve(parseInt(data.duration));
            });
    }

    private determineRunnerUri(language: Language): string {
        if (!this.languageUris.hasOwnProperty(language)) {
            this.languageUris[language] = this.uriPattern.replace(CBHttpCodeRunner.URI_PATTERN_LANG_PART, language)
        }
        return this.languageUris[language];
    }

    private createCodeSampleBody(language: Language, code: string, context: { [key: string]: any } = {}): string {
        if (language === Language.PYTHON3) {
            language = Language.PYTHON;
        }

        let filename = 'main';
        if (language === Language.JAVA) {
            filename = 'Main';
        }
        const sample: { [key: string]: any } = {
          language,
          files: [
              {
                  name: filename + '.' + LanguageExtensions[language],
                  content: code
              }
          ]
        };
        Object.keys(context).forEach((key: string) => {
            sample[key] = context[key];
        });
        return JSON.stringify(sample);
    }
}

export {
  CBHttpCodeRunner,
  ResponseHandler
};