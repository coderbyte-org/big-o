import {Language} from '../structures';
import {ResponseHandler} from './CBHttpCodeRunner';

interface CodeRunner {
  checkCodeExecDuration(language: Language, runnableCode: string, context: { [key: string]: string }): Promise<number>;
  addResponseHandler(language: Language, handler: ResponseHandler): void;
}

export {CodeRunner};