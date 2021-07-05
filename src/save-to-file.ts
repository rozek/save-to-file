//----------------------------------------------------------------------------//
// save-to-file - Svelte "preprocessor" that writes Results into a given File //
//----------------------------------------------------------------------------//
// see https://stackoverflow.com/questions/68213608/how-to-send-the-result-of-svelte-preprocess-into-a-file

  const fs   = require('fs')
  const path = require('path')

  import {
    throwError,
    ValueIsEmptyString, ValueIsNonEmptyString,
    expectNonEmptyString,
  } from 'javascript-interface-library'

  type PreprocessorResult = Promise<{
    code: string,
    dependencies?: Array<string>
  }>

  type MarkupPreprocessor = (
    input:{ content:string, filename:string }
  ) => PreprocessorResult

  type ScriptPreprocessor = (
    input:{ content:string, markup:string, attributes:Record<string,string>, filename:string }
  ) => PreprocessorResult

  type StylePreprocessor = (
    input:{ content:string, markup:string, attributes:Record<string,string>, filename:string }
  ) => PreprocessorResult

  type Preprocessor = {         // see https://svelte.dev/docs#svelte_preprocess
    markup?:MarkupPreprocessor,
    script?:ScriptPreprocessor,
    style?: StylePreprocessor
  }

/**** escapedHTMLAttribute ****/

  function escapedHTMLAttribute (OriginalValue:string):string {
    return OriginalValue.replace(
      /[&<>"'\u0000-\u001F\u007F-\u009F\\]/g, function (Match) {
        switch (Match) {
          case '&':  return '&amp;'
          case '<':  return '&lt;'
          case '>':  return '&gt;'
          case '"':  return '&quot;'
          case "'":  return '&apos;'
          case '\n': return '\n'            // allows line feeds to be preserved
          case '\\': return '&#92;'
          default:   let Result = Match.charCodeAt(0).toString(16)
                     return '&#x0000'.substring(3,7-Result.length) + Result + ';'
        }
      }
    )
  }

/**** saveToFile - the actual, complete preprocessor ****/

  function saveToFile (FileName:string):Preprocessor {
    expectNonEmptyString('name of the file to save to',FileName)

    let processedMarkup:string = ''
    let processedScript:string = ''
    let processedStyle:string  = ''

  /**** processMarkup ****/

    const StylePattern  =  /\s*<style(\s[^>]*)?>[\s\S]*?<\/style>/gi  // not perfect but
    const ScriptPattern = /\s*<script(\s[^>]*)?>[\s\S]*?<\/script>/gi // saves a parser

    function processMarkup (input: { content:string }):PreprocessorResult {
      let { content } = input

      if (ValueIsNonEmptyString(content)) {
        processedMarkup += content.replace(StylePattern,'').replace(ScriptPattern,'')

        if (ValueIsEmptyString(processedMarkup)) {
          processedMarkup = ''
        } else {
          processedMarkup += '\n'
        }
      }

      return Promise.resolve({ code:content })
    }

  /**** processScript ****/

    function processScript (input: {
      attributes:Record<string,string>, content:string
    }):PreprocessorResult {
      let { attributes,content } = input

      if (ValueIsNonEmptyString(content)) {
        processedScript += '<script'
          for (let Key in attributes) {
            if (attributes.hasOwnProperty(Key) && (Key !== 'lang')) {
              processedScript += (
                ' ' + Key + '=' + escapedHTMLAttribute(attributes[Key])
              )
            }
          }
        processedScript += '>\n'
          content = content.replace(/^\s*\n/,'').replace(/\n\s*$/,'')
          processedScript += content     // w/o leading and trailing empty lines
        processedScript += '\n</script>\n'
      }
      return Promise.resolve({ code:content })
    }

  /**** processStyle ****/

    function processStyle (input: {
      attributes:Record<string,string>, content:string
    }):PreprocessorResult {
      let { attributes,content } = input

      if (ValueIsNonEmptyString(content)) {
        processedStyle += '<style'
          for (let Key in attributes) {
            if (attributes.hasOwnProperty(Key) && (Key !== 'lang')) {
              processedStyle += (
                ' ' + Key + '=' + escapedHTMLAttribute(attributes[Key])
              )
            }
          }
        processedStyle += '>\n'
          content = content.replace(/^\s*\n/,'').replace(/\n\s*$/,'')
          processedStyle += content      // w/o leading and trailing empty lines
        processedStyle += '\n</style>\n'
      }

    /**** now it's time to write anything into the given file ****/

      let completeFileName = path.join(process.cwd(),FileName)

      fs.mkdirSync(path.dirname(completeFileName),{ recursive:true })
      fs.writeFileSync(completeFileName, (
        (processedMarkup === '' ? '' : processedMarkup) +
        (processedScript === '' ? '' : processedScript) +
        (processedStyle  === '' ? '' : processedStyle)
      ))

    /**** that's it! ****/

      return Promise.resolve({ code:content })
    }

    return { markup:processMarkup, script:processScript, style:processStyle }
  }
  export default saveToFile
