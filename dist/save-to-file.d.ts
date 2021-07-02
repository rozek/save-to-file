declare type PreprocessorResult = Promise<{
    code: string;
    dependencies?: Array<string>;
}>;
declare type MarkupPreprocessor = (input: {
    content: string;
    filename: string;
}) => PreprocessorResult;
declare type ScriptPreprocessor = (input: {
    content: string;
    markup: string;
    attributes: Record<string, string>;
    filename: string;
}) => PreprocessorResult;
declare type StylePreprocessor = (input: {
    content: string;
    markup: string;
    attributes: Record<string, string>;
    filename: string;
}) => PreprocessorResult;
declare type Preprocessor = {
    markup?: MarkupPreprocessor;
    script?: ScriptPreprocessor;
    style?: StylePreprocessor;
};
/**** saveToFile - the actual, complete preprocessor ****/
declare function saveToFile(FileName: string): Preprocessor;
export default saveToFile;
