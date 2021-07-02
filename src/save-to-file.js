"use strict";
//----------------------------------------------------------------------------//
// save-to-file - Svelte "preprocessor" that writes Results into a given File //
//----------------------------------------------------------------------------//
// see https://stackoverflow.com/questions/68213608/how-to-send-the-result-of-svelte-preprocess-into-a-file
Object.defineProperty(exports, "__esModule", { value: true });
/**** escapedHTMLAttribute ****/
function escapedHTMLAttribute(OriginalValue) {
    return OriginalValue.replace(/[&<>"'\u0000-\u001F\u007F-\u009F\\]/g, function (Match) {
        switch (Match) {
            case '&': return '&amp;';
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '"': return '&quot;';
            case "'": return '&apos;';
            case '\n': return '\n'; // allows line feeds to be preserved
            case '\\': return '&#92;';
            default:
                var Result = Match.charCodeAt(0).toString(16);
                return '&#x0000'.substring(3, 7 - Result.length) + Result + ';';
        }
    });
}
/**** saveToFile - the actual, complete preprocessor ****/
function saveToFile(FileName) {
    expectNonEmptyString('name of the file to save to', FileName);
    var processedScript = '';
    var processedMarkup = '';
    var processedStyle = '';
    /**** processScript ****/
    function processScript(_a, , string, string) {
        var Record = _a.Attributes;
    }
     > , Content;
    string;
}
PreprocessorResult;
{
    if (ValueIsNonEmptyString(Content)) {
        processedScript = '<script';
        for (var Key in Attributes) {
            if (Attributes.hasOwnProperty(Key) && (Key !== 'lang')) {
                processedScript += (' ' + Key + '=' + escapedHTMLAttribute(Attributes[Key]));
            }
        }
        processedScript += '>\n';
        Content = Content.replace(/^\s*\n/, '').replace(/\n\s*$/, '');
        processedScript += Content; // w/o leading and trailing empty lines
        processedScript += '\n</script>';
    }
    return { code: Content };
}
/**** processMarkup ****/
function processMarkup(_a) {
    var string = _a.Content;
    if (ValueIsNonEmptyString(Content)) {
        var HTMLParserCallbacks = {
            processStartTag: function processStartTag(TagName, Attributes, isUnary, isTopLevel) {
                if (!isTopLevel || ((TagName !== 'style') && (TagName !== 'script'))) {
                    processedMarkup += deserializedTag(TagName, Attributes, isUnary);
                }
            },
            processEndTag: function processEndTag(TagName, isTopLevel) {
                if (!isTopLevel || ((TagName !== 'style') && (TagName !== 'script'))) {
                    processedMarkup += '</' + TagName + '>';
                }
            },
            processText: function processText(Text, isTopLevel) {
                processedMarkup += Text;
            },
            processComment: function processComment(Comment) {
                processedMarkup += Comment;
            }
        };
        parseHTML(Resources, HTMLParserCallbacks);
        if (ValueIsEmptyString(processedMarkup)) {
            processedMarkup = '';
        }
    }
    return { code: Content };
}
/**** processStyle ****/
function processStyle(_a, , string, string) {
    var Record = _a.Attributes;
}
 > , Content;
string;
PreprocessorResult;
{
    if (ValueIsNonEmptyString(Content)) {
        processedStyle = '<style';
        for (var Key in Attributes) {
            if (Attributes.hasOwnProperty(Key) && (Key !== 'lang')) {
                processedStyle += (' ' + Key + '=' + escapedHTMLAttribute(Attributes[Key]));
            }
        }
        processedStyle += '>\n';
        Content = Content.replace(/^\s*\n/, '').replace(/\n\s*$/, '');
        processedStyle += Content; // w/o leading and trailing empty lines
        processedStyle += '\n</style>';
    }
    /**** now it's time to write anything into the given file ****>

      let completeFilename = path.join(process.cwd(),FileName)
      fs.writeFileSync(completeFilename, (
        (processedStyle  === '' ? '' : processedStyle  + '\n') +
        (processedScript === '' ? '' : processedScript + '\n') +
        (processedMarkup === '' ? '' : processedMarkup + '\n')
      ))

    /**** that's it! ****/
    return { code: Content };
}
return { markup: processMarkup, script: processScript, style: processStyle };
exports.default = saveToFile;
